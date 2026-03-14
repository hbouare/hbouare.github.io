---
slug: pattern-bff
title: "BFF Pattern avec FastAPI : mettre un backend devant ton frontend"
date: "2025-02-13"
readTime: 9
tags: ["FastAPI", "Vue.js", "Azure B2C", "Architecture", "OAuth2"]
excerpt: "Le pattern Backend-for-Frontend consiste à intercaler un serveur entre le navigateur et les APIs métier. Appliqué à Vue.js + Azure B2C, il résout élégamment la gestion des tokens OAuth2 tout en renforçant la sécurité — au prix d'une complexité assumée."
---

# BFF Pattern avec FastAPI : mettre un backend devant ton frontend

Le pattern Backend-for-Frontend (BFF) n'est pas nouveau — Netflix, SoundCloud et d'autres l'ont popularisé il y a plus d'une décennie. Pourtant, il reste sous-utilisé dans les architectures Vue.js + FastAPI, où la tendance est de gérer les tokens OAuth2 directement côté client. Voici pourquoi ce choix est risqué, et comment le BFF le résout.

## Le problème avec les tokens côté client

Dans une SPA Vue.js classique avec Azure B2C, le flux OAuth2 aboutit à un `access_token` stocké quelque part côté navigateur : `localStorage`, `sessionStorage`, ou un cookie. Chacune de ces options a ses limites :

- **localStorage** — accessible par tout JavaScript sur le domaine, vulnérable aux attaques XSS
- **sessionStorage** — mêmes problèmes, disparaît à la fermeture de l'onglet
- **Cookie HttpOnly** — meilleure option côté client, mais le refresh token doit toujours être géré

Le vrai problème : le `client_secret` Azure B2C ne peut pas être embarqué dans une SPA. L'échange de code OAuth2 (`authorization_code` → `access_token`) doit se faire côté serveur. Sans BFF, soit on sacrifie la sécurité, soit on complexifie le frontend avec du PKCE et des workarounds.

## Architecture BFF

```
Navigateur (Vue.js)
        │
        │  Cookie de session (HttpOnly, Secure)
        ▼
  FastAPI BFF
        │
        ├─── Redis (sessions chiffrées + tokens OAuth2)
        │
        └─── Azure B2C (échange de codes, refresh de tokens)
                │
                └─── APIs métier (avec access_token en Bearer)
```

Le navigateur ne voit jamais de token OAuth2. Il n'échange qu'un cookie de session opaque avec le BFF. C'est le BFF qui détient les tokens et les injecte dans les requêtes vers les APIs métier.

## Implémentation FastAPI

### Gestion de session avec Redis

```python
import json
import secrets
from datetime import timedelta
from cryptography.fernet import Fernet
import redis.asyncio as aioredis
from fastapi import Request, Response

class SessionManager:
    def __init__(self, redis: aioredis.Redis, secret_key: bytes):
        self.redis = redis
        self.fernet = Fernet(secret_key)
        self.session_ttl = 3600  # 1 heure

    def _session_key(self, session_id: str) -> str:
        return f"bff:session:{session_id}"

    async def create_session(self, response: Response, data: dict) -> str:
        session_id = secrets.token_urlsafe(32)
        encrypted = self.fernet.encrypt(json.dumps(data).encode())
        await self.redis.setex(
            self._session_key(session_id),
            self.session_ttl,
            encrypted
        )
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=self.session_ttl
        )
        return session_id

    async def get_session(self, request: Request) -> dict | None:
        session_id = request.cookies.get("session_id")
        if not session_id:
            return None
        raw = await self.redis.get(self._session_key(session_id))
        if not raw:
            return None
        return json.loads(self.fernet.decrypt(raw))
```

### Callback OAuth2 Azure B2C

```python
from fastapi import APIRouter, Request, Response
from httpx import AsyncClient

router = APIRouter()

@router.get("/auth/callback")
async def oauth_callback(
    request: Request,
    response: Response,
    code: str,
    state: str,
):
    # Échange du code contre les tokens — côté serveur uniquement
    async with AsyncClient() as client:
        token_response = await client.post(
            f"https://{settings.b2c_tenant}.b2clogin.com/"
            f"{settings.b2c_tenant}.onmicrosoft.com/"
            f"{settings.b2c_policy}/oauth2/v2.0/token",
            data={
                "grant_type": "authorization_code",
                "client_id": settings.client_id,
                "client_secret": settings.client_secret,  # Jamais exposé au navigateur
                "code": code,
                "redirect_uri": settings.redirect_uri,
            }
        )

    tokens = token_response.json()
    await session_manager.create_session(response, {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "expires_at": time.time() + tokens["expires_in"]
    })

    return RedirectResponse(url="/")
```

### Proxy vers les APIs métier

```python
@router.get("/api/{path:path}")
async def proxy(request: Request, path: str):
    session = await session_manager.get_session(request)
    if not session:
        raise HTTPException(status_code=401)

    # Refresh automatique si le token est expiré
    if time.time() > session["expires_at"] - 60:
        session = await token_refresher.refresh(session)

    async with AsyncClient() as client:
        response = await client.request(
            method=request.method,
            url=f"{settings.api_base_url}/{path}",
            headers={"Authorization": f"Bearer {session['access_token']}"},
            content=await request.body(),
        )

    return Response(
        content=response.content,
        status_code=response.status_code,
        media_type=response.headers.get("content-type")
    )
```

## Verrou distribué pour le refresh de token

En environnement multi-pods, plusieurs workers peuvent tenter de rafraîchir le même token simultanément. Un verrou Redis évite les doublons :

```python
async def refresh(self, session: dict) -> dict:
    lock_key = f"bff:lock:refresh:{session['user_id']}"

    async with self.redis.lock(lock_key, timeout=10, blocking_timeout=8):
        # Re-lire la session : peut-être déjà rafraîchie par un autre pod
        fresh = await self.session_manager.get_session_by_user(session["user_id"])
        if time.time() < fresh["expires_at"] - 60:
            return fresh  # Déjà rafraîchi, rien à faire

        # Effectuer le refresh
        async with AsyncClient() as client:
            response = await client.post(
                f"{settings.token_endpoint}",
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": fresh["refresh_token"],
                    "client_id": settings.client_id,
                    "client_secret": settings.client_secret,
                }
            )
        new_tokens = response.json()
        updated_session = {**fresh, **new_tokens, "expires_at": time.time() + new_tokens["expires_in"]}
        await self.session_manager.update_session(updated_session)
        return updated_session
```

## Ce que le BFF apporte

| Aspect                    | Sans BFF                    | Avec BFF                    |
| ------------------------- | --------------------------- | --------------------------- |
| Tokens dans le navigateur | Oui (localStorage / cookie) | Non — jamais exposés        |
| `client_secret`           | Absent (PKCE requis)        | Côté serveur uniquement     |
| Refresh token             | Géré par le frontend        | Géré par le BFF avec verrou |
| Surface d'attaque XSS     | Tokens accessibles          | Cookie opaque uniquement    |
| Complexité                | Frontend complexe           | Backend supplémentaire      |

Le BFF n'est pas la solution universelle. Sur une application publique sans données sensibles, PKCE côté client est suffisant et plus simple à opérer. Mais dès que l'on gère des tokens avec des droits élevés, des scopes sensibles, ou des intégrations multi-APIs, le BFF est l'architecture la plus défendable.
