<!-- app/components/ui/ThemeLabel.vue -->
<!--
  Content of a theme toggle. Both labels are rendered and CSS shows the one
  matching html[data-theme]: the server cannot know the theme, so a label
  rendered from JS state would be wrong until hydration.
  Both labels share one grid cell, so the toggle is always as wide as the
  longer one. With display:none instead, "Sombre"/"Clair" changed the
  button's width on every toggle and the whole header re-centred — it
  visibly shook on repeated toggles. visibility:hidden also keeps the
  hidden label out of the accessible name.
  Visible text ("Sombre") is contained in the accessible name ("Passer en
  mode sombre") — label-in-name holds for voice control.
-->
<template>
  <span class="theme-labels">
    <span class="theme-label theme-label--to-dark">
      <span aria-hidden="true">{{ $t("header.theme_dark") }}</span>
      <span class="visually-hidden">{{ $t("theme.toggle_dark") }}</span>
    </span>
    <span class="theme-label theme-label--to-light">
      <span aria-hidden="true">{{ $t("header.theme_light") }}</span>
      <span class="visually-hidden">{{ $t("theme.toggle_light") }}</span>
    </span>
  </span>
</template>

<style>
.theme-labels {
  display: inline-grid;
  justify-items: center;
}
.theme-label {
  grid-area: 1 / 1;
}
html[data-theme="dark"] .theme-label--to-dark,
html:not([data-theme="dark"]) .theme-label--to-light {
  visibility: hidden;
}
</style>
