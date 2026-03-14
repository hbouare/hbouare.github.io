---
slug: vueuse-essentiels
title: "VueUse: The Composables That Actually Make a Difference"
date: "2025-01-10"
readTime: 10
tags: ["Vue.js", "VueUse", "Composition API", "Frontend"]
excerpt: "Not the exhaustive list from the docs — but the VueUse composables you will actually reach for on professional Vue.js and Nuxt projects, with concrete use cases and the pitfalls worth knowing about."
---

# VueUse in Production: The Composables That Actually Make a Difference

VueUse ships over 200 composables. The documentation lists all of them, which does not help you determine which ones are genuinely worth learning. Here are the ones that appear consistently on professional projects, along with the concrete situations where they save meaningful time.

## Installation

```bash
npm install @vueuse/core
```

VueUse is compatible with Vue 3 and Nuxt 3/4. All composables are tree-shakable — only those you import are included in the bundle.

## `useAsyncState`: Replacing the loading/error/data Pattern

The most repetitive pattern in Vue.js:

```typescript
// What we write without VueUse — over and over
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

With `useAsyncState`:

```typescript
import { useAsyncState } from "@vueuse/core"

const { state, isLoading, error, execute } = useAsyncState(
  () => api.getCertificates(),
  [], // Initial value
  {
    immediate: true, // Execute on mount
    resetOnExecute: true, // Reset to initial value before each execution
    onError: (e) => logger.error("Fetch failed", e),
  },
)
```

`state` is typed from the return type of the async function. `execute` allows re-triggering manually with different parameters:

```typescript
// Re-fetch with a different filter
await execute(0, { status: "ACTIVE", period: "2024-01" })
```

The second argument to `execute` (the delay) is a legacy of the API — pass `0` for immediate execution.

## `useDebounceFn` and `useThrottleFn`: Performance on Frequent Events

On a search field that calls an API on every keystroke:

```typescript
import { useDebounceFn } from "@vueuse/core"

const search = ref("")

const searchApi = useDebounceFn(async (query: string) => {
  if (query.length < 2) return
  results.value = await api.search(query)
}, 350) // 350ms after the last keystroke

watch(search, searchApi)
```

`useThrottleFn` for cases where you want to guarantee at most one execution per interval (scroll, resize, mousemove):

```typescript
import { useThrottleFn } from "@vueuse/core"

const onScroll = useThrottleFn((event: Event) => {
  updateScrollPosition(window.scrollY)
}, 100) // At most one execution per 100ms
```

The distinction: debounce waits for activity to stop, throttle executes at regular intervals during activity. The practical rule: debounce for search, throttle for scroll.

## `useLocalStorage` and `useSessionStorage`: Reactive Persistent State

```typescript
import { useLocalStorage } from "@vueuse/core"

// Replaces localStorage.getItem / setItem / JSON.parse / JSON.stringify
const filters = useLocalStorage("certificate-filters", {
  status: "ACTIVE",
  technology: null,
  period: null,
})

// filters is a Ref — any modification is persisted automatically
filters.value.status = "CANCELLED"
// localStorage.setItem('certificate-filters', '{"status":"CANCELLED",...}') called automatically
```

VueUse handles JSON serialisation, cross-tab synchronisation (via the `storage` event), and default values when the key does not yet exist.

With an explicit type for autocomplete:

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

The pitfall: `useLocalStorage` is not available server-side (SSR/Nuxt). Use `import.meta.client` or the `useLocalStorage` wrapper from `@vueuse/nuxt`, which handles SSR correctly.

## `useIntersectionObserver`: Lazy Loading and Scroll Animations

To load data only when an element enters the viewport:

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
      stop() // Observe only once
    }
  },
  { threshold: 0.1 }, // Trigger when 10% of the element is visible
)
```

In the template:

```vue
<template>
  <div ref="target">
    <Spinner v-if="!dataLoaded" />
    <HeavyChart v-else :data="chartData" />
  </div>
</template>
```

`stop()` halts observation after the first trigger — avoids unnecessary repeated calls. Also useful for entrance animations: applying a CSS class when an element becomes visible.

## `useEventListener`: Clean DOM Event Management

```typescript
import { useEventListener } from "@vueuse/core"

// Automatically cleaned up when the component unmounts
useEventListener(window, "keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape") closeModal()
  if (event.ctrlKey && event.key === "s") saveForm()
})

// On a reactive element ref
const tableRef = ref<HTMLElement | null>(null)
useEventListener(tableRef, "click", handleCellClick)
```

Without VueUse, you must remember to call `removeEventListener` in `onUnmounted` — easy to forget, and a reliable source of memory leaks. `useEventListener` handles this automatically.

## `useClipboard`: Copying to the Clipboard

```typescript
import { useClipboard } from "@vueuse/core"

const { copy, copied, isSupported } = useClipboard()
```

```vue
<template>
  <button @click="copy(certificateId)" :disabled="!isSupported">
    {{ copied ? "✓ Copied" : "Copy ID" }}
  </button>
</template>
```

`copied` automatically reverts to `false` after 1.5 seconds (configurable). `isSupported` checks whether the Clipboard API is available in the browser — useful for providing a fallback.

## `useMediaQuery`: Responsive Logic Beyond CSS

```typescript
import { useMediaQuery } from "@vueuse/core"

const isMobile = useMediaQuery("(max-width: 768px)")
const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

// Reactive — updates when the window is resized
watch(isMobile, (mobile) => {
  if (mobile) collapseNavigation()
})
```

Useful when JavaScript behaviour must adapt to screen size — not just CSS. For instance, disabling complex animations on mobile, or reducing the amount of data loaded on smaller viewports.

## `useEventSource`: Consuming an SSE Stream

Server-Sent Events is often preferable to WebSockets for unidirectional streams (notifications, status updates) — simpler, with native automatic reconnection, and compatible with HTTP proxies.

```typescript
import { useEventSource } from "@vueuse/core"

const { data, status, error, close } = useEventSource(
  "/api/events/certificates",
  ["certificate_updated", "certificate_created"], // Events to listen to
  { withCredentials: true },
)

// data holds the most recently received payload
watch(data, (raw) => {
  if (!raw) return
  const event = JSON.parse(raw)
  updateCertificateInList(event)
})

// status: 'CONNECTING' | 'OPEN' | 'CLOSED'
```

On the FastAPI side, a minimal SSE endpoint:

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

`X-Accel-Buffering: no` is critical behind nginx or an OpenShift ingress — without it, events are buffered and do not arrive in real time.

## `useVModel`: Simplifying Form Components

For a component that wraps an input and needs to support `v-model`:

```typescript
import { useVModel } from "@vueuse/core"

// InputField.vue
const props = defineProps<{
  modelValue: string
  label: string
}>()
const emit = defineEmits(["update:modelValue"])

const value = useVModel(props, "modelValue", emit)

// value is a writable Ref — usable directly in the template
```

```vue
<template>
  <div>
    <label>{{ label }}</label>
    <input v-model="value" />
  </div>
</template>
```

Without `useVModel`, you must manually manage the prop and the emit — two extra lines, and the risk of accidentally mutating the prop directly.

## Key Takeaways

VueUse is most valuable across three categories: composables that eliminate recurring boilerplate (`useAsyncState`, `useVModel`), composables that wrap verbose browser APIs (`useIntersectionObserver`, `useEventListener`, `useClipboard`), and composables that address performance concerns (`useDebounceFn`, `useThrottleFn`). The rest is situationally useful — but these ten appear on virtually every professional Vue.js project.
