---
slug: fastapi-architecture
title: "Structurer un projet FastAPI qui dure"
date: "2025-03-13"
readTime: 10
tags: ["FastAPI", "Python", "Architecture", "Clean Code"]
excerpt: "Pas le hello world FastAPI — mais comment organiser un projet réel avec des routers, une couche service, des repositories, de l'injection de dépendances, et des tests qui restent maintenables à six mois."
---

# Structurer un projet FastAPI qui dure : architecture, couches et dépendances

La plupart des tutoriels FastAPI mettent tout dans `main.py`. Ça marche pour un exemple, pas pour une application maintenue par une équipe sur plusieurs années. Voici l'architecture que j'applique sur les projets qui durent, avec les raisons derrière chaque décision.

## La structure de projet

```
app/
├── api/
│   ├── dependencies.py       # Dépendances injectées (auth, db, etc.)
│   ├── routers/
│   │   ├── certificates.py
│   │   └── accounts.py
│   └── schemas/
│       ├── certificate.py    # Pydantic models — entrée/sortie API
│       └── account.py
├── core/
│   ├── config.py             # Settings (pydantic-settings)
│   └── security.py           # JWT, hashing, etc.
├── domain/
│   ├── models.py             # Dataclasses — objets métier internes
│   └── exceptions.py         # Exceptions métier
├── infrastructure/
│   ├── database.py           # Session SQLAlchemy
│   └── repositories/
│       ├── certificate_repo.py
│       └── account_repo.py
├── services/
│   ├── certificate_service.py
│   └── account_service.py
└── main.py
```

Cette structure sépare quatre couches : API (HTTP), domaine (logique métier), infrastructure (base de données, services externes), et services (orchestration entre les deux).

## La couche API : routers et schémas

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

Le router ne contient aucune logique métier — seulement du mapping HTTP : désérialisation de la requête, appel au service, sérialisation de la réponse, et conversion des exceptions métier en codes HTTP.

## La couche service : logique métier

```python
# app/services/certificate_service.py
from app.domain.models import Certificate
from app.domain.exceptions import CertificateNotFound, InsufficientVolume
from app.infrastructure.repositories.certificate_repo import CertificateRepository
from app.api.schemas.certificate import CertificateCreate

class CertificateService:
    def __init__(self, repo: CertificateRepository):
        self.repo = repo

    async def create(self, payload: CertificateCreate, owner: str) -> Certificate:
        # Logique métier : vérifications avant création
        if payload.volume <= 0:
            raise InsufficientVolume(f"Volume invalide : {payload.volume}")

        existing = await self.repo.find_by_period(
            owner=owner,
            period_from=payload.period_from,
            period_to=payload.period_to
        )
        if existing:
            raise DuplicateCertificate(f"Certificat existant pour cette période")

        return await self.repo.create(payload, owner=owner)

    async def get_by_id(self, certificate_id: str) -> Certificate:
        certificate = await self.repo.find_by_id(certificate_id)
        if not certificate:
            raise CertificateNotFound(certificate_id)
        return certificate
```

La couche service est testable sans base de données ni HTTP — il suffit de mocker le repository. C'est là que réside la valeur de cette séparation.

## La couche repository : accès aux données

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
        """Convertit un objet ORM en objet domaine."""
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

Le repository est la seule couche qui connaît SQLAlchemy. Le reste du code travaille avec des objets domaine (`Certificate` dataclass) — pas avec des modèles ORM. Ce découplage permet de changer l'ORM ou la base de données sans toucher à la logique métier.

## L'injection de dépendances

```python
# app/api/dependencies.py
from fastapi import Depends, Request
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

FastAPI résout les dépendances automatiquement et gère leur cycle de vie. `get_db_session` crée une session par requête et la ferme proprement après — même en cas d'exception.

## Les exceptions métier

```python
# app/domain/exceptions.py

class DomainException(Exception):
    """Base class pour toutes les exceptions métier."""
    pass

class CertificateNotFound(DomainException):
    def __init__(self, certificate_id: str):
        super().__init__(f"Certificat '{certificate_id}' introuvable")
        self.certificate_id = certificate_id

class InsufficientVolume(DomainException):
    pass

class DuplicateCertificate(DomainException):
    pass
```

Les exceptions métier ne dépendent pas de FastAPI — elles expriment ce qui peut mal tourner dans le domaine. La conversion en codes HTTP appartient au router.

## Tester les services sans infrastructure

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
    repo.find_by_period.return_value = None  # Pas de doublon par défaut
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

Les tests de service sont rapides, déterministes, et ne nécessitent pas de base de données. L'`AsyncMock` remplace le repository — on teste la logique, pas l'infrastructure.

## Ce que cette architecture apporte

La séparation en couches n'est pas de la complexité gratuite. Elle répond à des problèmes concrets sur un projet qui dure :

- **Testabilité** — les services se testent sans base de données, les routers avec un client HTTP
- **Lisibilité** — un nouveau développeur sait où chercher : logique métier dans `services/`, accès aux données dans `repositories/`, HTTP dans `routers/`
- **Évolutivité** — remplacer PostgreSQL par une autre base de données ne touche que `repositories/`
- **Séparation des responsabilités** — un bug HTTP reste dans le router, un bug métier reste dans le service

Le coût : plus de fichiers, plus de couches à traverser pour une feature simple. Sur un projet d'une semaine jetée, c'est surdimensionné. Sur un projet maintenu par une équipe pendant des mois, c'est la différence entre un code qu'on comprend encore à six mois et un spaghetti qu'on a peur de toucher.
