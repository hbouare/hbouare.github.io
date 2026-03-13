---
slug: asyncio-production-pitfalls-en
title: "asyncio in Production: The Pitfalls Tutorials Never Cover"
date: "2025-03-13"
readTime: 9
tags: ["Python", "asyncio", "FastAPI", "Concurrency"]
excerpt: "gather, TaskGroup, exception handling in concurrent tasks, clean shutdown — what asyncio tutorials never address, and what it looks like in a real FastAPI application running in production."
---

# asyncio in Production: The Pitfalls Tutorials Never Cover

asyncio tutorials almost invariably stop at the same point: `await asyncio.gather(task1(), task2())`, a handful of coroutine examples, and nothing further. Production is more demanding. Silent exceptions, tasks that never complete, shutdowns that hang — here are the real problems and how to address them.

## The Problem with `asyncio.gather` and Exceptions

The default behaviour of `gather` is counterintuitive:

```python
import asyncio

async def task_ok():
    await asyncio.sleep(1)
    return "ok"

async def task_fail():
    await asyncio.sleep(0.5)
    raise ValueError("something went wrong")

async def main():
    results = await asyncio.gather(task_ok(), task_fail())
    print(results)  # Never reached

asyncio.run(main())
# ValueError: something went wrong
# task_ok() was silently cancelled
```

`gather` raises the first exception and cancels the remaining tasks without any warning. If `task_ok()` was writing to a database, the result is partially committed.

The solution: `return_exceptions=True` collects all exceptions without interrupting sibling tasks:

```python
async def main():
    results = await asyncio.gather(
        task_ok(),
        task_fail(),
        return_exceptions=True
    )
    for result in results:
        if isinstance(result, Exception):
            logger.error(f"Task failed: {result}")
        else:
            logger.info(f"Result: {result}")
```

## TaskGroup: The Better API Since Python 3.11

Python 3.11 introduced `asyncio.TaskGroup`, which corrects `gather`'s behaviour in a structured way:

```python
async def main():
    results = []
    try:
        async with asyncio.TaskGroup() as tg:
            t1 = tg.create_task(task_ok())
            t2 = tg.create_task(task_fail())
    except* ValueError as eg:
        for exc in eg.exceptions:
            logger.error(f"Error: {exc}")

    # t1 and t2 are guaranteed to be complete here
    if not t1.cancelled():
        results.append(t1.result())
```

`TaskGroup` uses the `except*` syntax (ExceptionGroup) — all exceptions are collected, and the group waits for every task to finish or be cancelled before propagating. No more phantom tasks.

## Background Tasks in FastAPI

A common FastAPI pattern is launching background work with `asyncio.create_task`. The classic pitfall:

```python
# WRONG — the task can be silently garbage-collected
@app.post("/process")
async def process(data: dict):
    asyncio.create_task(long_running_task(data))  # Reference lost
    return {"status": "started"}
```

asyncio does not hold a strong reference to tasks created with `create_task`. If the garbage collector runs at the right moment, the task is silently cancelled.

The correct approach:

```python
# In the application state
background_tasks: set[asyncio.Task] = set()

@app.post("/process")
async def process(data: dict):
    task = asyncio.create_task(long_running_task(data))
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)  # Automatic cleanup
    return {"status": "started"}
```

`add_done_callback` removes the task from the set when it completes — no memory leak, no silent cancellation.

## Timeouts on Network Operations

Without an explicit timeout, a network operation can suspend a coroutine indefinitely:

```python
import asyncio
from httpx import AsyncClient

# WRONG — can block forever
async def fetch_data(url: str) -> dict:
    async with AsyncClient() as client:
        response = await client.get(url)
        return response.json()

# CORRECT — explicit timeout
async def fetch_data(url: str, timeout: float = 10.0) -> dict:
    try:
        async with asyncio.timeout(timeout):  # Python 3.11+
            async with AsyncClient() as client:
                response = await client.get(url)
                return response.json()
    except asyncio.TimeoutError:
        logger.error(f"Timed out after {timeout}s on {url}")
        raise
```

`asyncio.timeout()` (Python 3.11+) is cleaner than `asyncio.wait_for()` for code blocks: it integrates naturally as a context manager and cleanly cancels all nested operations when the timeout fires.

## Clean Shutdown in FastAPI

An underappreciated problem: when FastAPI receives SIGTERM — a Kubernetes pod termination, a redeployment — in-progress tasks must complete cleanly.

```python
from contextlib import asynccontextmanager
import asyncio

background_tasks: set[asyncio.Task] = set()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown — wait for in-progress tasks
    if background_tasks:
        logger.info(f"Waiting for {len(background_tasks)} task(s) to complete...")
        await asyncio.gather(*background_tasks, return_exceptions=True)
        logger.info("All tasks completed.")

app = FastAPI(lifespan=lifespan)
```

The `lifespan` context manager replaces the deprecated `@app.on_event("startup")` and `@app.on_event("shutdown")` hooks. The `yield` cleanly separates the startup and shutdown phases.

## Avoiding Event Loop Blockage

asyncio is single-threaded. A synchronous blocking call inside a coroutine blocks the entire application:

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

# WRONG — blocks the event loop
async def process_file(path: str) -> str:
    with open(path) as f:
        return f.read()  # Synchronous I/O inside a coroutine

# CORRECT — delegate to the thread pool
async def process_file(path: str) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        executor,
        lambda: open(path).read()
    )

# Better still — aiofiles for file I/O
import aiofiles

async def process_file(path: str) -> str:
    async with aiofiles.open(path) as f:
        return await f.read()
```

The rule: any operation that takes more than a few milliseconds and is not natively async must be offloaded via `run_in_executor` or a dedicated async library.

## Debugging Coroutines That Never Execute

A common beginner pitfall:

```python
async def my_coroutine():
    print("executed")

# WRONG — creates a coroutine object without executing it
my_coroutine()
# RuntimeWarning: coroutine 'my_coroutine' was never awaited

# CORRECT
await my_coroutine()
# or
asyncio.run(my_coroutine())
```

Enabling asyncio's debug mode surfaces this and other anomalies:

```python
import asyncio
import logging

logging.basicConfig(level=logging.DEBUG)
asyncio.run(main(), debug=True)
```

In debug mode, asyncio logs unawaited coroutines, tasks that take longer than 100ms to execute (a sign of event loop blockage), and resources that are not properly closed.

## Key Takeaways

asyncio is powerful, but its default behaviours are occasionally surprising. The essentials: use `TaskGroup` over `gather` on Python 3.11+, always maintain a strong reference to tasks created with `create_task`, add explicit timeouts to all network operations, and handle shutdown cleanly in FastAPI's `lifespan`. These four practices address the vast majority of production issues encountered with asyncio.
