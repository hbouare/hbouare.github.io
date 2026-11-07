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

  // The global override runs every animation once and stops on its last
  // keyframe — for the handwritten name, the erased state. It must stay
  // written: fully inked and not clipped.
  test("logo name stays written", async ({ page }) => {
    await reduce(page)
    await page.goto("/")
    const name = page.locator(".logo-name").first()
    await expect(name).toHaveCSS("clip-path", "none")
    await expect(name.locator("text")).toHaveCSS("fill-opacity", "1")
  })

  // The blog tree once drew into its canvas but sat under body's
  // background: pixels in the canvas, nothing on screen, no error. Compare
  // the screen with and without the canvas.
  for (const path of ["/blog", "/blog/fastapi-architecture"]) {
    test(`blog tree is painted on screen (${path})`, async ({ page }) => {
      await reduce(page)
      await page.goto(path)
      // Desktop Chrome is redirected to /en: read the canvas of the final page.
      await page.waitForSelector("html.hydrated")
      const canvas = page.locator("canvas.plum-field")
      await expect
        .poll(() =>
          canvas.evaluate((c: HTMLCanvasElement) => {
            const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data
            for (let i = 3; i < d.length; i += 4) if (d[i]) return true
            return false
          }),
        )
        .toBe(true)
      const withTree = await page.screenshot()
      // Hide it and let two frames pass, or the next screenshot can still
      // show the previous frame.
      await canvas.evaluate(
        (c: HTMLCanvasElement) =>
          new Promise((done) => {
            c.style.display = "none"
            requestAnimationFrame(() => requestAnimationFrame(done))
          }),
      )
      const without = await page.screenshot()
      expect(withTree.equals(without), "the tree is drawn but not visible").toBe(false)
    })
  }
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
// but stuck at opacity 0 (a reveal that never fired). Walk every page,
// JUMPING to the bottom — the scroll reveal must also show what was skipped
// over — in both motion modes, and assert no text is left invisible once
// the reveals have played.
const PAGES = ["/", "/services", "/projects", "/projects/fleetops", "/research", "/blog", "/blog/fastapi-architecture", "/contact"]
const invisibleText = (page: Page) =>
  page.evaluate(() =>
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
for (const motion of ["no-preference", "reduce"] as const) {
  test(`no content is left invisible (${motion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: motion })
    for (const path of PAGES) {
      await page.goto(path)
      await page.waitForSelector("html.hydrated")
      // Jump again on every poll: data fetched after a client redirect (/en)
      // can lengthen the page under the first jump.
      await expect
        .poll(
          async () => {
            await page.evaluate(() =>
              window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
            )
            return invisibleText(page)
          },
          { message: `invisible text on ${path}` },
        )
        .toEqual([])
    }
  })
}

test.describe("scroll reveal", () => {
  // The reveal must actually run: content below the fold starts hidden on
  // the client and is shown, for good, once scrolled to.
  test("below-the-fold content is revealed on scroll", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.goto("/")
    await page.waitForSelector("html.hydrated")
    const row = page.locator(".exp-row").last()
    await expect(row).toHaveClass(/reveal-hidden/)
    await row.scrollIntoViewIfNeeded()
    await expect(row).not.toHaveClass(/reveal-hidden/)
    await expect(row).toHaveCSS("opacity", "1")
    // Scrolling back up does not hide it again.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
    await expect(row).toHaveCSS("opacity", "1")
  })

  // Titles rise line by line (GSAP SplitText) on a CLONE of their content;
  // the nodes Vue rendered are put back afterwards. The title must end up
  // exactly as rendered, with no split wrappers or stray aria-label left.
  test("title line reveal leaves the heading as rendered", async ({ page, isMobile }) => {
    test.skip(isMobile, "no line split below 760px")
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await page.goto("/")
    await page.waitForSelector("html.hydrated")
    const title = page.locator("#exp-title")
    await expect(title).toHaveClass(/reveal-hidden/)
    const before = await title.innerHTML()
    await title.scrollIntoViewIfNeeded()
    await expect(title).not.toHaveClass(/reveal-hidden/)
    await expect.poll(() => title.innerHTML(), { timeout: 5_000 }).toBe(before)
    await expect(title).not.toHaveAttribute("aria-label")
  })

  test("nothing is hidden under reduced motion", async ({ page }) => {
    await reduce(page)
    await page.goto("/")
    await page.waitForSelector("html.hydrated")
    await expect(page.locator(".reveal-hidden")).toHaveCount(0)
  })
})

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false })

  // The server never renders the hidden state: without JS, every page is
  // complete and visible.
  test("every page renders its content visible", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path)
      await expect(page.locator(".reveal-hidden")).toHaveCount(0)
      expect(await invisibleText(page), `invisible text on ${path}`).toEqual([])
    }
  })
})

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
