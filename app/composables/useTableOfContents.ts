// app/composables/useTableOfContents.ts

export interface TocHeading {
  id: string
  text: string
  level: number
}

export function useTableOfContents(containerRef: Ref<HTMLElement | null>) {
  const headings = ref<TocHeading[]>([])
  const activeId = ref('')

  let observer: IntersectionObserver | null = null

  function extractHeadings() {
    if (!containerRef.value) return
    const els = containerRef.value.querySelectorAll('h2, h3')
    headings.value = Array.from(els)
      .filter((el) => el.id)
      .map((el) => ({
        id: el.id,
        text: el.textContent?.trim() ?? '',
        level: parseInt(el.tagName[1]),
      }))
  }

  function observeHeadings() {
    if (!containerRef.value) return

    // Track which headings are visible
    const visibleIds = new Set<string>()

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id)
          } else {
            visibleIds.delete(entry.target.id)
          }
        }

        // Pick the first visible heading in DOM order
        const ids = headings.value.map((h) => h.id)
        const firstVisible = ids.find((id) => visibleIds.has(id))
        if (firstVisible) {
          activeId.value = firstVisible
        }
      },
      {
        rootMargin: '0px 0px -70% 0px',
        threshold: 0,
      },
    )

    const els = containerRef.value.querySelectorAll('h2, h3')
    els.forEach((el) => {
      if (el.id) observer!.observe(el)
    })
  }

  onMounted(() => {
    // Wait for ContentRenderer to finish rendering
    nextTick(() => {
      extractHeadings()
      observeHeadings()
    })
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return { headings, activeId }
}
