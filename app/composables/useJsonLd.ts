import type { MaybeRefOrGetter } from 'vue'

export function useJsonLd(schema: MaybeRefOrGetter<Record<string, unknown>>) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: () => JSON.stringify(toValue(schema)),
      },
    ],
  })
}
