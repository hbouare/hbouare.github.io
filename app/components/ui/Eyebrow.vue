<!-- app/components/ui/Eyebrow.vue -->
<!--
  Micro-cap eyebrow label — the system's standard section/kicker microtext.

  Replaces the old `.section-label` global class, which was restated (with
  drifting sizes) in six different components. Uppercase with positive
  tracking is the system's chrome signature; the leading hairline rule is
  the portfolio's own device for anchoring a label to a section.
-->
<template>
  <p :class="['ui-eyebrow', 'type-micro-cap', toneClass, { 'ui-eyebrow--rule': rule }]">
    <slot />
  </p>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** `muted` drops the label back to secondary text on either canvas. */
    tone?: "default" | "muted"
    /** Leading 28px hairline rule. */
    rule?: boolean
  }>(),
  { tone: "default", rule: true },
)

const toneClass = computed(() =>
  props.tone === "muted" ? "text-muted" : "text-on-background",
)
</script>

<style scoped lang="scss">
.ui-eyebrow {
  margin: 0;
}

.ui-eyebrow--rule::before {
  content: "";
  display: inline-block;
  width: 28px;
  height: 1px;
  background: currentColor;
  vertical-align: middle;
  margin-right: 10px;
}
</style>
