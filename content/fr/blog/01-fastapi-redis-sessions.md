---
slug: fastapi-redis-sessions
title: "Sessions sécurisées avec FastAPI et Redis"
date: "2025-02-10"
readTime: 8
tags: ["FastAPI", "Redis", "Python", "Sécurité"]
excerpt: "Comment implémenter des sessions OAuth2 chiffrées avec Fernet dans FastAPI, avec Redis comme backend distribué et un verrou distribué pour éviter les race conditions."
---

# Sessions sécurisées avec FastAPI et Redis

Dans le cadre du développement du Registre des Garanties d'Origine chez EDF, j'ai eu besoin de mettre en place un système de sessions robuste pour gérer les tokens OAuth2 Azure B2C côté serveur.

## Le problème

Stocker les tokens d'accès côté client (localStorage, cookies) présente des risques de sécurité. La solution : les stocker côté serveur dans Redis, chiffrés avec Fernet.

## Architecture

```python
from cryptography.fernet import Fernet
import redis.asyncio as redis

class SessionManager:
    def __init__(self, redis_client: redis.Redis, secret_key: bytes):
        self.redis = redis_client
        self.fernet = Fernet(secret_key)
    
    async def store_token(self, session_id: str, token: dict, ttl: int = 3600):
        encrypted = self.fernet.encrypt(json.dumps(token).encode())
        await self.redis.setex(f"session:{session_id}", ttl, encrypted)
    
    async def get_token(self, session_id: str) -> dict | None:
        data = await self.redis.get(f"session:{session_id}")
        if not data:
            return None
        return json.loads(self.fernet.decrypt(data))
```

## Verrou distribué

Pour éviter les race conditions lors du refresh de token :

```python
async def refresh_with_lock(self, session_id: str):
    lock_key = f"lock:refresh:{session_id}"
    async with self.redis.lock(lock_key, timeout=10):
        # Vérifier si déjà rafraîchi par un autre worker
        current = await self.get_token(session_id)
        if not self.is_expired(current):
            return current
        # Effectuer le refresh...
```

Cette approche garantit qu'en environnement multi-pods OpenShift, un seul pod effectue le refresh.
