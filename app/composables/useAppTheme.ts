// app/composables/useAppTheme.ts
import { useTheme } from 'vuetify'

export const useAppTheme = () => {
  const theme = useTheme()
  const isDark = computed(() => theme.current.value.dark)

  const toggleTheme = (event?: MouseEvent) => {
    const applyTheme = () => {
      const newTheme = isDark.value ? 'light' : 'dark'
      theme.global.name.value = newTheme
      localStorage.setItem('portfolio-theme', newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
      document.documentElement.style.colorScheme = newTheme
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

  /** Re-sync Vuetify theme from localStorage (bfcache / tab restore). */
  const syncTheme = () => {
    const saved = localStorage.getItem('portfolio-theme') || 'dark'
    theme.global.name.value = saved
    document.documentElement.setAttribute('data-theme', saved)
    document.documentElement.style.colorScheme = saved
  }

  return { isDark, toggleTheme, syncTheme }
}