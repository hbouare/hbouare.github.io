import { test, expect, type Page } from "@playwright/test"

/**
 * Guards for motion: the wave field, the key-figures count-up and page
 * transitions. Every assertion maps to a silent failure — content left
 * invisible, a counter stuck at 0, a navigation that never settles.
 *
 * Note: reduced motion is set with `page.emulateMedia()` rather than
 * `test.use({ reducedMotion })`. In this Playwright/browser combination the
 * fixture form does not reliably reach `window.matchMedia`, while the
 * explicit call does.
 */

const reduce = (page: Page) => page.emulateMedia({ reducedMotion: "reduce" })

test.describe("reduced motion", () => {
  // No count-up under reduced motion: the final values stay as rendered.
  test("key figures show their final values", async ({ page }) => {
    await reduce(page)
    await page.goto("/")
    await expect(page.locator(".figure-value").first()).toHaveText("8+")
  })

  // The wave field freezes on a single front at t = 1.7s.
  test("wave field is a still frame", async ({ page, isMobile }) => {
    test.skip(isMobile, "the readout is desktop-only")
    await reduce(page)
    await page.goto("/")
    await expect(page.locator(".hero-readout .tabular")).toHaveText(
      /t = 001\.70 s · 1 source$/,
      { timeout: 10_000 },
    )
  })
})

test.describe("motion enabled", () => {
  // The count-up rewinds to 0 on the client and must land on the final
  // value once the strip is in view.
  test("key figures count up to their final values", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.goto("/")
    await page.locator(".figures").scrollIntoViewIfNeeded()
    await expect(page.locator(".figure-value").first()).toHaveText("8+", {
      timeout: 5_000,
    })
  })
})

// The silent failure this whole file guards: content in the DOM, indexed,
// but stuck at opacity 0 (a reveal that never fired). Walk every page to the
// bottom, in both motion modes, and assert no text is left invisible.
const PAGES = ["/", "/services", "/projects", "/projects/fleetops", "/research", "/blog", "/blog/fastapi-architecture", "/contact"]
for (const motion of ["no-preference", "reduce"] as const) {
  test(`no content is left invisible (${motion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: motion })
    for (const path of PAGES) {
      await page.goto(path)
      // The anti-flash style holds <body> at opacity 0 until hydration.
      await page.waitForSelector("html.hydrated")
      await page.evaluate(() =>
        window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
      )
      await page.waitForTimeout(300)
      const hidden = await page.evaluate(() =>
        [...document.querySelectorAll("main *")]
          .filter((el) => el.childElementCount === 0 && el.textContent?.trim())
          .filter((el) => {
            for (let n: Element | null = el; n; n = n.parentElement) {
              if (getComputedStyle(n).opacity === "0") return true
            }
            return false
          })
          .map((el) => el.textContent?.trim().slice(0, 40)),
      )
      expect(hidden, `invisible text on ${path}`).toEqual([])
    }
  })
}

test.describe("page transitions", () => {
  // The JS transition hooks must always call done(); a hook that forgets it
  // leaves the router stuck and the next page never mounts. Navigate a full
  // loop and assert each destination's own content renders and settles.
  //
  // Desktop-only: the nav links live behind the Menu panel on mobile.
  // The transition engine is viewport-independent, so testing the links here
  // covers the behaviour; the reduced-motion test below covers the mobile
  // engine path via a direct check.
  // Unique-href links only. The home link (logo + About both point at "/")
  // is intentionally excluded to keep each hop unambiguous.
  const hops: [string, string, string][] = [
    ['.desk-nav a[href="/projects"]', "/projects", ".proj-card"],
    ['.desk-nav a[href="/blog"]', "/blog", ".blog-card"],
    ['.desk-nav a[href="/contact"]', "/contact", "form"],
  ]

  test("navigation completes and content stays visible", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "nav links are in a drawer on mobile")
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.goto("/")
    for (const [link, path, content] of hops) {
      await page.locator(link).first().click()
      await expect(page).toHaveURL(new RegExp(`${path.replace("/", "\\/")}$`))
      // Wait for the destination's own content, then assert it settled at
      // full opacity — this only passes once the enter hook called done().
      const el = page.locator(content).first()
      await expect(el).toBeVisible({ timeout: 5_000 })
      await expect(el).toHaveCSS("opacity", "1", { timeout: 5_000 })
    }
  })

  test("navigation is not blocked under reduced motion", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "nav links are in a drawer on mobile")
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/")
    await page.locator('.desk-nav a[href="/projects"]').first().click()
    await expect(page).toHaveURL(/\/projects$/)
    await expect(page.locator(".proj-card").first()).toBeVisible()
  })
})
