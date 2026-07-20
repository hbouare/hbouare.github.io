// app/plugins/gsap.client.ts
//
// Client-only: GSAP touches the DOM and window, so it must never run during
// SSG prerendering. Plugins are registered once here rather than in every
// component.
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
// SplitText drives the hero's masked line reveal. It lives on the landing
// page, so it is needed immediately on the most-visited route — lazy-loading
// it there would add async complexity for no bundle benefit. Register it
// globally so the hero's setup stays synchronous and its cleanup stays
// tracked by gsap.matchMedia.
import { SplitText } from "gsap/SplitText"

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText)

  // Global defaults so individual tweens stay terse and consistent.
  gsap.defaults({ ease: "power3.out", duration: 0.6 })

  // ScrollTrigger caches element positions. Nuxt page transitions and async
  // content (Nuxt Content collections) change layout after triggers are
  // created, so refresh once the router has settled.
  const router = useRouter()
  router.afterEach(() => {
    // Two frames: one for Vue to patch the DOM, one for layout to settle.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => ScrollTrigger.refresh()),
    )
  })
})
