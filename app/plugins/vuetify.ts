// app/plugins/vuetify.ts
import { createVuetify } from 'vuetify'
import { aliases as mdiAliases, mdi } from 'vuetify/iconsets/mdi-svg'
import {
  mdiArrowLeft,
  mdiArrowRight,
  mdiArrowTopRight,
  mdiArrowUp,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiGithub,
  mdiLinkedin,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js'

// Components and directives are auto-imported on demand by vite-plugin-vuetify
// (autoImport: true in nuxt.config.ts), so we do NOT register them globally here
// — that keeps the bundle tree-shaken to only what each template actually uses.

const darkTheme = {
  dark: true,
  colors: {
    background:  '#0a0a08',
    surface:     '#111110',
    'surface-2': '#1a1a18',
    primary:     '#c9a96e',
    'primary-lighten': '#e8c97e',
    secondary:   '#6aad7b',
    accent:      '#e07050',
    error:       '#cf6679',
    warning:     '#e8a558',
    info:        '#6b9fdf',
    success:     '#6aad7b',
    'on-background': '#f5f0e8',
    'on-surface':    '#f5f0e8',
    muted:       '#908a7a',
    border:      '#2a2a28',
  },
}

const lightTheme = {
  dark: false,
  colors: {
    background:  '#faf8f4',
    surface:     '#f0ebe0',
    'surface-2': '#e8e2d6',
    primary:     '#8a6530',
    'primary-lighten': '#b08840',
    secondary:   '#2d5038',
    accent:      '#b03518',
    error:       '#b03050',
    warning:     '#a06020',
    info:        '#2a5590',
    success:     '#2d5038',
    'on-background': '#1a1a14',
    'on-surface':    '#1a1a14',
    muted:       '#5c5448',
    border:      '#d0c8b8',
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    icons: {
      defaultSet: 'mdi',
      sets: { mdi },
      // Keep Vuetify's built-in aliases ($next, $prev, $menu, $success…) and add
      // the project's icons as SVG-path aliases referenced as `$arrowRight` etc.
      aliases: {
        ...mdiAliases,
        arrowLeft:     mdiArrowLeft,
        arrowRight:    mdiArrowRight,
        arrowTopRight: mdiArrowTopRight,
        arrowUp:       mdiArrowUp,
        alertCircle:   mdiAlertCircle,
        checkCircle:   mdiCheckCircle,
        github:        mdiGithub,
        linkedin:      mdiLinkedin,
        weatherNight:  mdiWeatherNight,
        weatherSunny:  mdiWeatherSunny,
      },
    },
    theme: {
      defaultTheme: 'dark',
      themes: {
        dark:  darkTheme,
        light: lightTheme,
      },
    },
    defaults: {
      VBtn: {
        style: 'font-family: "DM Mono", monospace; letter-spacing: 0.1em; text-transform: uppercase;',
      },
      VCard: {
        elevation: 0,
        rounded: 0,
      },
      VChip: {
        rounded: 0,
        size: 'small',
      },
    },
  })
  nuxtApp.vueApp.use(vuetify)

  // IMPORTANT: we deliberately do NOT set the theme name here (before mount).
  // The site is statically generated with `defaultTheme: 'dark'`, so the
  // prerendered HTML carries `v-theme--dark` on every node. Switching the theme
  // *before* hydration would make the client's first render diverge from the
  // server's, and Vue does not repaint mismatched `class` during hydration —
  // leaving parts of the UI stuck on the baked dark theme. Instead, the saved
  // theme is applied in app.vue's onMounted (a reactive change, post-hydration),
  // which repaints every `v-theme--*` class cleanly.
  if (import.meta.client) {
    // Single source of truth for persistence: every theme-name change (toggle,
    // bfcache restore, cross-tab sync) is mirrored to localStorage, the
    // <html data-theme> attribute (used by the pre-paint script + Shiki) and
    // colorScheme. This is the ONLY place that writes them.
    watch(
      () => vuetify.theme.global.name.value,
      (name) => {
        localStorage.setItem('portfolio-theme', name)
        document.documentElement.setAttribute('data-theme', name)
        document.documentElement.style.colorScheme = name
      },
    )
  }
})
