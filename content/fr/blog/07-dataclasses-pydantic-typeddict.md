---
slug: dataclasses-pydantic-typeddict
title: "Dataclasses, Pydantic, TypedDict : lequel choisir et pourquoi"
date: "2025-03-13"
readTime: 7
tags: ["Python", "Pydantic", "Typage", "FastAPI"]
excerpt: "Pas une comparaison théorique — mais les règles de décision concrètes selon le contexte : validation d'entrée API, modèles internes, configuration, sérialisation. Avec les trade-offs réels sur les performances et la maintenabilité."
---

# Dataclasses, Pydantic, TypedDict : lequel choisir et pourquoi

C'est une question que chaque équipe Python se pose tôt ou tard. Les réponses qu'on trouve en ligne sont souvent du type "Pydantic pour les APIs, dataclasses pour le reste" — ce qui est un début, mais ne couvre pas les cas limites où ce choix a un impact réel. Voici les règles de décision que j'applique en pratique.

## Comprendre ce que chacun fait réellement

Avant les règles, un rappel sur ce que chaque outil résout :

**TypedDict** est une annotation de type pure. Il ne fait rien à l'exécution — il informe juste le type checker (mypy, pyright) sur la forme d'un dictionnaire. Aucun overhead, aucune validation.

**Dataclass** est un générateur de classes Python standard. Elle crée automatiquement `__init__`, `__repr__`, `__eq__` à partir des annotations. Pas de validation des types à l'exécution.

**Pydantic BaseModel** est un système de validation complet. Il convertit et valide les données à l'exécution, lève des erreurs détaillées, sérialise/désérialise JSON, et génère des schémas JSON Schema.

Ce ne sont pas trois façons de faire la même chose — ce sont trois outils avec des responsabilités différentes.

## Règle 1 : TypedDict pour les dictionnaires dont tu ne contrôles pas la création

```python
from typing import TypedDict

# Données retournées par une API externe — tu ne les construis pas, tu les lis
class GrxCertificate(TypedDict):
    id: str
    volume: float
    period_from: str
    period_to: str
    status: str

# Usage
def process_certificate(cert: GrxCertificate) -> float:
    return cert["volume"] * 1.05  # Type checker valide l'accès
```

TypedDict est idéal pour typer des dictionnaires qui viennent de l'extérieur (réponses JSON, résultats de requêtes SQL, configs YAML) sans les transformer en objets. L'overhead à l'exécution est nul — c'est purement statique.

La limite : TypedDict ne valide rien à l'exécution. Si l'API renvoie un `volume` sous forme de string, ton code plante plus loin, pas à la désérialisation.

## Règle 2 : Dataclass pour les modèles internes sans validation

```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class CertificateAggregate:
    account_id: str
    total_volume: float
    certificate_count: int
    computed_at: datetime = field(default_factory=datetime.now)

    def average_volume(self) -> float:
        if self.certificate_count == 0:
            return 0.0
        return self.total_volume / self.certificate_count
```

Les dataclasses sont parfaites pour les objets que tu construis toi-même dans ton code métier — résultats d'agrégation, objets intermédiaires de traitement, value objects du domaine. Elles sont plus légères que Pydantic et plus explicites que des dictionnaires.

`@dataclass(frozen=True)` les rend immutables — utile pour les value objects :

```python
@dataclass(frozen=True)
class DateRange:
    start: str
    end: str

    def __post_init__(self):
        if self.start > self.end:
            raise ValueError(f"start ({self.start}) doit être avant end ({self.end})")
```

`__post_init__` permet d'ajouter de la validation sans Pydantic — suffisant pour des invariants simples.

## Règle 3 : Pydantic pour tout ce qui touche les frontières du système

```python
from pydantic import BaseModel, Field, field_validator
from typing import Literal

class CertificateRequest(BaseModel):
    account_id: str = Field(min_length=3, max_length=50)
    volume: float = Field(gt=0, description="Volume en MWh")
    technology: Literal["WIND", "SOLAR", "HYDRO", "BIOMASS"]
    period_from: str
    period_to: str

    @field_validator("period_to")
    @classmethod
    def period_to_after_from(cls, v: str, info) -> str:
        if "period_from" in info.data and v <= info.data["period_from"]:
            raise ValueError("period_to doit être postérieure à period_from")
        return v

class CertificateResponse(BaseModel):
    id: str
    volume: float
    status: Literal["ACTIVE", "CANCELLED", "TRANSFERRED"]

    model_config = {"from_attributes": True}  # Compatibilité avec les ORM
```

Pydantic gagne sur toutes les frontières : entrées HTTP (corps de requête, paramètres), sorties JSON, lecture de configuration, lecture de variables d'environnement.

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str
    secret_key: str
    debug: bool = False

    model_config = {"env_file": ".env"}

settings = Settings()  # Lève une erreur claire si DATABASE_URL est absente
```

`pydantic-settings` est particulièrement utile — il lit les variables d'environnement, les cast dans les bons types, et lève des erreurs explicites au démarrage si une variable obligatoire est manquante.

## Les performances : quand ça compte vraiment

Pydantic v2 (réécrit en Rust) est considérablement plus rapide que v1, mais reste plus lent que les dataclasses pour la construction d'objets :

| Outil       | Construction (relative) | Validation      | Sérialisation JSON     |
| ----------- | ----------------------- | --------------- | ---------------------- |
| TypedDict   | 1x                      | Aucune          | Manuel                 |
| Dataclass   | 1.2x                    | `__post_init__` | `dataclasses.asdict()` |
| Pydantic v2 | 3-5x                    | Complète        | `.model_dump_json()`   |

Sur un endpoint FastAPI qui traite 1000 requêtes/seconde avec des modèles simples, la différence Pydantic vs dataclass est négligeable. Elle devient visible sur des pipelines de traitement qui instancient des millions d'objets — ETL, traitement de fichiers volumineux.

La règle pratique : n'optimise pas prématurément. Pydantic aux frontières, dataclasses en interne — cette séparation donne de bonnes performances par défaut sans micro-optimisation.

## Combiner les trois

Sur un projet réel, les trois coexistent naturellement :

```python
from typing import TypedDict
from dataclasses import dataclass
from pydantic import BaseModel

# TypedDict : réponse brute de l'API externe
class RawApiResponse(TypedDict):
    data: list[dict]
    meta: dict

# Pydantic : validation et parsing de la réponse
class Certificate(BaseModel):
    id: str
    volume: float
    status: str

# Dataclass : objet métier interne après traitement
@dataclass
class CertificateReport:
    total_volume: float
    active_count: int
    cancelled_count: int

def process_response(raw: RawApiResponse) -> CertificateReport:
    certificates = [Certificate.model_validate(item) for item in raw["data"]]
    active = [c for c in certificates if c.status == "ACTIVE"]
    cancelled = [c for c in certificates if c.status == "CANCELLED"]
    return CertificateReport(
        total_volume=sum(c.volume for c in certificates),
        active_count=len(active),
        cancelled_count=len(cancelled),
    )
```

Chaque outil à sa place : TypedDict pour l'externe brut, Pydantic pour la validation à la frontière, dataclass pour la logique interne. C'est cette séparation qui rend le code lisible et maintenable à long terme.
