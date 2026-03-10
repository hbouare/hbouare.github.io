// app/composables/useScrollReveal.ts
export const useScrollReveal = () => {
  const revealed = ref(false)
  const el = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!el.value) return
    observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { revealed.value = true; observer!.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(el.value)
  })

  onUnmounted(() => observer?.disconnect())

  return { el, revealed }
}
