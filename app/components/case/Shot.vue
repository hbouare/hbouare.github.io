<!-- app/components/case/Shot.vue -->
<!--
  One screenshot in a sober mockup — a browser frame (3 dots + a faint address
  line) or a phone frame (rounded, narrow). No skeuomorphic gloss: the monochrome
  hairline system, applied to a device outline. The tile is a button so the shot
  is keyboard-openable in the lightbox; hover lifts the image and inks the frame.
-->
<template>
  <button
    type="button"
    class="shot"
    :class="[`shot--${device}`, { 'shot--featured': featured }]"
    :aria-label="`${$t('case.enlarge')} — ${alt}`"
    @click="$emit('open')"
  >
    <span class="shot-frame">
      <span v-if="device === 'browser'" class="shot-bar" aria-hidden="true">
        <span class="shot-dot" />
        <span class="shot-dot" />
        <span class="shot-dot" />
        <span class="shot-addr" />
      </span>
      <img
        class="shot-img"
        :src="src"
        :alt="alt"
        :width="dims.w"
        :height="dims.h"
        loading="lazy"
        decoding="async"
      />
    </span>
    <span v-if="caption" class="shot-cap type-caption text-muted">{{ caption }}</span>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src: string
    alt: string
    device?: "browser" | "phone"
    caption?: string
    featured?: boolean
  }>(),
  { device: "browser", featured: false },
)
defineEmits<{ open: [] }>()

// Intrinsic dimensions so the browser reserves the correct aspect ratio before
// the (lazy) image loads — no layout shift. All shots share a ratio per device
// (desktop captures 16:10, phone ~9:19.5); `height:auto` keeps display natural.
const dims = computed(() =>
  props.device === "phone" ? { w: 700, h: 1515 } : { w: 1600, h: 1000 },
)
</script>

<style scoped lang="scss">
.shot {
  display: block;
  width: 100%;
  padding: 0;
  text-align: left;
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  cursor: zoom-in;
}
.shot-frame {
  display: block;
  overflow: hidden;
  border: 1px solid rgb(var(--v-theme-border));
  background: rgb(var(--v-theme-surface));
  transition: border-color 0.3s ease;
}
.shot--browser .shot-frame,
.shot--featured .shot-frame {
  border-radius: 12px;
}
.shot--phone .shot-frame {
  max-width: 300px;
  margin-inline: auto;
  padding: 6px;
  border-radius: 28px;
}
.shot--phone .shot-img {
  border-radius: 22px;
}

// Minimal browser chrome — dots + a faint address pill, neutral so it never
// competes with the colourful screenshot beneath it.
.shot-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  background: rgb(var(--v-theme-surface-2));
  border-bottom: 1px solid rgb(var(--v-theme-border));
}
.shot-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-muted));
  opacity: 0.4;
}
.shot-addr {
  flex: 1;
  max-width: 220px;
  height: 12px;
  margin-left: 8px;
  border-radius: 6px;
  background: rgb(var(--v-theme-border));
}
.shot-img {
  display: block;
  width: 100%;
  height: auto;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.shot-cap {
  display: block;
  margin-top: var(--space-sm);
}

// Hover / focus: image lifts, hairline strengthens to full ink (the system has
// no shadow — hover IS the hairline going to ink).
@media (hover: hover) {
  .shot:hover .shot-img,
  .shot:focus-visible .shot-img {
    transform: scale(1.03);
  }
  .shot:hover .shot-frame,
  .shot:focus-visible .shot-frame {
    border-color: rgb(var(--v-theme-on-background));
  }
}
.shot:focus-visible {
  outline: 2px solid rgb(var(--v-theme-on-background));
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .shot-img {
    transition: none;
  }
  .shot:hover .shot-img,
  .shot:focus-visible .shot-img {
    transform: none;
  }
}
</style>
