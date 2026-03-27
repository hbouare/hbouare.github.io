// app/composables/useAppTheme.ts
import { useTheme } from 'vuetify'

const STORAGE_KEY = 'portfolio-theme'

export const useAppTheme = () => {
  const theme = useTheme()
  const isDark = computed(() => theme.current.value.dark)

  // ── Single reactive watcher: Vuetify theme name → DOM + localStorage ──
  // Every theme change flows through here, no matter the source.
  if (import.meta.client) {
    watch(
      () => theme.global.name.value,
      (name) => {
        localStorage.setItem(STORAGE_KEY, name)
        document.documentElement.setAttribute('data-theme', name)
        document.documentElement.style.colorScheme = name
      },
      { immediate: true },
    )
  }

  const toggleTheme = (event?: MouseEvent) => {
    const applyTheme = () => {
      theme.global.name.value = isDark.value ? 'light' : 'dark'
    }

    // Use View Transition API with clip-path circle animation
    if (
      event &&
      'startViewTransition' in document
    ) {
      const x = event.clientX
      const y = event.clientY
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      )

      const transition = (document as any).startViewTransition(() => {
        applyTheme()
      })

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
    } else {
      applyTheme()
    }
  }

  /** Re-sync Vuetify theme from localStorage (bfcache / tab restore / other tab). */
  const syncTheme = () => {
    const saved = localStorage.getItem(STORAGE_KEY) || 'dark'
    // Only assignment needed — the watcher handles DOM + localStorage.
    theme.global.name.value = saved
  }

  return { isDark, toggleTheme, syncTheme }
}