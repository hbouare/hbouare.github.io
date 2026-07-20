// app/composables/useGsap.ts
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

/** Plugins loaded on demand — keeps them out of the initial bundle. */
const pluginMap = {
  SplitText: () => import("gsap/SplitText"),
  Flip: () => import("gsap/Flip"),
  Observer: () => import("gsap/Observer"),
  DrawSVGPlugin: () => import("gsap/DrawSVGPlugin"),
} as const

type PluginName = keyof typeof pluginMap

/**
 * Typed access to GSAP plus a lazy loader for plugins used on a single
 * surface. gsap + ScrollTrigger are registered app-wide by the client
 * plugin; anything narrower should be lazy-loaded at the point of use.
 */
export const useGsap = () => {
  async function lazyLoadPlugin(name: PluginName) {
    const mod = (await pluginMap[name]()) as Record<string, unknown>
    const plugin = mod[name]
    gsap.registerPlugin(plugin as object)
    return plugin
  }

  return { gsap, ScrollTrigger, lazyLoadPlugin }
}
