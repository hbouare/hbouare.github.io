// app/plugins/vuetify.ts
import '@mdi/font/css/materialdesignicons.min.css'
// Global stylesheet: carries the reset + all helper/utility/grid classes
// (spacing, flex, display, responsive variants). vite-plugin-vuetify's
// autoImport only injects per-component styles, so without this the
// utility classes used across the templates are silently no-ops.
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// ── Palette ───────────────────────────────────────────────────────────
// Black-and-white only. The design system treats the absence of a brand
// accent as load-bearing: hierarchy is carried by type, tracking and
// hairlines, never by hue. `primary` is therefore the ink/paper colour
// itself (white on dark, black on light), not a brand tint.
//
// The semantic colours below are the one deliberate exception: they exist
// purely to carry *functional* meaning in forms and feedback, never for
// decoration. Keep them low-chroma so they read as signal, not brand.

const darkTheme = {
  dark: true,
  colors: {
    background: '#000000', // canvas-night
    surface: '#0a0a0a', // canvas-night-soft
    'surface-2': '#141417', // derived — the spec has only two dark steps
    primary: '#ffffff',
    'on-primary': '#000000',
    secondary: '#f0f0fa', // on-primary-mute
    'on-secondary': '#000000',
    'on-background': '#ffffff',
    'on-surface': '#ffffff',
    muted: '#8a8a92', // derived — spec's #f0f0fa is unusable for body meta
    border: '#3a3a3f', // hairline-on-dark
    error: '#e5484d',
    warning: '#e8a33d',
    info: '#8a95a8',
    success: '#46a758',
  },
}

const lightTheme = {
  dark: false,
  colors: {
    background: '#ffffff', // canvas-light
    surface: '#f0f0fa', // canvas-cool
    'surface-2': '#e6e6f0', // derived
    primary: '#000000', // ink
    'on-primary': '#ffffff',
    secondary: '#2a2a2f',
    'on-secondary': '#ffffff',
    'on-background': '#000000',
    'on-surface': '#000000',
    muted: '#5a5a5f', // ink-mute
    border: '#e0e0e8', // hairline-on-light
    error: '#c62a2f',
    warning: '#a86a12',
    info: '#4a5a70',
    success: '#2a7a38',
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    ssr: true,
    theme: {
      defaultTheme: 'dark',
      // Vuetify 4 drives the theme swap through the View Transition API
      // natively; `setTransitionOrigin` in useAppTheme supplies the click
      // point so the reveal grows from the toggle.
      transition: { duration: '500ms' },
      themes: {
        dark: darkTheme,
        light: lightTheme,
      },
    },
    // ── Shape & type language ──────────────────────────────────────────
    // Set once here so components never restate it. Radii map to the
    // system scale: inputs 4px (default), cards 8px ('lg'), CTAs pill.
    defaults: {
      // The ghost outlined pill is the system's only CTA shape. Because it
      // is fully expressed by these defaults, there is no wrapper component
      // for it — use <v-btn> directly.
      VBtn: {
        rounded: 'pill',
        variant: 'outlined',
        class: 'type-button-cap',
      },
      VCard: {
        elevation: 0,
        rounded: 'lg',
      },
      VChip: {
        rounded: 'pill',
        size: 'small',
        variant: 'outlined',
      },
      VTextField: {
        variant: 'outlined',
        rounded: undefined,
      },
      VTextarea: {
        variant: 'outlined',
        rounded: undefined,
      },
    },
  })
  nuxtApp.vueApp.use(vuetify)

  // Restore the saved theme on the client.
  //
  // Vuetify 4 removed writable `theme.global.name` — assigning it hits a
  // deprecation Proxy that is a no-op in production builds, so the theme
  // silently never changes. `change()` is the supported API. No transition
  // here: the initial restore must be instant, before first paint.
  if (import.meta.client) {
    const resolved =
      document.documentElement.getAttribute('data-theme')
      || localStorage.getItem('portfolio-theme')
      || 'dark'
    vuetify.theme.change(resolved)
  }
})
