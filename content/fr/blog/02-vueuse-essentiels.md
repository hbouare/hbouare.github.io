---
slug: vueuse-essentiels
title: "VueUse : les composables qui changent le quotidien"
date: "2025-03-13"
readTime: 10
tags: ["Vue.js", "VueUse", "Composition API", "Frontend"]
excerpt: "Pas la liste exhaustive de la doc — mais les composables VueUse que tu vas utiliser réellement sur des projets Vue.js et Nuxt professionnels, avec des cas d'usage concrets et les pièges à éviter."
---

# VueUse en production : les composables qui changent vraiment le quotidien

VueUse compte plus de 200 composables. La documentation les liste tous, ce qui ne t'aide pas à savoir lesquels valent vraiment le coup d'apprendre. Voici ceux qui reviennent systématiquement sur des projets professionnels, avec les situations concrètes où ils font gagner du temps.

## Installation

```bash
npm install @vueuse/core
```

VueUse est compatible Vue 3 et Nuxt 3/4. Les composables sont tree-shakable — seuls ceux que tu importes sont inclus dans le bundle.

## `useAsyncState` : remplacer le pattern loading/error/data

Le pattern le plus répétitif en Vue.js :

```typescript
// Ce qu'on écrit sans VueUse — encore et encore
const data = ref(null)
const loading = ref(false)
const error = ref(null)

const fetch = async () => {
  loading.value = true
  error.value = null
  try {
    data.value = await api.getCertificates()
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}

onMounted(fetch)
```

Avec `useAsyncState` :

```typescript
import { useAsyncState } from "@vueuse/core"

const { state, isLoading, error, execute } = useAsyncState(
  () => api.getCertificates(),
  [], // Valeur initiale
  {
    immediate: true, // Exécuter au montage
    resetOnExecute: true, // Remettre à la valeur initiale avant chaque exécution
    onError: (e) => logger.error("Fetch failed", e),
  },
)
```

`state` est typé selon la valeur de retour de la fonction async. `execute` permet de relancer manuellement avec des paramètres différents :

```typescript
// Relancer avec un filtre différent
await execute(0, { status: "ACTIVE", period: "2024-01" })
```

Le deuxième argument de `execute` (le délai) est un vestige de l'API — passe `0` pour une exécution immédiate.

## `useDebounceFn` et `useThrottleFn` : performances sur les événements fréquents

Sur un champ de recherche qui appelle une API à chaque frappe :

```typescript
import { useDebounceFn } from "@vueuse/core"

const search = ref("")

const searchApi = useDebounceFn(async (query: string) => {
  if (query.length < 2) return
  results.value = await api.search(query)
}, 350) // 350ms après la dernière frappe

// Dans le template
watch(search, searchApi)
```

`useThrottleFn` pour les cas où tu veux garantir une exécution maximum par intervalle (scroll, resize, mousemove) :

```typescript
import { useThrottleFn } from "@vueuse/core"

const onScroll = useThrottleFn((event: Event) => {
  updateScrollPosition(window.scrollY)
}, 100) // Maximum 1 exécution par 100ms
```

La différence : debounce attend que l'activité s'arrête, throttle exécute à intervalle régulier pendant l'activité. Règle pratique : debounce pour la recherche, throttle pour le scroll.

## `useLocalStorage` et `useSessionStorage` : état persistant réactif

```typescript
import { useLocalStorage } from "@vueuse/core"

// Remplace localStorage.getItem / setItem / JSON.parse / JSON.stringify
const filters = useLocalStorage("certificate-filters", {
  status: "ACTIVE",
  technology: null,
  period: null,
})

// filters est une Ref — toute modification est persistée automatiquement
filters.value.status = "CANCELLED"
// localStorage.setItem('certificate-filters', '{"status":"CANCELLED",...}') appelé automatiquement
```

VueUse gère la sérialisation JSON, la synchronisation entre onglets (via l'événement `storage`), et les valeurs par défaut si la clé n'existe pas encore.

Avec un type explicite pour l'autocomplétion :

```typescript
interface FilterState {
  status: "ACTIVE" | "CANCELLED" | "TRANSFERRED" | null
  technology: string | null
  period: string | null
}

const filters = useLocalStorage<FilterState>("certificate-filters", {
  status: null,
  technology: null,
  period: null,
})
```

Le piège : `useLocalStorage` n'est pas disponible côté serveur (SSR/Nuxt). Utiliser `import.meta.client` ou le wrapper `useLocalStorage` de `@vueuse/nuxt` qui gère le SSR proprement.

## `useIntersectionObserver` : lazy loading et animations au scroll

Pour charger des données seulement quand un élément entre dans le viewport :

```typescript
import { useIntersectionObserver } from "@vueuse/core"
import { ref } from "vue"

const target = ref<HTMLElement | null>(null)
const dataLoaded = ref(false)

const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !dataLoaded.value) {
      loadHeavyData()
      dataLoaded.value = true
      stop() // Observer une seule fois
    }
  },
  { threshold: 0.1 }, // Déclencher quand 10% de l'élément est visible
)
```

Dans le template :

```vue
<template>
  <div ref="target">
    <Spinner v-if="!dataLoaded" />
    <HeavyChart v-else :data="chartData" />
  </div>
</template>
```

`stop()` arrête l'observation après le premier déclenchement — évite des appels répétés inutiles. Utile aussi pour les animations d'entrée : déclencher une classe CSS quand l'élément devient visible.

## `useEventListener` : gestion propre des événements DOM

```typescript
import { useEventListener } from "@vueuse/core"

// Nettoyage automatique au démontage du composant
useEventListener(window, "keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape") closeModal()
  if (event.ctrlKey && event.key === "s") saveForm()
})

// Sur un élément réactif
const tableRef = ref<HTMLElement | null>(null)
useEventListener(tableRef, "click", handleCellClick)
```

Sans VueUse, il faut penser à `removeEventListener` dans `onUnmounted` — facile à oublier, source de fuites mémoire. `useEventListener` le fait automatiquement.

## `useClipboard` : copier dans le presse-papiers

```typescript
import { useClipboard } from "@vueuse/core"

const { copy, copied, isSupported } = useClipboard()

// Dans le template
```

```vue
<template>
  <button @click="copy(certificateId)" :disabled="!isSupported">
    {{ copied ? "✓ Copié" : "Copier l'ID" }}
  </button>
</template>
```

`copied` revient automatiquement à `false` après 1.5s (configurable). `isSupported` vérifie si l'API Clipboard est disponible dans le navigateur — utile pour les fallbacks.

## `useMediaQuery` : responsive sans CSS

```typescript
import { useMediaQuery } from "@vueuse/core"

const isMobile = useMediaQuery("(max-width: 768px)")
const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

// Réactif — se met à jour quand la fenêtre est redimensionnée
watch(isMobile, (mobile) => {
  if (mobile) collapseNavigation()
})
```

Utile quand la logique JavaScript doit changer selon la taille d'écran — pas seulement le CSS. Par exemple, désactiver des animations complexes sur mobile ou réduire la quantité de données chargées.

## `useEventSource` : consommer un flux SSE

Server-Sent Events est souvent préférable aux WebSockets pour les flux unidirectionnels (notifications, mises à jour de statut) — plus simple, reconnexion automatique native, compatible avec les proxies HTTP.

```typescript
import { useEventSource } from "@vueuse/core"

const { data, status, error, close } = useEventSource(
  "/api/events/certificates",
  ["certificate_updated", "certificate_created"], // Événements à écouter
  { withCredentials: true },
)

// data est la dernière donnée reçue
watch(data, (raw) => {
  if (!raw) return
  const event = JSON.parse(raw)
  updateCertificateInList(event)
})

// status : 'CONNECTING' | 'OPEN' | 'CLOSED'
```

Côté FastAPI, un endpoint SSE minimal :

```python
from fastapi.responses import StreamingResponse
import asyncio
import json

@router.get("/api/events/certificates")
async def certificate_events(request: Request):
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            event = await event_queue.get()
            yield f"event: {event['type']}\ndata: {json.dumps(event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )
```

`X-Accel-Buffering: no` est critique derrière nginx ou un ingress OpenShift — sans ça, les événements sont bufferisés et n'arrivent pas en temps réel.

## `useVModel` : simplifier les composants formulaire

Pour un composant qui wrape un input et doit supporter `v-model` :

```typescript
import { useVModel } from "@vueuse/core"

// Composant InputField.vue
const props = defineProps<{
  modelValue: string
  label: string
}>()
const emit = defineEmits(["update:modelValue"])

const value = useVModel(props, "modelValue", emit)

// value est une Ref writable — directement utilisable dans le template
```

```vue
<template>
  <div>
    <label>{{ label }}</label>
    <input v-model="value" />
  </div>
</template>
```

Sans `useVModel`, il faut gérer manuellement la prop et l'emit — deux lignes de plus, et le risque de mutation directe de la prop.

## Ce qu'il faut retenir

VueUse vaut surtout pour trois catégories de composables : ceux qui éliminent du boilerplate récurrent (`useAsyncState`, `useVModel`), ceux qui wrappent des APIs navigateur verbeuses (`useIntersectionObserver`, `useEventListener`, `useClipboard`), et ceux qui gèrent des problèmes de performance (`useDebounceFn`, `useThrottleFn`). Le reste est utile situationnellement — mais ces dix-là reviennent sur pratiquement tous les projets Vue.js professionnels.
