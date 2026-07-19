<!-- app/components/ui/DisplayTitle.vue -->
<!--
  Display-tier heading. Always uppercase, always 700, always positively
  tracked — the system's most recognizable typographic moment.

  Sizing comes from the `--type-display-*` custom properties, which
  stair-step 80 → 60 → 48 → 40 in ONE place (main.scss `:root`). Components
  must never re-declare display sizes or their breakpoints.

  Set `reveal` to give the title a masked line-by-line entrance when it
  scrolls into view — the same signature move as the hero, applied to
  section openers. Off by default: the hero drives its own timeline, and
  most titles do not need it.
-->
<template>
  <component :is="tag" ref="root" :class="`type-display-${level}`">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { SplitText } from "gsap/SplitText"
import { DURATION, EASE, STAGGER, SCROLL_START } from "~/config/motion"

const props = withDefaults(
  defineProps<{
    /** Semantic level — pick for document outline, not for size. */
    tag?: string
    /** Visual tier: xxl = hero, xl = section opener, lg = sub-section. */
    level?: "xxl" | "xl" | "lg"
    /** Masked line reveal on scroll-in. */
    reveal?: boolean
  }>(),
  { tag: "h2", level: "xl", reveal: false },
)

const root = ref<HTMLElement | null>(null)
const { gsap } = useGsap()

useMotion(root, ({ motion, mobile }) => {
  if (!props.reveal) return
  const el = root.value
  if (!el) return

  // Reduced motion or mobile: no line split (metrics-sensitive, and the
  // recompute-on-resize cost is not worth it on small screens). The title
  // already rests visible, so there is nothing to do.
  if (!motion || mobile) return

  SplitText.create(el, {
    type: "lines",
    mask: "lines",
    linesClass: "display-line",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 110,
        duration: DURATION.slow,
        ease: EASE.out,
        stagger: STAGGER.line,
        scrollTrigger: { trigger: el, start: SCROLL_START, once: true },
      }),
  })
})
</script>
