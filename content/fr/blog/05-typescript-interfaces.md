---
slug: typescript-interfaces
title: "TypeScript : interfaces hiérarchiques sur une vraie API"
date: "2025-03-13"
readTime: 8
tags: ["TypeScript", "Vue.js", "API", "Frontend"]
excerpt: "Pas un cours sur TypeScript — mais comment structurer des interfaces qui collent à une API externe réelle, avec des types utilitaires, des génériques sur les composables Vue, et les décisions concrètes qu'on prend sur du code de production."
---

# TypeScript strict en pratique : interfaces hiérarchiques sur une vraie API

La plupart des tutoriels TypeScript montrent des exemples triviaux : `interface User { name: string; age: number }`. En production, la réalité est plus complexe. Les APIs externes renvoient des structures imbriquées, des champs optionnels selon le contexte, des unions de types selon l'état. Voici comment structurer tout ça proprement, à partir d'un cas réel.

## Le point de départ : une API avec une structure hiérarchique

Prenons une API de gestion de certificats qui renvoie des structures de ce type :

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
      "status": "ACTIVE" | "CANCELLED" | "TRANSFERRED",
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

## Modéliser les types de base

On commence par les types atomiques — unions littérales et enums :

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

Les unions littérales plutôt que des `string` nus : TypeScript t'alertera immédiatement si tu passes `'WIND_OFFSHORE'` là où `EnergyTechnology` est attendu.

## Interfaces hiérarchiques

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

## Types utilitaires pour les cas d'usage

L'API renvoie toujours la structure complète, mais l'application n'en a pas toujours besoin en entier. Les types utilitaires TypeScript permettent de dériver des types adaptés à chaque contexte sans dupliquer les interfaces :

```typescript
// Pour l'affichage dans une liste — on n'a pas besoin des métadonnées
export type CertificateSummary = Pick<
  Certificate,
  "id" | "volume" | "unit" | "status" | "period"
>

// Pour la mise à jour — seul le statut est modifiable
export type CertificateUpdate = Pick<Certificate, "id"> & {
  status: CertificateStatus
}

// Pour les filtres de recherche — tous les champs sont optionnels
export type CertificateFilters = Partial<Pick<Certificate, "status">> & {
  period?: Partial<DateRange>
  technology?: EnergyTechnology
  country?: CountryCode
}

// Pour les formulaires — on exclut les champs générés par l'API
export type CertificateForm = Omit<Certificate, "id" | "status">
```

## Génériques sur les composables Vue

Un composable générique pour les appels API évite de réécrire la même logique de chargement/erreur pour chaque endpoint :

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
      error.value = e instanceof Error ? e.message : "Erreur inconnue"
    } finally {
      loading.value = false
    }
  }

  if (options?.immediate) execute()

  return { data, loading, error, execute }
}
```

Usage dans un composant Vue :

```typescript
// Dans un composant
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

TypeScript infère automatiquement le type de `data` comme `Ref<CertificatesResponse | null>` — pas de casting manuel, pas d'`as any`.

## Typer les props Vue avec les interfaces API

Une erreur fréquente : définir des props Vue avec des types locaux qui dupliquent les interfaces API. La bonne approche :

```typescript
// components/CertificateCard.vue
<script setup lang="ts">
import type { CertificateSummary } from '@/types/api'

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

`defineProps<T>()` et `defineEmits<T>()` avec des types génériques : pas de `PropType<T>` à importer, TypeScript valide les props à la compilation et dans le template.

## Guards de type pour les réponses d'API

Les APIs réelles ne sont pas toujours conformes à leur contrat. Un guard de type permet de valider à runtime sans sacrifier le typage statique :

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
  throw new Error("Réponse API invalide")
}
// Ici, TypeScript sait que raw est de type Certificate
console.log(raw.volume)
```

## Ce que ça change en pratique

Investir dans une modélisation TypeScript rigoureuse dès le début du projet, c'est :

- **Autocomplétion fiable** dans l'IDE sur tous les objets API
- **Erreurs détectées à la compilation** plutôt qu'en production
- **Refactoring sûr** — renommer un champ dans l'interface propage l'erreur partout où il est utilisé
- **Documentation implicite** — les types sont la source de vérité sur la forme des données

Le coût d'entrée est réel, surtout sur un projet existant avec du JavaScript à migrer. Mais sur un nouveau projet Vue.js + API tierce, partir en TypeScript strict depuis le premier commit est toujours la décision la plus rentable à moyen terme.
