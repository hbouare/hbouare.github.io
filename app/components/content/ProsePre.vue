<!-- app/components/content/ProsePre.vue -->
<!-- Overrides Nuxt Content's default <pre> renderer to add a copy button.
     Shiki's highlighting classes/styles arrive via $attrs and are forwarded
     to the inner <pre>, so theme-aware highlighting is preserved. -->
<template>
  <div class="code-block-wrapper">
    <pre v-bind="$attrs"><slot /></pre>
    <button
      class="copy-btn font-mono"
      :class="{ 'copy-btn--success': copied }"
      :aria-label="$t('blog.copy_code')"
      type="button"
      @click="copy"
    >
      {{ copied ? $t("blog.copied") : $t("blog.copy_code") }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  code?: string
  language?: string | null
  filename?: string | null
  highlights?: number[]
  meta?: string | null
}>()

const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.code ?? "")
    copied.value = true
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Clipboard unavailable (e.g. insecure context) — fail silently.
  }
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>
