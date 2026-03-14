---
slug: websockets-fastapi
title: "WebSockets : état partagé, authentification et déconnexions"
date: "2025-03-13"
readTime: 10
tags: ["FastAPI", "WebSockets", "Python", "Temps réel"]
excerpt: "Les tutos WebSocket FastAPI s'arrêtent tous au chat basique. Les vrais problèmes commencent après : authentifier une connexion, gérer un ConnectionManager multi-clients, broadcaster des événements, et nettoyer les connexions mortes en environnement multi-pods."
---

# WebSockets avec FastAPI : état partagé, authentification et déconnexions propres

Le tutoriel officiel FastAPI sur les WebSockets tient en vingt lignes. C'est suffisant pour comprendre l'API, pas pour construire quelque chose de fiable. Voici ce que les exemples ne montrent pas : authentification, gestion d'état distribuée, broadcasting, et nettoyage des connexions mortes.

## Le problème avec l'exemple basique

```python
# Ce qu'on voit dans tous les tutos
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message: {data}")
```

Ce code a plusieurs problèmes en production : aucune authentification, aucune gestion des déconnexions inattendues, pas de broadcasting vers d'autres clients, et un état qui ne survit pas à un redémarrage du pod.

## ConnectionManager : gérer plusieurs clients

La première étape est un manager qui maintient la liste des connexions actives :

```python
import asyncio
from fastapi import WebSocket
from typing import Any
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # user_id -> liste de websockets (un user peut avoir plusieurs onglets)
        self._connections: dict[str, list[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        await websocket.accept()
        async with self._lock:
            if user_id not in self._connections:
                self._connections[user_id] = []
            self._connections[user_id].append(websocket)
        logger.info(f"WebSocket connecté : user={user_id}, total={self.total_connections}")

    async def disconnect(self, websocket: WebSocket, user_id: str) -> None:
        async with self._lock:
            if user_id in self._connections:
                self._connections[user_id] = [
                    ws for ws in self._connections[user_id] if ws != websocket
                ]
                if not self._connections[user_id]:
                    del self._connections[user_id]
        logger.info(f"WebSocket déconnecté : user={user_id}")

    async def send_to_user(self, user_id: str, message: dict) -> None:
        """Envoie un message à toutes les connexions d'un utilisateur."""
        connections = self._connections.get(user_id, [])
        dead_connections = []

        for websocket in connections:
            try:
                await websocket.send_json(message)
            except Exception:
                dead_connections.append(websocket)

        # Nettoyer les connexions mortes
        for ws in dead_connections:
            await self.disconnect(ws, user_id)

    async def broadcast(self, message: dict, exclude_user: str | None = None) -> None:
        """Diffuse un message à tous les utilisateurs connectés."""
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

Le `asyncio.Lock()` protège les modifications du dictionnaire — en Python, les opérations sur les dicts ne sont pas thread-safe dans un contexte async avec des coroutines concurrentes. Un user peut avoir plusieurs connexions simultanées (plusieurs onglets), ce que la structure `dict[str, list[WebSocket]]` gère nativement.

## Authentification d'une connexion WebSocket

C'est là que la plupart des implémentations butent. Les WebSockets ne supportent pas les headers HTTP personnalisés depuis le navigateur — impossible d'envoyer un `Authorization: Bearer ...` dans la handshake initiale via l'API browser standard.

Deux approches viables :

### Approche 1 : token dans le query parameter

```python
from fastapi import WebSocket, WebSocketException, status, Depends, Query
from app.core.security import verify_token

async def get_websocket_user(
    websocket: WebSocket,
    token: str = Query(...),
) -> str:
    """Extrait et valide l'utilisateur depuis le token en query param."""
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
            await websocket.receive_text()  # Maintenir la connexion ouverte
    except Exception:
        await manager.disconnect(websocket, user_id)
```

Côté client Vue.js :

```typescript
// composables/useWebSocket.ts
export function useWebSocket() {
  const token = useCookie("access_token")
  const ws = ref<WebSocket | null>(null)

  const connect = () => {
    ws.value = new WebSocket(
      `wss://api.monapp.fr/ws/notifications?token=${token.value}`,
    )
    ws.value.onmessage = (event) => {
      const message = JSON.parse(event.data)
      handleMessage(message)
    }
    ws.value.onclose = () => {
      // Reconnexion automatique après 3 secondes
      setTimeout(connect, 3000)
    }
  }

  onMounted(connect)
  onUnmounted(() => ws.value?.close())

  return { ws }
}
```

### Approche 2 : cookie de session (plus sécurisée)

Si tu utilises le BFF pattern avec des cookies HttpOnly, la connexion WebSocket envoie automatiquement les cookies du domaine — c'est le comportement natif du navigateur :

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

L'approche cookie est préférable sur un BFF — le token ne transite jamais en clair dans l'URL (ce qui apparaîtrait dans les logs serveur).

## Gestion propre des déconnexions inattendues

Une connexion WebSocket peut mourir de plusieurs façons : l'utilisateur ferme l'onglet, le réseau se coupe, le pod client redémarre. Il faut détecter et nettoyer ces cas :

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
                # Timeout sur receive : détecte les connexions mortes
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30.0
                )
                # Gérer les messages entrants si nécessaire
                await handle_client_message(user_id, data)

            except asyncio.TimeoutError:
                # Envoyer un ping pour vérifier que le client est vivant
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break  # Connexion morte, sortir de la boucle

    except Exception as e:
        logger.info(f"WebSocket fermé pour user={user_id} : {type(e).__name__}")
    finally:
        # Nettoyage garanti même en cas d'exception
        await manager.disconnect(websocket, user_id)
```

Le pattern `try/finally` autour de la boucle principale garantit que `disconnect` est toujours appelé, quelle que soit la raison de la fermeture.

## Broadcaster des événements depuis n'importe où dans l'app

Le cas d'usage réel : un traitement backend se termine et doit notifier les clients connectés en temps réel.

```python
# Dans un service métier
class CertificateService:
    def __init__(self, repo: CertificateRepository, ws_manager: ConnectionManager):
        self.repo = repo
        self.ws_manager = ws_manager

    async def process_certificate(self, cert_id: str, user_id: str) -> Certificate:
        certificate = await self.repo.process(cert_id)

        # Notifier l'utilisateur en temps réel
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

Le `ConnectionManager` est injecté comme dépendance FastAPI — un singleton partagé sur tout le processus :

```python
# app/api/dependencies.py
from app.api.websockets import manager

def get_ws_manager() -> ConnectionManager:
    return manager
```

## Le problème multi-pods : état distribué avec Redis Pub/Sub

Le `ConnectionManager` tel qu'il est décrit ci-dessus a une limite critique : il est en mémoire. Sur un déploiement multi-pods OpenShift avec 3 replicas, chaque pod a son propre manager. Un événement traité par le pod A ne sera pas broadcasté aux clients connectés sur le pod B ou C.

La solution : Redis Pub/Sub comme bus d'événements inter-pods.

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
        """Publie un événement sur Redis — tous les pods le reçoivent."""
        await self.redis.publish(
            f"ws:user:{user_id}",
            json.dumps(message)
        )

    async def publish_broadcast(self, message: dict) -> None:
        """Publie un broadcast sur Redis."""
        await self.redis.publish(self.channel, json.dumps(message))

    async def start_subscriber(self) -> None:
        """À lancer au démarrage du pod — écoute les événements Redis."""
        pubsub = self.redis.pubsub()
        await pubsub.psubscribe("ws:user:*", self.channel)

        async for message in pubsub.listen():
            if message["type"] != "pmessage" and message["type"] != "message":
                continue

            channel = message["channel"].decode()
            data = json.loads(message["data"])

            if channel == self.channel:
                # Broadcast local vers les clients de CE pod
                await super().broadcast(data)
            elif channel.startswith("ws:user:"):
                user_id = channel.split(":")[-1]
                # Envoyer aux clients de CE pod pour cet user
                await super().send_to_user(user_id, data)
```

Démarrage du subscriber dans le `lifespan` FastAPI :

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Démarrer l'écoute Redis en arrière-plan
    task = asyncio.create_task(distributed_manager.start_subscriber())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)

    yield

    task.cancel()
    await asyncio.gather(task, return_exceptions=True)
```

Avec cette architecture, un service sur le pod A appelle `publish_to_user()` — Redis propage l'événement à tous les pods, et chaque pod le délivre localement aux clients concernés.

## Ce qu'il faut retenir

Les WebSockets en production nécessitent de résoudre quatre problèmes distincts : l'authentification (cookie ou query param selon l'architecture), la gestion des connexions mortes (ping/timeout + try/finally), le broadcasting vers plusieurs clients d'un même user (liste de WebSockets par user_id), et la distribution multi-pods (Redis Pub/Sub). Chacun de ces problèmes est trivial pris séparément — c'est leur combinaison qui fait la solidité d'une implémentation production.
