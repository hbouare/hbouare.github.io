// app/plugins/vuetify.ts
import '@mdi/font/css/materialdesignicons.min.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

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

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    components,
    directives,
    ssr: true,
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
  app.vueApp.use(vuetify)
})
