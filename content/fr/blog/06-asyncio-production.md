---
slug: asyncio-production
title: "asyncio en production : les pièges que les tutos ne montrent pas"
date: "2025-03-13"
readTime: 9
tags: ["Python", "asyncio", "FastAPI", "Concurrence"]
excerpt: "gather, TaskGroup, gestion des exceptions dans les tâches concurrentes, shutdown propre — ce que les tutoriels asyncio ne couvrent jamais, et ce que ça donne sur une vraie application FastAPI en production."
---

# asyncio en production : les pièges que les tutos ne montrent pas

Les tutoriels asyncio s'arrêtent presque toujours au même endroit : `await asyncio.gather(task1(), task2())`, quelques exemples de coroutines, et c'est tout. En production, la réalité est plus nuancée. Les exceptions silencieuses, les tâches qui ne se terminent jamais, les shutdowns qui bloquent — voici les problèmes réels et comment les résoudre.

## Le problème avec `asyncio.gather` et les exceptions

Le comportement par défaut de `gather` est contre-intuitif :

```python
import asyncio

async def task_ok():
    await asyncio.sleep(1)
    return "ok"

async def task_fail():
    await asyncio.sleep(0.5)
    raise ValueError("quelque chose a mal tourné")

async def main():
    results = await asyncio.gather(task_ok(), task_fail())
    print(results)  # Ne sera jamais atteint

asyncio.run(main())
# ValueError: quelque chose a mal tourné
# task_ok() a été annulé silencieusement
```

`gather` lève la première exception et annule les autres tâches sans avertissement. Si `task_ok()` écrivait dans une base de données, le résultat est partiellement appliqué.

La solution : `return_exceptions=True` pour collecter toutes les exceptions sans interrompre les autres tâches :

```python
async def main():
    results = await asyncio.gather(
        task_ok(),
        task_fail(),
        return_exceptions=True
    )
    for result in results:
        if isinstance(result, Exception):
            logger.error(f"Tâche échouée : {result}")
        else:
            logger.info(f"Résultat : {result}")
```

## TaskGroup : la meilleure API depuis Python 3.11

Python 3.11 a introduit `asyncio.TaskGroup`, qui corrige le comportement de `gather` de façon structurée :

```python
async def main():
    results = []
    try:
        async with asyncio.TaskGroup() as tg:
            t1 = tg.create_task(task_ok())
            t2 = tg.create_task(task_fail())
    except* ValueError as eg:
        for exc in eg.exceptions:
            logger.error(f"Erreur : {exc}")

    # t1 et t2 sont garantis terminés ici
    if not t1.cancelled():
        results.append(t1.result())
```

`TaskGroup` utilise la syntaxe `except*` (ExceptionGroup) — toutes les exceptions sont collectées, et le groupe attend que toutes les tâches soient terminées ou annulées avant de propager. Plus de tâches fantômes.

## Les tâches en arrière-plan dans FastAPI

Un pattern courant dans FastAPI : lancer une tâche en arrière-plan avec `asyncio.create_task`. Le piège classique :

```python
# MAUVAIS — la tâche peut être garbage-collectée silencieusement
@app.post("/process")
async def process(data: dict):
    asyncio.create_task(long_running_task(data))  # Référence perdue
    return {"status": "started"}
```

asyncio ne maintient pas de référence forte aux tâches créées avec `create_task`. Si le garbage collector passe au bon moment, la tâche est annulée silencieusement.

La bonne approche :

```python
# Dans le state de l'application
background_tasks: set[asyncio.Task] = set()

@app.post("/process")
async def process(data: dict):
    task = asyncio.create_task(long_running_task(data))
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)  # Nettoyage automatique
    return {"status": "started"}
```

`add_done_callback` retire la tâche du set quand elle se termine — pas de fuite mémoire, pas de tâche annulée silencieusement.

## Timeout sur les opérations réseau

Sans timeout explicite, une opération réseau peut bloquer une coroutine indéfiniment :

```python
import asyncio
from httpx import AsyncClient

# MAUVAIS — peut bloquer pour toujours
async def fetch_data(url: str) -> dict:
    async with AsyncClient() as client:
        response = await client.get(url)
        return response.json()

# BON — timeout explicite
async def fetch_data(url: str, timeout: float = 10.0) -> dict:
    try:
        async with asyncio.timeout(timeout):  # Python 3.11+
            async with AsyncClient() as client:
                response = await client.get(url)
                return response.json()
    except asyncio.TimeoutError:
        logger.error(f"Timeout après {timeout}s sur {url}")
        raise
```

`asyncio.timeout()` (Python 3.11+) est plus propre que `asyncio.wait_for()` pour les blocs de code, car il s'intègre dans un context manager et annule proprement toutes les opérations imbriquées.

## Shutdown propre dans FastAPI

Un problème sous-estimé : quand FastAPI reçoit SIGTERM (arrêt d'un pod Kubernetes, redéploiement), les tâches en cours doivent se terminer proprement.

```python
from contextlib import asynccontextmanager
import asyncio

background_tasks: set[asyncio.Task] = set()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown — attendre les tâches en cours
    if background_tasks:
        logger.info(f"Attente de {len(background_tasks)} tâches en cours...")
        await asyncio.gather(*background_tasks, return_exceptions=True)
        logger.info("Toutes les tâches terminées.")

app = FastAPI(lifespan=lifespan)
```

Le `lifespan` context manager remplace les dépréciés `@app.on_event("startup")` et `@app.on_event("shutdown")`. Le `yield` sépare les phases de démarrage et d'arrêt.

## Éviter le blocage de la boucle d'événements

asyncio est monothreadé. Un appel synchrone bloquant dans une coroutine bloque toute l'application :

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

# MAUVAIS — bloque la boucle d'événements
async def process_file(path: str) -> str:
    with open(path) as f:
        return f.read()  # I/O synchrone dans une coroutine

# BON — délègue au thread pool
async def process_file(path: str) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        executor,
        lambda: open(path).read()
    )

# Encore mieux — aiofiles pour l'I/O fichier
import aiofiles

async def process_file(path: str) -> str:
    async with aiofiles.open(path) as f:
        return await f.read()
```

La règle : toute opération qui prend plus de quelques millisecondes et n'est pas nativement async doit passer par `run_in_executor` ou une bibliothèque async dédiée.

## Déboguer les coroutines qui ne s'exécutent jamais

Un piège fréquent pour les débutants asyncio :

```python
async def my_coroutine():
    print("exécuté")

# MAUVAIS — crée un objet coroutine sans l'exécuter
my_coroutine()
# RuntimeWarning: coroutine 'my_coroutine' was never awaited

# BON
await my_coroutine()
# ou
asyncio.run(my_coroutine())
```

Activer le mode debug d'asyncio détecte ces erreurs et d'autres anomalies :

```python
import asyncio
import logging

logging.basicConfig(level=logging.DEBUG)
asyncio.run(main(), debug=True)
```

En mode debug, asyncio logue les coroutines non attendues, les tâches qui prennent plus de 100ms (signe d'un blocage de la boucle), et les ressources non fermées proprement.

## Ce qu'il faut retenir

asyncio est puissant mais ses comportements par défaut sont parfois surprenants. Les points clés : utiliser `TaskGroup` plutôt que `gather` sur Python 3.11+, toujours maintenir une référence aux tâches créées avec `create_task`, ajouter des timeouts explicites sur toutes les opérations réseau, et gérer le shutdown proprement dans le `lifespan` FastAPI. Ces quatre pratiques couvrent l'essentiel des problèmes rencontrés en production.
