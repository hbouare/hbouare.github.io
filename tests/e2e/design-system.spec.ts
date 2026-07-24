import { test, expect, type Page } from "@playwright/test"

/**
 * Regression guards for the design-system refactor.
 *
 * Every test here corresponds to a bug that actually shipped or was found in
 * this codebase. None of them produced a console error — they were all silent
 * failures, which is why they need explicit assertions rather than a smoke
 * test that only checks the page loads.
 */

/** Relative luminance → WCAG contrast ratio. */
function contrast(fg: [number, number, number], bg: [number, number, number]) {
  const lum = (c: number[]) => {
    const [r, g, b] = c.map((v) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }) as [number, number, number]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a) as [number, number]
  return (l1 + 0.05) / (l2 + 0.05)
}

/** Resolved foreground + first non-transparent background behind an element. */
async function colorsOf(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const parse = (s: string): [number, number, number] => {
      const m = s.match(/[\d.]+/g) ?? ["0", "0", "0"]
      return s.startsWith("color(srgb")
        ? (m.slice(0, 3).map((v) => Math.round(parseFloat(v) * 255)) as [number, number, number])
        : (m.slice(0, 3).map(Number) as [number, number, number])
    }
    const el = document.querySelector(sel)
    if (!el) throw new Error(`not found: ${sel}`)
    let node: Element | null = el
    let bg: [number, number, number] = [0, 0, 0]
    while (node) {
      const c = getComputedStyle(node).backgroundColor
      if (c && !/,\s*0\)$/.test(c) && c !== "transparent") {
        bg = parse(c)
        break
      }
      node = node.parentElement
    }
    return { fg: parse(getComputedStyle(el).color), bg }
  }, selector)
}

const themeClass = (page: Page) =>
  page.locator(".v-application").getAttribute("class")

test.describe("theme", () => {
  // Guards the bug where Vuetify 4 made theme.global.name read-only: the DOM
  // went light (data-theme, body background) while .v-application stayed
  // v-theme--dark. Assert on the Vuetify class, not on data-theme.
  test("toggle switches the Vuetify theme, not just the DOM attribute", async ({
    page,
  }) => {
    await page.goto("/")
    expect(await themeClass(page)).toContain("v-theme--dark")

    await page.locator("button.theme-toggle").first().click()
    await expect(page.locator(".v-application")).toHaveClass(/v-theme--light/)

    // All three layers must agree — the failure mode was them diverging.
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
    expect(
      await page.evaluate(() => localStorage.getItem("portfolio-theme")),
    ).toBe("light")
  })

  test("theme survives a reload", async ({ page }) => {
    await page.goto("/")
    await page.locator("button.theme-toggle").first().click()
    await expect(page.locator(".v-application")).toHaveClass(/v-theme--light/)

    await page.reload()
    await expect(page.locator(".v-application")).toHaveClass(/v-theme--light/)
  })
})

test.describe("vuetify integration", () => {
  // Guards the missing `import 'vuetify/styles'`, which silently turned every
  // utility class into a no-op while the templates still referenced them.
  test("utility classes are actually applied", async ({ page }) => {
    await page.goto("/")
    const applied = await page.evaluate(() => {
      const probe = document.createElement("div")
      probe.className = "d-flex mb-6 ga-4"
      document.body.appendChild(probe)
      const s = getComputedStyle(probe)
      const result = {
        display: s.display,
        marginBottom: s.marginBottom,
        gap: s.gap,
      }
      probe.remove()
      return result
    })
    expect(applied.display).toBe("flex")
    expect(applied.marginBottom).not.toBe("0px")
    expect(applied.gap).not.toBe("normal")
  })
})

test.describe("contrast", () => {
  // Guards two shipped bugs: white-on-white CTAs (color="primary" + flat) and
  // text painted in the surface colour (color="surface" on an outlined card).
  // A monochrome UI hides these — they look like empty space, not like a bug.
  for (const theme of ["dark", "light"] as const) {
    test(`key text meets WCAG AA in ${theme}`, async ({ page }) => {
      // The preference has to be written after the first navigation:
      // addInitScript runs before the origin is established, so it would
      // target the wrong localStorage.
      await page.goto("/")
      await page.evaluate((t) => localStorage.setItem("portfolio-theme", t), theme)
      await page.reload()
      // Generous timeout: the whole suite runs parallel against one static
      // server, so hydration can lag well past the 5s default.
      await expect(page.locator(".v-application")).toHaveClass(
        new RegExp(`v-theme--${theme}`),
        { timeout: 20_000 },
      )

      for (const sel of [
        ".type-display-xxl",
        ".hero-subtitle",
        ".v-btn",
        ".stat-number",
        ".ui-eyebrow",
      ]) {
        const { fg, bg } = await colorsOf(page, sel)
        expect(contrast(fg, bg), `${sel} in ${theme}`).toBeGreaterThanOrEqual(4.5)
      }
    })
  }
})

test.describe("layout", () => {
  test("no horizontal overflow", async ({ page }) => {
    for (const path of ["/", "/projects", "/research", "/blog", "/contact"]) {
      await page.goto(path)
      const overflows = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      )
      expect(overflows, `horizontal overflow on ${path}`).toBe(false)
    }
  })

  // The display tier must stair-step from the :root tokens, not from
  // per-component breakpoints.
  test("display tier scales down on mobile", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only assertion")
    await page.goto("/")
    const size = await page
      .locator(".type-display-xxl")
      .first()
      .evaluate((el) => parseInt(getComputedStyle(el).fontSize))
    expect(size).toBeLessThanOrEqual(60)
  })
})

test.describe("routes", () => {
  // Nav changes can break Nitro's crawlLinks discovery, silently dropping
  // prerendered pages from the build.
  const paths = [
    "/",
    "/projects",
    "/research",
    "/blog",
    "/contact",
    "/blog/nuxt4-introduction",
    "/en",
    "/en/blog",
    "/en/research",
  ]
  for (const path of paths) {
    test(`${path} renders`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)
      await expect(page.locator(".v-application")).toBeVisible()
    })
  }
})

test.describe("research", () => {
  // The publications page must render every real paper as a card that links
  // out to the original publication — the page's whole credibility rests on
  // those links resolving to external sources.
  test("every publication card links out to its source", async ({ page }) => {
    await page.goto("/research")
    const cards = page.locator(".pub-card")
    const count = await cards.count()
    expect(count).toBe(5)

    for (let i = 0; i < count; i++) {
      const link = cards.nth(i).locator("a.pub-link")
      await expect(link).toHaveAttribute("href", /^https?:\/\//)
      await expect(link).toHaveAttribute("target", "_blank")
    }
  })

  // The impact section is Act III — it ties the research back to engineering
  // and must render its full set of items, revealed on scroll.
  test("impact section reveals its items", async ({ page }) => {
    await page.goto("/research")
    // behavior:"instant" overrides the site-wide `scroll-behavior: smooth`
    // (main.scss): a smooth scrollTo can be dropped under parallel-worker load
    // and leave scrollY at 0, so the below-fold items never enter view.
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    )
    const items = page.locator(".impact-item")
    await expect(items.first()).toBeVisible({ timeout: 8_000 })
    expect(await items.count()).toBe(8)
  })
})

test.describe("accessibility", () => {
  // Both icon-only toggles shipped with no accessible name at all.
  test("theme toggle has an accessible name", async ({ page }) => {
    await page.goto("/")
    const label = await page
      .locator("button.theme-toggle")
      .first()
      .getAttribute("aria-label")
    expect(label, "theme-toggle needs an aria-label").toBeTruthy()
  })

  // The menu button is rendered only below the md breakpoint (v-if=smAndDown),
  // so it exists on the mobile project but not on desktop.
  test("menu button has an accessible name where it renders", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/")
    const menu = page.locator("button.menu-toggle")
    if (isMobile) {
      await expect(menu).toBeVisible()
      expect(await menu.getAttribute("aria-label")).toBeTruthy()
      expect(await menu.getAttribute("aria-expanded")).toBe("false")
    } else {
      await expect(menu).toHaveCount(0)
    }
  })
})

test.describe("projects", () => {
  // Each index card is a teaser that links to its full case study.
  test("every project teaser links to its case study", async ({ page }) => {
    await page.goto("/projects")
    const cards = page.locator(".proj-card")
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const href = await cards.nth(i).getAttribute("href")
      expect(href, `card ${i} links to a case study`).toMatch(
        /\/projects\/[a-z]+$/,
      )
    }
  })

  // The case study must render its narrative and still offer a way forward
  // (request access → contact, or a public link) rather than dead-ending.
  test("case study renders and routes to contact", async ({ page }) => {
    const res = await page.goto("/projects/fleetops")
    expect(res?.status()).toBe(200)
    // The hook is above the fold; the results block sits just below it and the
    // access CTA at the foot reveals on scroll, so drive to the bottom.
    // behavior:"instant" overrides the site-wide `scroll-behavior: smooth`
    // (main.scss), which can otherwise drop a programmatic scrollTo under load.
    await expect(page.locator(".case-hook")).toBeVisible()
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    )
    await expect(page.locator(".case-impact")).toBeVisible({ timeout: 8_000 })

    const contactCta = page.locator('.case-encart a[href$="/contact"]')
    const publicLink = page.locator('.case-encart a[href^="http"]')
    const hasWayForward =
      (await contactCta.count()) > 0 || (await publicLink.count()) > 0
    expect(hasWayForward, "case study must offer a way forward").toBe(true)
  })
})
