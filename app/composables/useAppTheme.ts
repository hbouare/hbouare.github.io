// app/composables/useAppTheme.ts
import { useTheme } from 'vuetify'

export const useAppTheme = () => {
  const theme = useTheme()
  const isDark = computed(() => theme.global.name.value === 'dark')

  const toggleTheme = (event?: MouseEvent) => {
    const applyTheme = () => {
      theme.global.name.value = isDark.value ? 'light' : 'dark'
      if (import.meta.client) {
        localStorage.setItem('portfolio-theme', theme.global.name.value)
      }
    }

    // Use View Transition API with clip-path circle animation
    if (
      import.meta.client &&
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

  const initTheme = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem('portfolio-theme')
      if (saved) {
        theme.global.name.value = saved
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        theme.global.name.value = prefersDark ? 'dark' : 'light'
      }
    }
  }

  return { isDark, toggleTheme, initTheme }
}
