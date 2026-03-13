---
slug: websockets-fastapi-production-en
title: "WebSockets with FastAPI: Shared State, Authentication, and Clean Disconnections"
date: "2025-03-13"
readTime: 10
tags: ["FastAPI", "WebSockets", "Python", "Real-time"]
excerpt: "FastAPI WebSocket tutorials all stop at the basic chat example. The real problems start after: authenticating a connection, managing a multi-client ConnectionManager, broadcasting events, and cleaning up dead connections in a multi-pod environment."
---

# WebSockets with FastAPI: Shared State, Authentication, and Clean Disconnections

The official FastAPI WebSocket tutorial fits in twenty lines. That is sufficient to understand the API, not to build something reliable. Here is what the examples do not show: authentication, distributed state management, broadcasting, and dead connection cleanup.

## The Problem with the Basic Example

```python
# What every tutorial shows
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message: {data}")
```

This code has several production problems: no authentication, no handling of unexpected disconnections, no broadcasting to other clients, and state that does not survive a pod restart.

## ConnectionManager: Handling Multiple Clients

The first step is a manager that maintains the list of active connections:

```python
import asyncio
from fastapi import WebSocket
from typing import Any
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # user_id -> list of websockets (a user may have multiple tabs open)
        self._connections: dict[str, list[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        await websocket.accept()
        async with self._lock:
            if user_id not in self._connections:
                self._connections[user_id] = []
            self._connections[user_id].append(websocket)
        logger.info(f"WebSocket connected: user={user_id}, total={self.total_connections}")

    async def disconnect(self, websocket: WebSocket, user_id: str) -> None:
        async with self._lock:
            if user_id in self._connections:
                self._connections[user_id] = [
                    ws for ws in self._connections[user_id] if ws != websocket
                ]
                if not self._connections[user_id]:
                    del self._connections[user_id]
        logger.info(f"WebSocket disconnected: user={user_id}")

    async def send_to_user(self, user_id: str, message: dict) -> None:
        """Sends a message to all connections belonging to a given user."""
        connections = self._connections.get(user_id, [])
        dead_connections = []

        for websocket in connections:
            try:
                await websocket.send_json(message)
            except Exception:
                dead_connections.append(websocket)

        for ws in dead_connections:
            await self.disconnect(ws, user_id)

    async def broadcast(self, message: dict, exclude_user: str | None = None) -> None:
        """Broadcasts a message to all connected users."""
        tasks = []
        for user_id in list(self._connections.keys()):
            if user_id != exclude_user:
                tasks.append(self.send_to_user(user_id, message))
        await asyncio.gather(*tasks, return_exceptions=True)

    @property
    def total_connections(self) -> int:
        return sum(len(ws_list) for ws_list in self._connections.values())

manager = ConnectionManager()
```

The `asyncio.Lock()` protects dictionary modifications — in Python, dict operations are not safe across concurrent coroutines. A user may have several simultaneous connections (multiple open tabs), which the `dict[str, list[WebSocket]]` structure handles natively.

## Authenticating a WebSocket Connection

This is where most implementations stumble. WebSockets do not support custom HTTP headers from the browser — it is not possible to send `Authorization: Bearer ...` in the initial handshake via the standard browser WebSocket API.

Two viable approaches:

### Approach 1: Token in the Query Parameter

```python
from fastapi import WebSocket, WebSocketException, status, Depends, Query
from app.core.security import verify_token

async def get_websocket_user(
    websocket: WebSocket,
    token: str = Query(...),
) -> str:
    """Extracts and validates the user from the query parameter token."""
    payload = verify_token(token)
    if payload is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    return payload["sub"]

@app.websocket("/ws/notifications")
async def notifications_ws(
    websocket: WebSocket,
    user_id: str = Depends(get_websocket_user),
):
    await manager.connect(websocket, user_id)
    try:
        while True:
            await websocket.receive_text()  # Keep the connection alive
    except Exception:
        await manager.disconnect(websocket, user_id)
```

On the Vue.js client side:

```typescript
// composables/useWebSocket.ts
export function useWebSocket() {
  const token = useCookie('access_token')
  const ws = ref<WebSocket | null>(null)

  const connect = () => {
    ws.value = new WebSocket(
      `wss://api.myapp.com/ws/notifications?token=${token.value}`
    )
    ws.value.onmessage = (event) => {
      const message = JSON.parse(event.data)
      handleMessage(message)
    }
    ws.value.onclose = () => {
      // Automatic reconnection after 3 seconds
      setTimeout(connect, 3000)
    }
  }

  onMounted(connect)
  onUnmounted(() => ws.value?.close())

  return { ws }
}
```

### Approach 2: Session Cookie (More Secure)

If you are using the BFF pattern with HttpOnly cookies, the WebSocket connection automatically sends the domain cookies — this is the browser's native behaviour:

```python
@app.websocket("/ws/notifications")
async def notifications_ws(
    websocket: WebSocket,
    session: dict = Depends(get_websocket_session),
):
    user_id = session["user_id"]
    await manager.connect(websocket, user_id)
    # ...

async def get_websocket_session(websocket: WebSocket) -> dict:
    session_id = websocket.cookies.get("session_id")
    if not session_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

    session = await session_manager.get_session_by_id(session_id)
    if not session:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

    return session
```

The cookie approach is preferable on a BFF — the token never appears in plaintext in the URL, which would otherwise be visible in server logs.

## Handling Unexpected Disconnections Cleanly

A WebSocket connection can die in several ways: the user closes the tab, the network drops, the client pod restarts. These cases must be detected and cleaned up:

```python
@app.websocket("/ws/notifications")
async def notifications_ws(
    websocket: WebSocket,
    user_id: str = Depends(get_websocket_user),
):
    await manager.connect(websocket, user_id)
    try:
        while True:
            try:
                # Timeout on receive — detects dead connections
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30.0
                )
                await handle_client_message(user_id, data)

            except asyncio.TimeoutError:
                # Send a ping to verify the client is still alive
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break  # Dead connection — exit the loop

    except Exception as e:
        logger.info(f"WebSocket closed for user={user_id}: {type(e).__name__}")
    finally:
        # Cleanup guaranteed regardless of how the connection ended
        await manager.disconnect(websocket, user_id)
```

The `try/finally` pattern around the main loop guarantees that `disconnect` is always called, regardless of the reason for closure.

## Broadcasting Events From Anywhere in the Application

The real use case: a backend process completes and needs to notify connected clients in real time.

```python
class CertificateService:
    def __init__(self, repo: CertificateRepository, ws_manager: ConnectionManager):
        self.repo = repo
        self.ws_manager = ws_manager

    async def process_certificate(self, cert_id: str, user_id: str) -> Certificate:
        certificate = await self.repo.process(cert_id)

        # Notify the user in real time
        await self.ws_manager.send_to_user(user_id, {
            "type": "certificate_processed",
            "data": {
                "id": certificate.id,
                "status": certificate.status,
                "volume": certificate.volume,
            }
        })

        return certificate
```

The `ConnectionManager` is injected as a FastAPI dependency — a singleton shared across the entire process:

```python
# app/api/dependencies.py
from app.api.websockets import manager

def get_ws_manager() -> ConnectionManager:
    return manager
```

## The Multi-Pod Problem: Distributed State with Redis Pub/Sub

The `ConnectionManager` as described above has a critical limitation: it is in-memory. On a multi-pod OpenShift deployment with three replicas, each pod has its own manager. An event processed on pod A will not be broadcast to clients connected to pod B or C.

The solution: Redis Pub/Sub as an inter-pod event bus.

```python
import redis.asyncio as aioredis
import json
import asyncio

class DistributedConnectionManager(ConnectionManager):
    def __init__(self, redis: aioredis.Redis):
        super().__init__()
        self.redis = redis
        self.channel = "ws:broadcast"

    async def publish_to_user(self, user_id: str, message: dict) -> None:
        """Publishes an event to Redis — all pods receive it."""
        await self.redis.publish(
            f"ws:user:{user_id}",
            json.dumps(message)
        )

    async def publish_broadcast(self, message: dict) -> None:
        """Publishes a broadcast to Redis."""
        await self.redis.publish(self.channel, json.dumps(message))

    async def start_subscriber(self) -> None:
        """To be started at pod startup — listens for Redis events."""
        pubsub = self.redis.pubsub()
        await pubsub.psubscribe("ws:user:*", self.channel)

        async for message in pubsub.listen():
            if message["type"] != "pmessage" and message["type"] != "message":
                continue

            channel = message["channel"].decode()
            data = json.loads(message["data"])

            if channel == self.channel:
                # Local broadcast to clients on THIS pod
                await super().broadcast(data)
            elif channel.startswith("ws:user:"):
                user_id = channel.split(":")[-1]
                # Send to clients on THIS pod for this user
                await super().send_to_user(user_id, data)
```

Starting the subscriber in the FastAPI `lifespan`:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(distributed_manager.start_subscriber())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)

    yield

    task.cancel()
    await asyncio.gather(task, return_exceptions=True)
```

With this architecture, a service on pod A calls `publish_to_user()` — Redis propagates the event to all pods, and each pod delivers it locally to the relevant clients.

## Key Takeaways

Production-grade WebSockets require solving four distinct problems: authentication (cookie or query parameter depending on the architecture), dead connection handling (ping/timeout with `try/finally`), broadcasting to multiple connections per user (`list[WebSocket]` per `user_id`), and multi-pod distribution (Redis Pub/Sub). Each problem is straightforward in isolation — it is their combination that determines whether a WebSocket implementation holds up under real-world conditions.
