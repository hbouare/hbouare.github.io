// app/composables/useAppTheme.ts
import { useTheme } from 'vuetify'

const STORAGE_KEY = 'portfolio-theme'

export const useAppTheme = () => {
  const theme = useTheme()
  const isDark = computed(() => theme.current.value.dark)

  // ── Single reactive watcher: Vuetify theme name → DOM + localStorage ──
  // Every theme change flows through here, no matter the source. Keep this
  // one-way: change the theme through Vuetify (`change`/`toggle`) and let
  // the watcher mirror it outwards. Never write data-theme directly.
  if (import.meta.client) {
    watch(
      () => theme.name.value,
      (name) => {
        localStorage.setItem(STORAGE_KEY, name)
        document.documentElement.setAttribute('data-theme', name)
        document.documentElement.style.colorScheme = name
      },
      { immediate: true },
    )
  }

  /**
   * Toggle dark ↔ light.
   *
   * Vuetify 4 owns the View Transition: `setTransitionOrigin` anchors the
   * clip-path reveal to the click point and `toggle(..., true)` runs the
   * swap inside the transition. Passing no event still works — the reveal
   * just falls back to the framework default origin.
   */
  const toggleTheme = (event?: MouseEvent | PointerEvent) => {
    if (event) theme.setTransitionOrigin(event as PointerEvent)
    return theme.toggle(['dark', 'light'], true)
  }

  /** Re-sync Vuetify from localStorage (bfcache / tab restore / other tab). */
  const syncTheme = () => {
    theme.change(localStorage.getItem(STORAGE_KEY) || 'dark')
  }

  return { isDark, toggleTheme, syncTheme }
}
