// app/composables/useAppTheme.ts
//
// Theme = the `data-theme` attribute on <html>. Everything visual keys off it
// in CSS (tokens.css), and the inline head script (nuxt.config.ts) sets it
// before first paint — so SSR never needs to know the theme and there is no
// flash to hide.
//
// One-way flow: `theme` state → single watcher → DOM. Change the theme only
// through toggleTheme()/syncTheme(); never write data-theme by hand.
//
// Rules:
// - Default = OS preference. Only an explicit toggle is persisted, so until
//   the visitor chooses, a later OS change still applies.
// - Anything that must show the current theme in markup (the toggle label)
//   is switched in CSS on data-theme, not rendered from this state — the
//   server-rendered HTML cannot know the theme, CSS can.

const STORAGE_KEY = "portfolio-theme"

export type ThemeName = "light" | "dark"

const readSaved = (): ThemeName | null => {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === "light" || v === "dark" ? v : null
  } catch {
    return null
  }
}

const osPreference = (): ThemeName =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

export const useAppTheme = () => {
  // null until the client syncs: the server does not know the theme.
  const theme = useState<ThemeName | null>("app-theme", () => null)
  const isDark = computed(() => theme.value === "dark")

  /** Re-read the saved choice, else the OS preference. Client only. */
  const syncTheme = () => {
    theme.value = readSaved() ?? osPreference()
  }

  const toggleTheme = () => {
    // Before the first sync, the attribute set by the head script is the truth.
    const current =
      theme.value ?? (document.documentElement.getAttribute("data-theme") as ThemeName | null)
    theme.value = current === "dark" ? "light" : "dark"
    try {
      localStorage.setItem(STORAGE_KEY, theme.value)
    } catch {
      // Storage unavailable (private mode): the choice lasts the session.
    }
  }

  return { theme, isDark, toggleTheme, syncTheme }
}

/**
 * Installs the single theme → DOM watcher. Called once, from app.vue.
 */
export const useThemeDomSync = () => {
  const { theme } = useAppTheme()
  if (import.meta.client) {
    watch(theme, (name) => {
      if (!name) return
      document.documentElement.setAttribute("data-theme", name)
      document.documentElement.style.colorScheme = name
    })
  }
}
