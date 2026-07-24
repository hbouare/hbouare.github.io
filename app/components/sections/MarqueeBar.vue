<!-- app/components/sections/MarqueeBar.vue -->
<template>
  <!-- Borders are hairline tokens in CSS, not inline styles. -->
  <v-sheet ref="root" class="marquee-wrap" color="surface">
    <div
      ref="track"
      class="marquee-track"
      @mouseenter="onHover(true)"
      @mouseleave="onHover(false)"
    >
      <span
        v-for="(item, i) in items.concat(items)"
        :key="i"
        class="marquee-item-wrap"
      >
        <span v-if="i % 2 === 0" class="marquee-text type-micro-cap">{{
          item
        }}</span>
        <span v-else class="marquee-dot" aria-hidden="true">◆</span>
      </span>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from "vue"
import { EASE } from "~/config/motion"

const root = ref<HTMLElement | ComponentPublicInstance | null>(null)
const track = ref<HTMLElement | null>(null)

const { gsap, ScrollTrigger } = useGsap()

// The continuous scroll and the velocity skew both live on the same
// element's transform — CSS keyframes cannot compose translateX with a
// JS-driven skewX, which is exactly why this one is GSAP rather than CSS.
let loop: gsap.core.Tween | undefined

const onHover = (over: boolean) => {
  if (!loop) return
  // Ease the speed rather than hard-pausing, so hover feels like drag.
  gsap.to(loop, { timeScale: over ? 0 : 1, duration: 0.4, ease: EASE.inOut })
}

useMotion(root, ({ motion }) => {
  const el = track.value
  if (!el) return

  // Reduced motion: the marquee sits static. The doubled item list is
  // harmless — it is clipped by the wrapper's overflow.
  if (!motion) return

  loop = gsap.to(el, {
    xPercent: -50,
    duration: 30,
    ease: EASE.none,
    repeat: -1,
  })

  // Velocity skew: the strip leans into fast scrolling and relaxes back to
  // flat when scrolling stops. Canonical GSAP pattern — clamp the velocity,
  // set the skew, then tween it home.
  const proxy = { skew: 0 }
  const clamp = gsap.utils.clamp(-6, 6)
  const setSkew = gsap.quickSetter(el, "skewX", "deg")

  ScrollTrigger.create({
    trigger: root.value && "$el" in root.value ? root.value.$el : root.value,
    onUpdate: (self) => {
      const skew = clamp(self.getVelocity() / -400)
      if (Math.abs(skew) > Math.abs(proxy.skew)) {
        proxy.skew = skew
        gsap.to(proxy, {
          skew: 0,
          duration: 0.6,
          ease: EASE.out,
          overwrite: true,
          onUpdate: () => setSkew(proxy.skew),
        })
      }
    },
  })
})

const items = [
  "Python · FastAPI · Django · Flask",
  "◆",
  "Nuxt.js · Vue.js · Vuetify",
  "◆",
  "OpenShift · Kubernetes · Docker",
  "◆",
  "PostgreSQL · Redis · MongoDB",
  "◆",
  "JavaScript · TypeScript · Node.js",
  "◆",
  "Playwright · Selenium · Cypress",
  "◆",
  "Vitest · Jest · pytest",
  "◆",
  "Travis CI · GitLab CI · GitHub Actions",
  "◆",
  "AWS · Terraform",
  "◆",
]
</script>

<style scoped lang="scss">
.marquee-wrap {
  padding: 1rem 0;
  overflow: hidden;
  border-top: 1px solid rgb(var(--v-theme-border));
  border-bottom: 1px solid rgb(var(--v-theme-border));
}
// The scroll loop and skew are GSAP-driven (see script). No CSS keyframes:
// they cannot compose translateX with the velocity skewX on one transform.
.marquee-track {
  display: flex;
  gap: 3rem;
  white-space: nowrap;
  width: max-content;
  will-change: transform;
}
.marquee-text {
  color: rgb(var(--v-theme-muted));
}
.marquee-dot {
  color: rgb(var(--v-theme-muted));
  font-size: 0.7rem;
}
</style>
