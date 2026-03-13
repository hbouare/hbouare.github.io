---
slug: bff-pattern-bff
title: "The BFF Pattern with FastAPI: Backend-for-Frontend"
date: "2025-03-13"
readTime: 9
tags: ["FastAPI", "Vue.js", "Azure B2C", "Architecture", "OAuth2"]
excerpt: "The Backend-for-Frontend pattern places a dedicated server between the browser and your downstream APIs. Applied to a Vue.js and Azure B2C stack, it resolves OAuth2 token management cleanly and substantially reduces the client-side attack surface — at the cost of an additional service to operate."
---

# The BFF Pattern with FastAPI: Putting a Backend in Front of Your Frontend

The Backend-for-Frontend (BFF) pattern is not new — Netflix, SoundCloud, and others popularised it over a decade ago. Yet it remains underused in Vue.js and FastAPI architectures, where the prevailing tendency is to handle OAuth2 tokens directly in the browser. Here is why that is a risky trade-off, and how the BFF pattern addresses it.

## The Problem with Client-Side Tokens

In a standard Vue.js single-page application with Azure B2C, the OAuth2 flow terminates with an `access_token` stored somewhere in the browser: `localStorage`, `sessionStorage`, or a cookie. Each of these options carries limitations:

- **localStorage** — readable by any JavaScript executing on the domain; directly exposed to XSS attacks
- **sessionStorage** — same vulnerabilities; discarded when the tab is closed
- **HttpOnly cookie** — the most defensible client-side option, yet token refresh still requires server-side coordination

The deeper issue is structural: the Azure B2C `client_secret` cannot be embedded in a single-page application. The OAuth2 code exchange (`authorization_code` → `access_token`) must happen server-side. Without a BFF, teams either compromise on security or burden the frontend with PKCE and elaborate workarounds.

## Architecture Overview

```
Browser (Vue.js)
        │
        │  Session cookie (HttpOnly, Secure)
        ▼
  FastAPI BFF
        │
        ├─── Redis (encrypted sessions + OAuth2 tokens)
        │
        └─── Azure B2C (code exchange, token refresh)
                │
                └─── Downstream APIs (access_token as Bearer)
```

The browser never sees an OAuth2 token. It exchanges only an opaque session cookie with the BFF. The BFF holds the tokens and injects them into requests to downstream APIs on behalf of the client.

## FastAPI Implementation

### Session Management with Redis

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
        self.session_ttl = 3600  # 1 hour

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

### Azure B2C OAuth2 Callback

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
    # Code exchange happens entirely server-side
    async with AsyncClient() as client:
        token_response = await client.post(
            f"https://{settings.b2c_tenant}.b2clogin.com/"
            f"{settings.b2c_tenant}.onmicrosoft.com/"
            f"{settings.b2c_policy}/oauth2/v2.0/token",
            data={
                "grant_type": "authorization_code",
                "client_id": settings.client_id,
                "client_secret": settings.client_secret,  # Never exposed to the browser
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

### Proxying to Downstream APIs

```python
@router.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy(request: Request, path: str):
    session = await session_manager.get_session(request)
    if not session:
        raise HTTPException(status_code=401)

    # Refresh the token proactively before it expires
    if time.time() > session["expires_at"] - 60:
        session = await token_refresher.refresh(session)

    async with AsyncClient() as client:
        upstream = await client.request(
            method=request.method,
            url=f"{settings.api_base_url}/{path}",
            headers={"Authorization": f"Bearer {session['access_token']}"},
            content=await request.body(),
        )

    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        media_type=upstream.headers.get("content-type")
    )
```

## Distributed Locking for Token Refresh

In a multi-pod environment, several workers may attempt to refresh the same token concurrently. A Redis lock prevents redundant refresh calls and the race conditions they produce:

```python
async def refresh(self, session: dict) -> dict:
    lock_key = f"bff:lock:refresh:{session['user_id']}"

    async with self.redis.lock(lock_key, timeout=10, blocking_timeout=8):
        # Re-read the session — another pod may have already refreshed it
        fresh = await self.session_manager.get_session_by_user(session["user_id"])
        if time.time() < fresh["expires_at"] - 60:
            return fresh  # Already refreshed; nothing to do

        async with AsyncClient() as client:
            response = await client.post(
                settings.token_endpoint,
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": fresh["refresh_token"],
                    "client_id": settings.client_id,
                    "client_secret": settings.client_secret,
                }
            )
        new_tokens = response.json()
        updated = {
            **fresh,
            **new_tokens,
            "expires_at": time.time() + new_tokens["expires_in"]
        }
        await self.session_manager.update_session(updated)
        return updated
```

## Trade-off Summary

| Aspect                   | Without BFF                 | With BFF                           |
| ------------------------ | --------------------------- | ---------------------------------- |
| Tokens in the browser    | Yes (localStorage / cookie) | Never exposed                      |
| `client_secret` exposure | Absent — PKCE required      | Server-side only                   |
| Token refresh            | Frontend-managed            | BFF-managed, with distributed lock |
| XSS attack surface       | Tokens accessible           | Opaque session cookie only         |
| Operational complexity   | Simpler                     | Additional service to operate      |

The BFF pattern is not a universal prescription. For public-facing applications with low-sensitivity data, client-side PKCE is simpler and perfectly adequate. However, for applications managing tokens with elevated privileges, sensitive scopes, or multi-API integrations — the BFF is the most architecturally sound approach available.
