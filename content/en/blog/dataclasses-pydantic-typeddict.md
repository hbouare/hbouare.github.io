---
slug: dataclasses-pydantic-typeddict
title: "Dataclasses, Pydantic, TypedDict: Which to Choose and Why"
date: "2025-01-06"
readTime: 7
tags: ["Python", "Pydantic", "Typing", "FastAPI"]
excerpt: "Not a theoretical comparison — but the concrete decision rules that apply in practice: API input validation, internal models, configuration, serialisation. With the real trade-offs on performance and maintainability."
---

# Dataclasses, Pydantic, TypedDict: Which to Choose and Why

This is a question every Python team eventually confronts. The answers found online tend toward the superficial: "Pydantic for APIs, dataclasses for everything else" — which is a starting point, but fails to address the situations where the choice actually matters. Here are the decision rules applied in practice.

## Understanding What Each Tool Actually Does

Before the rules, a clear-headed reminder of what each tool is for:

**TypedDict** is a pure type annotation. It does nothing at runtime — it informs the type checker (mypy, pyright) about the shape of a dictionary. Zero overhead, zero validation.

**Dataclass** is a Python class generator. It automatically creates `__init__`, `__repr__`, and `__eq__` from annotations. No runtime type validation.

**Pydantic BaseModel** is a complete validation system. It converts and validates data at runtime, raises detailed errors, serialises and deserialises JSON, and generates JSON Schema.

These are not three ways to accomplish the same thing — they are three tools with distinct responsibilities.

## Rule 1: TypedDict for Dictionaries You Do Not Control

```python
from typing import TypedDict

# Data returned by an external API — you read it, you don't construct it
class GrxCertificate(TypedDict):
    id: str
    volume: float
    period_from: str
    period_to: str
    status: str

# Usage
def process_certificate(cert: GrxCertificate) -> float:
    return cert["volume"] * 1.05  # Type checker validates the field access
```

TypedDict is ideal for typing dictionaries that come from outside the system — JSON API responses, SQL query results, YAML configs — without converting them into objects. The runtime overhead is zero; it is purely a static construct.

The limitation: TypedDict validates nothing at runtime. If the API returns `volume` as a string, the code will fail further downstream rather than at deserialisation.

## Rule 2: Dataclasses for Internal Models Without Validation

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

Dataclasses are the right choice for objects you construct yourself within business logic — aggregation results, intermediate processing objects, domain value objects. They are lighter than Pydantic and more explicit than raw dictionaries.

`@dataclass(frozen=True)` makes them immutable — useful for value objects:

```python
@dataclass(frozen=True)
class DateRange:
    start: str
    end: str

    def __post_init__(self):
        if self.start > self.end:
            raise ValueError(f"start ({self.start}) must be before end ({self.end})")
```

`__post_init__` allows adding simple invariant validation without Pydantic — sufficient for most domain-level constraints.

## Rule 3: Pydantic for Everything That Touches System Boundaries

```python
from pydantic import BaseModel, Field, field_validator
from typing import Literal

class CertificateRequest(BaseModel):
    account_id: str = Field(min_length=3, max_length=50)
    volume: float = Field(gt=0, description="Volume in MWh")
    technology: Literal["WIND", "SOLAR", "HYDRO", "BIOMASS"]
    period_from: str
    period_to: str

    @field_validator("period_to")
    @classmethod
    def period_to_after_from(cls, v: str, info) -> str:
        if "period_from" in info.data and v <= info.data["period_from"]:
            raise ValueError("period_to must be after period_from")
        return v

class CertificateResponse(BaseModel):
    id: str
    volume: float
    status: Literal["ACTIVE", "CANCELLED", "TRANSFERRED"]

    model_config = {"from_attributes": True}  # ORM compatibility
```

Pydantic wins at every system boundary: HTTP inputs (request bodies, query parameters), JSON responses, configuration files, environment variables.

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str
    secret_key: str
    debug: bool = False

    model_config = {"env_file": ".env"}

settings = Settings()  # Raises a clear error if DATABASE_URL is missing
```

`pydantic-settings` is particularly valuable — it reads environment variables, casts them to the correct types, and raises explicit errors at startup if a required variable is absent.

## Performance: When It Actually Matters

Pydantic v2 (rewritten in Rust) is substantially faster than v1, but still slower than dataclasses for object construction:

| Tool        | Construction (relative) | Validation      | JSON Serialisation     |
| ----------- | ----------------------- | --------------- | ---------------------- |
| TypedDict   | 1x                      | None            | Manual                 |
| Dataclass   | 1.2x                    | `__post_init__` | `dataclasses.asdict()` |
| Pydantic v2 | 3–5x                    | Complete        | `.model_dump_json()`   |

On a FastAPI endpoint handling 1,000 requests per second with simple models, the difference between Pydantic and dataclasses is negligible. It becomes visible in data processing pipelines that instantiate millions of objects — ETL jobs, large file processing.

The practical rule: do not optimise prematurely. Pydantic at boundaries, dataclasses internally — this separation delivers good performance by default without micro-optimisation.

## Combining All Three

In a real project, all three coexist naturally:

```python
from typing import TypedDict
from dataclasses import dataclass
from pydantic import BaseModel

# TypedDict: raw response from the external API
class RawApiResponse(TypedDict):
    data: list[dict]
    meta: dict

# Pydantic: validates and parses the response at the boundary
class Certificate(BaseModel):
    id: str
    volume: float
    status: str

# Dataclass: internal business object after processing
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

Each tool in its place: TypedDict for raw external data, Pydantic for boundary validation, dataclass for internal logic. This separation is what keeps the code readable and maintainable over the long term.
