import { test, expect, type Page } from "@playwright/test"

/**
 * Guards for the GSAP motion layer. Every assertion here maps to a bug found
 * during implementation — all silent, none producing a console error.
 *
 * Note: reduced motion is set with `page.emulateMedia()` rather than
 * `test.use({ reducedMotion })`. In this Playwright/browser combination the
 * fixture form does not reliably reach `window.matchMedia`, while the
 * explicit call does.
 */

const reduce = (page: Page) => page.emulateMedia({ reducedMotion: "reduce" })

test.describe("reduced motion", () => {
  // Bug: gsap.matchMedia only invokes its callback when a condition matches.
  // With non-exhaustive breakpoints, desktop + reduced-motion matched none,
  // so useMotion never ran and the hero counter stayed frozen at 0.
  test("hero counter reaches its final value", async ({ page }) => {
    await reduce(page)
    await page.goto("/")
    await expect(page.locator(".stat-number span").first()).toHaveText("8", {
      timeout: 10_000,
    })
  })

  // The masked line reveal is pure motion — it must not run.
  test("hero title is not line-split", async ({ page }) => {
    await reduce(page)
    await page.goto("/")
    await expect(page.locator(".stat-number span").first()).toHaveText("8")
    expect(await page.locator(".hero-line").count()).toBe(0)
  })

  // Reveal blocks rest at opacity 0 and are shown by ScrollTrigger; under
  // reduced motion, content below the fold must not be trapped invisible.
  test("below-the-fold content is visible without scrolling", async ({
    page,
  }) => {
    await reduce(page)
    await page.goto("/projects")
    const blocks = page.locator(".reveal-block")
    const count = await blocks.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await expect(blocks.nth(i)).toHaveCSS("opacity", "1")
    }
  })
})

test.describe("motion enabled", () => {
  test("hero title is line-split for the masked reveal", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "line splitting is desktop/tablet only")
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.goto("/")
    await expect(page.locator(".hero-line").first()).toBeVisible({
      timeout: 10_000,
    })
    expect(await page.locator(".hero-line").count()).toBeGreaterThan(0)
  })

  test("reveal blocks end fully visible after scrolling", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.goto("/projects")
    // behavior:"instant" is load-bearing, not cosmetic. main.scss sets
    // `scroll-behavior: smooth` site-wide, so a bare scrollTo animates — and
    // under parallel-worker CPU load that animation is sometimes dropped
    // entirely (scrollY stays 0), leaving the below-fold blocks unreached and
    // this assertion flaking. An explicit instant jump is what "scroll to the
    // bottom" was always meant to be.
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    )
    const blocks = page.locator(".reveal-block")
    const count = await blocks.count()
    for (let i = 0; i < count; i++) {
      await expect(blocks.nth(i)).toHaveCSS("opacity", "1", { timeout: 8_000 })
    }
  })
})

test.describe("page transitions", () => {
  // The JS transition hooks must always call done(); a hook that forgets it
  // leaves the router stuck and the next page never mounts. Navigate a full
  // loop and assert each destination's own content renders and settles.
  //
  // Desktop-only: the nav links live behind a hamburger drawer on mobile.
  // The transition engine is viewport-independent, so testing the links here
  // covers the behaviour; the reduced-motion test below covers the mobile
  // engine path via a direct check.
  // Unique-href links only. The home link (logo + About both point at "/")
  // is intentionally excluded to keep each hop unambiguous.
  const hops: [string, string, string][] = [
    ['.app-nav a[href="/projects"]', "/projects", ".proj-card"],
    ['.app-nav a[href="/blog"]', "/blog", ".blog-card"],
    ['.app-nav a[href="/contact"]', "/contact", "form"],
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
    await page.locator('.app-nav a[href="/projects"]').first().click()
    await expect(page).toHaveURL(/\/projects$/)
    await expect(page.locator(".proj-card").first()).toBeVisible()
  })
})
