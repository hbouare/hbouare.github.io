---
slug: typescript-interfaces
title: "TypeScript in Practice: Hierarchical Interfaces on a Real API"
date: "2025-06-09"
readTime: 8
tags: ["TypeScript", "Vue.js", "API", "Frontend"]
excerpt: "Not a TypeScript tutorial — but how to structure interfaces that accurately model a real external API, using utility types, generics on Vue composables, and the concrete decisions that actually matter in production code."
---

# TypeScript in Practice: Hierarchical Interfaces on a Real API

Most TypeScript tutorials demonstrate trivial examples: `interface User { name: string; age: number }`. Production code is considerably more involved. External APIs return nested structures, conditionally optional fields, and type unions that vary by state. Here is how to model all of that cleanly, starting from a real-world case.

## The Starting Point: An API With a Hierarchical Structure

Consider a certificate management API that returns structures of the following shape:

```json
{
  "account": {
    "id": "ACC-001",
    "name": "EDF Production",
    "type": "PRODUCER"
  },
  "certificates": [
    {
      "id": "GO-2024-001",
      "volume": 1500.5,
      "unit": "MWh",
      "period": { "from": "2024-01-01", "to": "2024-01-31" },
      "status": "ACTIVE",
      "metadata": {
        "technology": "WIND",
        "country": "FR",
        "installation_id": "INS-042"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 312
  }
}
```

## Modelling the Atomic Types

Start with the leaf-level types — literal unions rather than bare strings:

```typescript
// types/api.ts

export type AccountType = "PRODUCER" | "TRADER" | "CONSUMER"
export type CertificateStatus = "ACTIVE" | "CANCELLED" | "TRANSFERRED"
export type EnergyTechnology = "WIND" | "SOLAR" | "HYDRO" | "BIOMASS"
export type CountryCode = "FR" | "DE" | "ES" | "IT" | "BE"

export interface DateRange {
  from: string // ISO 8601
  to: string
}
```

Literal unions rather than raw `string` types: TypeScript will flag `'WIND_OFFSHORE'` immediately wherever `EnergyTechnology` is expected, rather than letting it slip through to a runtime error.

## Hierarchical Interfaces

```typescript
export interface Account {
  id: string
  name: string
  type: AccountType
}

export interface CertificateMetadata {
  technology: EnergyTechnology
  country: CountryCode
  installation_id: string
}

export interface Certificate {
  id: string
  volume: number
  unit: "MWh" | "kWh"
  period: DateRange
  status: CertificateStatus
  metadata: CertificateMetadata
}

export interface Pagination {
  page: number
  per_page: number
  total: number
}

export interface CertificatesResponse {
  account: Account
  certificates: Certificate[]
  pagination: Pagination
}
```

## Utility Types for Each Use Case

The API always returns the complete structure, but the application rarely needs all of it at once. TypeScript's utility types allow deriving purpose-built types from the canonical interfaces without duplicating definitions:

```typescript
// For list display — metadata is not needed
export type CertificateSummary = Pick<
  Certificate,
  "id" | "volume" | "unit" | "status" | "period"
>

// For updates — only status is mutable
export type CertificateUpdate = Pick<Certificate, "id"> & {
  status: CertificateStatus
}

// For search filters — all fields are optional
export type CertificateFilters = Partial<Pick<Certificate, "status">> & {
  period?: Partial<DateRange>
  technology?: EnergyTechnology
  country?: CountryCode
}

// For forms — exclude API-generated fields
export type CertificateForm = Omit<Certificate, "id" | "status">
```

## Generic Composables in Vue

A generic API composable eliminates the need to rewrite the same loading/error logic for every endpoint:

```typescript
// composables/useApiQuery.ts
import { ref, Ref } from "vue"

interface ApiQueryState<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  execute: () => Promise<void>
}

export function useApiQuery<T>(
  fetcher: () => Promise<T>,
  options?: { immediate?: boolean },
): ApiQueryState<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async () => {
    loading.value = true
    error.value = null
    try {
      data.value = await fetcher()
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error"
    } finally {
      loading.value = false
    }
  }

  if (options?.immediate) execute()

  return { data, loading, error, execute }
}
```

Usage in a Vue component:

```typescript
const {
  data: certificates,
  loading,
  error,
  execute,
} = useApiQuery<CertificatesResponse>(
  () => $fetch("/api/certificates", { params: filters.value }),
  { immediate: true },
)
```

TypeScript infers `data` as `Ref<CertificatesResponse | null>` automatically — no manual casting, no `as any`.

## Typing Vue Props Against API Interfaces

A common mistake is defining Vue props with local types that duplicate the API interfaces. The correct approach uses the canonical types directly:

```typescript
// components/CertificateCard.vue
<script setup lang="ts">
import type { CertificateSummary, CertificateStatus } from '@/types/api'

const props = defineProps<{
  certificate: CertificateSummary
  selected?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  statusChange: [id: string, status: CertificateStatus]
}>()
</script>
```

`defineProps<T>()` and `defineEmits<T>()` with generic types: no `PropType<T>` import required, and TypeScript validates props at compile time and within the template.

## Type Guards for API Responses

Real-world APIs do not always honour their contracts. A type guard enables runtime validation without sacrificing static typing:

```typescript
function isCertificate(value: unknown): value is Certificate {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "volume" in value &&
    "status" in value &&
    ["ACTIVE", "CANCELLED", "TRANSFERRED"].includes(
      (value as Certificate).status,
    )
  )
}

// Usage
const raw = await $fetch("/api/certificates/GO-2024-001")
if (!isCertificate(raw)) {
  throw new Error("Invalid API response")
}
// TypeScript now knows raw is of type Certificate
console.log(raw.volume)
```

## What This Changes in Practice

Investing in rigorous TypeScript modelling from the outset delivers:

- **Reliable autocomplete** across all API objects in the IDE
- **Errors caught at compile time** rather than discovered in production
- **Safe refactoring** — renaming a field in an interface propagates the error everywhere it is used
- **Implicit documentation** — the types are the source of truth for the shape of the data

The upfront cost is real, particularly on an existing project with JavaScript to migrate. However, on a new Vue.js project consuming an external API, starting with strict TypeScript from the first commit is consistently the most cost-effective decision over the medium term.
