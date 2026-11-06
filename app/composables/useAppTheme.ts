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

  /**
   * Flip the theme. Given the click, the new theme is revealed as a circle
   * growing from the click point (View Transition, the pre-refonte effect);
   * without View Transitions or under reduced motion it simply swaps.
   */
  const toggleTheme = (event?: MouseEvent) => {
    // Before the first sync, the attribute set by the head script is the truth.
    const current =
      theme.value ?? (document.documentElement.getAttribute("data-theme") as ThemeName | null)
    const next: ThemeName = current === "dark" ? "light" : "dark"
    const apply = () => {
      theme.value = next
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // Storage unavailable (private mode): the choice lasts the session.
      }
    }

    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      apply()
      return
    }

    // A keyboard "click" has no pointer position (detail 0): start from the
    // centre of the button instead.
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    if (event && event.detail > 0) {
      x = event.clientX
      y = event.clientY
    } else if (event?.currentTarget instanceof Element) {
      const r = event.currentTarget.getBoundingClientRect()
      x = r.left + r.width / 2
      y = r.top + r.height / 2
    }
    // Vuetify 4's values, as on the pre-refonte site: origin in % of the
    // viewport, radius 0% → 150% (of the viewport's diagonal / √2), 500ms
    // ease-in-out. The radius overshoots the far corner, so the front keeps
    // its speed across the whole screen instead of easing out at the edge.
    const at = `${((x / window.innerWidth) * 100).toFixed(2)}% ${((y / window.innerHeight) * 100).toFixed(2)}%`

    // The callback must leave the DOM in the new theme: wait for the
    // theme → DOM watcher to flush.
    const transition = document.startViewTransition(async () => {
      apply()
      await nextTick()
    })
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0% at ${at})`, `circle(150% at ${at})`] },
          { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
        )
      })
      .catch(() => {
        // Transition skipped: the theme is applied all the same.
      })
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
