// app/plugins/reveal.ts
//
// v-reveal: the scroll reveal, after master's RevealBlock / DisplayTitle.
// One IntersectionObserver for the whole site, no scroll listener, motion on
// opacity/transform only (no CLS).
//
//   v-reveal           fade up (blocks)
//   v-reveal.fade      fade in (text, labels)
//   v-reveal.scale     subtle scale (images)
//   v-reveal.lines     section titles: each line rises from behind a mask
//                      (master's signature move, GSAP SplitText). Desktop
//                      only, as on master; below 760px it is a fade up.
//   v-reveal.stagger   on a container: each child fades up, children that
//                      enter together are offset by --reveal-stagger
//
// Content once shipped in the DOM but stuck at opacity 0. Everything here
// exists so that cannot happen again:
// - The server renders nothing hidden (getSSRProps is empty): without JS,
//   or before hydration, the page is complete.
// - Only elements still BELOW the viewport are hidden, on mount. What is on
//   screen, or above it, is never touched, so nothing visible flickers.
// - The observer's root extends far above the viewport (master did the
//   same), so an element counts as seen once its top passes the bottom
//   edge, whether it was scrolled past, jumped over (anchor, End key,
//   restored scroll) or is in view.
// - It fires as an element starts to enter, not at 85% as master did: an
//   element in the last 15% of a page could never reach that line.
// - Nothing is hidden under reduced motion, without IntersectionObserver,
//   or in print (base.css). If GSAP fails to load, titles fade in instead.
// Values (durations, distance, stagger, ease) are tokens in tokens.css.
import type { Directive } from "vue"

type Variant = "fade" | "scale" | "lines"

/** Children revealed in one batch beyond this index share its delay. */
const MAX_STAGGER = 5
const MOBILE_MAX = 760

let observer: IntersectionObserver | null = null
const staggered = new WeakSet<Element>()
const lined = new WeakSet<Element>()
const targets = new WeakMap<HTMLElement, HTMLElement[]>()

const enabled = () =>
  typeof IntersectionObserver !== "undefined" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** A duration token in seconds, for GSAP. The CSS minifier rewrites units
 *  (900ms → .9s), so both forms are read. */
const seconds = (token: string) => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  const n = parseFloat(raw)
  return raw.endsWith("ms") ? n / 1000 : n
}

// GSAP ships in its own chunk, fetched only when a page has a line reveal.
let gsapLoad: Promise<{
  gsap: typeof import("gsap").gsap
  SplitText: typeof import("gsap/SplitText").SplitText
}> | null = null
const loadGsap = () =>
  (gsapLoad ??= Promise.all([import("gsap"), import("gsap/SplitText")]).then(
    ([{ gsap }, { SplitText }]) => {
      gsap.registerPlugin(SplitText)
      return { gsap, SplitText }
    },
  ))

/** CSS transition, then the reveal classes are dropped so the element's
 *  own transitions (hover backgrounds…) apply again. */
const showPlain = (el: HTMLElement, index: number) => {
  if (index) el.style.setProperty("--reveal-i", String(index))
  el.classList.add("reveal-in")
  el.classList.remove("reveal-hidden")
  const done = (e?: TransitionEvent) => {
    if (e && e.target !== el) return
    el.removeEventListener("transitionend", done)
    clearTimeout(fallback)
    el.classList.remove("reveal-in")
    el.style.removeProperty("--reveal-i")
  }
  // transitionend does not fire if the transition is interrupted.
  const fallback = setTimeout(done, 2000)
  el.addEventListener("transitionend", done)
}

/**
 * Masked line reveal. SplitText rewrites the element's children, and its
 * revert() re-creates them from innerHTML — Vue would lose the nodes it
 * patches. So the split runs on clones, and the ORIGINAL nodes are put back
 * once the lines have risen.
 */
const showLines = async (el: HTMLElement, index: number) => {
  const { gsap, SplitText } = await loadGsap()
  await document.fonts?.ready
  const originals = [...el.childNodes]
  const label = el.getAttribute("aria-label")
  el.replaceChildren(...originals.map((n) => n.cloneNode(true)))
  const split = SplitText.create(el, { type: "lines", mask: "lines" })
  gsap.set(split.lines, { yPercent: 110 })
  el.classList.remove("reveal-hidden")
  const stagger = seconds("--reveal-stagger")
  gsap.to(split.lines, {
    yPercent: 0,
    duration: seconds("--reveal-line-dur"),
    ease: "power3.out",
    stagger,
    delay: index * stagger,
    onComplete: () => {
      el.replaceChildren(...originals)
      if (label === null) el.removeAttribute("aria-label")
      else el.setAttribute("aria-label", label)
    },
  })
}

const show = (el: HTMLElement, index: number) => {
  if (!lined.has(el)) return showPlain(el, index)
  showLines(el, index).catch(() => showPlain(el, index))
}

const getObserver = () =>
  (observer ??= new IntersectionObserver(
    (entries) => {
      let batch = 0
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        observer?.unobserve(el)
        show(el, staggered.has(el) ? Math.min(batch++, MAX_STAGGER) : 0)
      }
    },
    // Top margin: everything above the viewport intersects too (see header).
    { rootMargin: "100000px 0px 0px 0px" },
  ))

/** Hides `el` until it enters, if it is still below the viewport. */
const conceal = (el: HTMLElement, variant?: Variant) => {
  if (el.getBoundingClientRect().top < window.innerHeight) return
  if (variant === "lines") {
    if (window.innerWidth < MOBILE_MAX) variant = undefined
    else {
      lined.add(el)
      loadGsap().catch(() => lined.delete(el))
    }
  }
  el.classList.add("reveal-hidden")
  if (variant) el.classList.add(`reveal--${variant}`)
  getObserver().observe(el)
}

/** Takes charge of the targets of `el` not handled yet. A stagger
 *  container's children can arrive after it mounts (data fetched on client
 *  navigation, a filtered list), so this also runs on update. */
const register = (el: HTMLElement, modifiers: Partial<Record<string, boolean>>) => {
  if (!enabled()) return
  const list = targets.get(el) ?? []
  targets.set(el, list)
  const candidates = modifiers.stagger ? [...el.children] : [el]
  const variant = (["fade", "scale", "lines"] as const).find((v) => modifiers[v])
  for (const t of candidates) {
    if (!(t instanceof HTMLElement) || list.includes(t)) continue
    list.push(t)
    if (modifiers.stagger) staggered.add(t)
    conceal(t, variant)
  }
}

const reveal: Directive<HTMLElement> = {
  mounted(el, { modifiers }) {
    register(el, modifiers)
  },
  updated(el, { modifiers }) {
    if (modifiers.stagger) register(el, modifiers)
  },
  unmounted(el) {
    for (const t of targets.get(el) ?? []) observer?.unobserve(t)
    targets.delete(el)
  },
  getSSRProps: () => ({}),
}

declare module "vue" {
  interface GlobalDirectives {
    vReveal: typeof reveal
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("reveal", reveal)
})
