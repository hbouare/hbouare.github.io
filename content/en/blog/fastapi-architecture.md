---
slug: fastapi-project-architecture
title: "Structuring a FastAPI Project That Lasts"
date: "2025-03-01"
readTime: 10
tags: ["FastAPI", "Python", "Architecture", "Clean Code"]
excerpt: "Not the FastAPI hello world — but how to organise a real project with routers, a service layer, repositories, dependency injection, and tests that remain maintainable six months down the line."
---

# Structuring a FastAPI Project That Lasts: Architecture, Layers, and Dependencies

Most FastAPI tutorials put everything in `main.py`. That works for a demonstration, not for an application maintained by a team over several years. Here is the architecture applied in practice on projects built to last, along with the reasoning behind each decision.

## Project Structure

```
app/
├── api/
│   ├── dependencies.py       # Injected dependencies (auth, db, etc.)
│   ├── routers/
│   │   ├── certificates.py
│   │   └── accounts.py
│   └── schemas/
│       ├── certificate.py    # Pydantic models — API input/output
│       └── account.py
├── core/
│   ├── config.py             # Settings (pydantic-settings)
│   └── security.py           # JWT, hashing, etc.
├── domain/
│   ├── models.py             # Dataclasses — internal business objects
│   └── exceptions.py         # Business exceptions
├── infrastructure/
│   ├── database.py           # SQLAlchemy session
│   └── repositories/
│       ├── certificate_repo.py
│       └── account_repo.py
├── services/
│   ├── certificate_service.py
│   └── account_service.py
└── main.py
```

This structure separates four layers: API (HTTP), domain (business logic), infrastructure (database, external services), and services (orchestration between the two).

## The API Layer: Routers and Schemas

```python
# app/api/routers/certificates.py
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.schemas.certificate import CertificateCreate, CertificateResponse
from app.api.dependencies import get_certificate_service, get_current_user
from app.services.certificate_service import CertificateService
from app.domain.exceptions import CertificateNotFound, InsufficientVolume

router = APIRouter(prefix="/certificates", tags=["certificates"])

@router.post("/", response_model=CertificateResponse, status_code=status.HTTP_201_CREATED)
async def create_certificate(
    payload: CertificateCreate,
    service: CertificateService = Depends(get_certificate_service),
    current_user: str = Depends(get_current_user),
):
    try:
        certificate = await service.create(payload, owner=current_user)
        return CertificateResponse.model_validate(certificate)
    except InsufficientVolume as e:
        raise HTTPException(status_code=422, detail=str(e))

@router.get("/{certificate_id}", response_model=CertificateResponse)
async def get_certificate(
    certificate_id: str,
    service: CertificateService = Depends(get_certificate_service),
):
    try:
        return CertificateResponse.model_validate(
            await service.get_by_id(certificate_id)
        )
    except CertificateNotFound:
        raise HTTPException(status_code=404, detail="Certificate not found")
```

The router contains no business logic — only HTTP mapping: request deserialisation, service call, response serialisation, and translation of business exceptions into HTTP status codes.

## The Service Layer: Business Logic

```python
# app/services/certificate_service.py
from app.domain.models import Certificate
from app.domain.exceptions import CertificateNotFound, InsufficientVolume, DuplicateCertificate
from app.infrastructure.repositories.certificate_repo import CertificateRepository
from app.api.schemas.certificate import CertificateCreate

class CertificateService:
    def __init__(self, repo: CertificateRepository):
        self.repo = repo

    async def create(self, payload: CertificateCreate, owner: str) -> Certificate:
        if payload.volume <= 0:
            raise InsufficientVolume(f"Invalid volume: {payload.volume}")

        existing = await self.repo.find_by_period(
            owner=owner,
            period_from=payload.period_from,
            period_to=payload.period_to
        )
        if existing:
            raise DuplicateCertificate("A certificate already exists for this period")

        return await self.repo.create(payload, owner=owner)

    async def get_by_id(self, certificate_id: str) -> Certificate:
        certificate = await self.repo.find_by_id(certificate_id)
        if not certificate:
            raise CertificateNotFound(certificate_id)
        return certificate
```

The service layer is testable without a database or HTTP — mocking the repository is sufficient. This is where the value of the separation is most tangible.

## The Repository Layer: Data Access

```python
# app/infrastructure/repositories/certificate_repo.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.domain.models import Certificate
from app.infrastructure.database import CertificateORM

class CertificateRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def find_by_id(self, certificate_id: str) -> Certificate | None:
        result = await self.session.execute(
            select(CertificateORM).where(CertificateORM.id == certificate_id)
        )
        orm_obj = result.scalar_one_or_none()
        if orm_obj is None:
            return None
        return self._to_domain(orm_obj)

    async def create(self, payload, owner: str) -> Certificate:
        orm_obj = CertificateORM(
            volume=payload.volume,
            technology=payload.technology,
            owner=owner,
            period_from=payload.period_from,
            period_to=payload.period_to,
        )
        self.session.add(orm_obj)
        await self.session.commit()
        await self.session.refresh(orm_obj)
        return self._to_domain(orm_obj)

    def _to_domain(self, orm_obj: CertificateORM) -> Certificate:
        """Maps an ORM object to a domain object."""
        return Certificate(
            id=str(orm_obj.id),
            volume=orm_obj.volume,
            technology=orm_obj.technology,
            status=orm_obj.status,
            owner=orm_obj.owner,
            period_from=orm_obj.period_from.isoformat(),
            period_to=orm_obj.period_to.isoformat(),
        )
```

The repository is the only layer that knows about SQLAlchemy. The rest of the codebase works with domain objects (`Certificate` dataclass) — not ORM models. This decoupling means switching the ORM or the database does not touch the business logic.

## Dependency Injection

```python
# app/api/dependencies.py
from fastapi import Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.certificate_repo import CertificateRepository
from app.services.certificate_service import CertificateService

async def get_certificate_service(
    session: AsyncSession = Depends(get_db_session)
) -> CertificateService:
    repo = CertificateRepository(session)
    return CertificateService(repo)

async def get_current_user(request: Request) -> str:
    session_data = await session_manager.get_session(request)
    if not session_data:
        raise HTTPException(status_code=401)
    return session_data["user_id"]
```

FastAPI resolves dependencies automatically and manages their lifecycle. `get_db_session` creates one session per request and closes it cleanly afterwards — even in the event of an exception.

## Business Exceptions

```python
# app/domain/exceptions.py

class DomainException(Exception):
    """Base class for all business exceptions."""
    pass

class CertificateNotFound(DomainException):
    def __init__(self, certificate_id: str):
        super().__init__(f"Certificate '{certificate_id}' not found")
        self.certificate_id = certificate_id

class InsufficientVolume(DomainException):
    pass

class DuplicateCertificate(DomainException):
    pass
```

Business exceptions do not depend on FastAPI — they express what can go wrong in the domain. Translating them into HTTP status codes is the router's responsibility.

## Testing Services Without Infrastructure

```python
# tests/services/test_certificate_service.py
import pytest
from unittest.mock import AsyncMock
from app.services.certificate_service import CertificateService
from app.domain.exceptions import InsufficientVolume
from app.api.schemas.certificate import CertificateCreate

@pytest.fixture
def mock_repo():
    repo = AsyncMock()
    repo.find_by_period.return_value = None  # No duplicate by default
    return repo

@pytest.fixture
def service(mock_repo):
    return CertificateService(repo=mock_repo)

async def test_create_certificate_invalid_volume(service):
    payload = CertificateCreate(
        volume=-10,
        technology="WIND",
        period_from="2024-01-01",
        period_to="2024-01-31"
    )
    with pytest.raises(InsufficientVolume):
        await service.create(payload, owner="user-1")

async def test_create_certificate_success(service, mock_repo):
    payload = CertificateCreate(
        volume=1500,
        technology="WIND",
        period_from="2024-01-01",
        period_to="2024-01-31"
    )
    await service.create(payload, owner="user-1")
    mock_repo.create.assert_called_once()
```

Service tests are fast, deterministic, and require no database. `AsyncMock` replaces the repository — we are testing the logic, not the infrastructure.

## What This Architecture Delivers

Layered separation is not gratuitous complexity. It addresses concrete problems on a project that must remain maintainable over time:

- **Testability** — services test without a database, routers with an HTTP test client
- **Readability** — a new developer knows exactly where to look: business logic in `services/`, data access in `repositories/`, HTTP concerns in `routers/`
- **Flexibility** — replacing PostgreSQL with another database only touches `repositories/`
- **Separation of concerns** — an HTTP bug stays in the router, a business bug stays in the service

The trade-off: more files, more layers to traverse for a simple feature. On a one-week throwaway project, it is over-engineered. On a project maintained by a team for months, it is the difference between code that is still comprehensible at the six-month mark and a codebase nobody wants to touch.
