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

/** The theme as the page actually paints it: attribute AND body colour. */
async function paintedTheme(page: Page) {
  return page.evaluate(() => ({
    attr: document.documentElement.getAttribute("data-theme"),
    bg: getComputedStyle(document.body).backgroundColor,
  }))
}
const BG = { light: "rgb(243, 240, 232)", dark: "rgb(19, 18, 15)" } as const

/** Clicks the visible theme toggle (inside the menu panel on mobile). */
async function toggleTheme(page: Page) {
  await page.waitForSelector("html.hydrated")
  const menu = page.locator("button.menu-toggle")
  if (await menu.isVisible()) await menu.click()
  await page.locator("button.theme-toggle:visible").first().click()
}

test.describe("theme", () => {
  // With no saved choice, the OS preference decides — and is NOT persisted,
  // so a later OS change still applies.
  for (const scheme of ["light", "dark"] as const) {
    test(`defaults to prefers-color-scheme: ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto("/")
      await page.waitForSelector("html.hydrated")
      expect(await paintedTheme(page)).toEqual({ attr: scheme, bg: BG[scheme] })
      expect(
        await page.evaluate(() => localStorage.getItem("portfolio-theme")),
      ).toBeNull()
    })
  }

  // The head script must set the theme BEFORE first paint. If it breaks
  // (a syntax error once did), the page still ends up right after hydration,
  // so every other theme test passes — but each dark visit fades in from
  // light. Read the attribute at DOMContentLoaded, before any app code.
  test("theme is set before first paint", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" })
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        ;(window as unknown as { __dclTheme?: string | null }).__dclTheme =
          document.documentElement.getAttribute("data-theme")
      })
    })
    await page.goto("/")
    expect(
      await page.evaluate(() => (window as unknown as { __dclTheme?: string | null }).__dclTheme),
    ).toBe("dark")
  })

  // The failure this guards shipped twice under Vuetify: the attribute said
  // one theme while the page painted the other. Assert on the painted colour
  // as well as the attribute, and on the persisted choice.
  test("toggle repaints the page and persists the choice", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" })
    await page.goto("/")
    await toggleTheme(page)
    await expect
      .poll(() => paintedTheme(page))
      .toEqual({ attr: "dark", bg: BG.dark })
    expect(
      await page.evaluate(() => localStorage.getItem("portfolio-theme")),
    ).toBe("dark")
  })

  // Restore-on-load and toggle are different code paths.
  test("theme survives a reload", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" })
    await page.goto("/")
    await toggleTheme(page)
    await expect.poll(async () => (await paintedTheme(page)).attr).toBe("dark")
    await page.reload()
    await page.waitForSelector("html.hydrated")
    expect(await paintedTheme(page)).toEqual({ attr: "dark", bg: BG.dark })
  })

  // The toggle label is switched in CSS on data-theme (the server cannot know
  // the theme): exactly one label must show, and it must name the OTHER theme.
  test("toggle label names the other theme", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop toggle")
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto("/")
      // Exactly one label is displayed (CSS on data-theme); read its visible
      // word. Locale-neutral: desktop Chrome lands on /en.
      const shown = page.locator(".desk-tools button.theme-toggle .theme-label:visible > [aria-hidden]")
      await expect(shown).toHaveCount(1)
      await expect(shown).toHaveText(scheme === "light" ? /^(Sombre|Dark)$/ : /^(Clair|Light)$/)
    }
  })

  // The label once changed the toggle's width ("Sombre" 69px, "Clair" 62px):
  // the header re-centred on every toggle and shook on repeated ones.
  test("toggling the theme does not move the header", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop header")
    await page.goto("/")
    await page.waitForSelector("html.hydrated")
    const layout = () =>
      page.evaluate(() =>
        [...document.querySelectorAll(".bar a, .bar button")]
          .filter((el) => el.getClientRects().length)
          .map((el) => {
            const r = el.getBoundingClientRect()
            return `${r.left.toFixed(1)}/${r.width.toFixed(1)}`
          }),
      )
    const before = await layout()
    const { attr } = await paintedTheme(page)
    await toggleTheme(page)
    await expect.poll(async () => (await paintedTheme(page)).attr).not.toBe(attr)
    // Past the theme reveal and the colour fades.
    await page.waitForTimeout(600)
    expect(await layout()).toEqual(before)
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
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme)

      for (const sel of [
        ".hero-title",
        ".hero-title .em-accent",
        ".hero-subtitle",
        ".btn--primary",
        ".figure-value",
        ".eyebrow",
        ".exp-role",
        ".cta-band .cta-text",
        ".cta-band .btn--inverse",
      ]) {
        // After the client redirect to /en, the experience rows arrive with
        // their data, after the page itself.
        await page.locator(sel).first().waitFor({ state: "attached" })
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

  // The hero display size is a fluid token (--fs-hero, clamp 46→132px);
  // it must reach its floor on a phone, not stay at desktop size.
  test("display tier scales down on mobile", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only assertion")
    await page.goto("/")
    const size = await page
      .locator(".hero-title")
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
      await expect(page.locator("main h1")).toBeVisible()
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
  // The toggle once shipped with no accessible name at all. Its name must
  // say what it does, and contain the visible word (label-in-name).
  test("theme toggle has an accessible name", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop toggle")
    await page.emulateMedia({ colorScheme: "light" })
    await page.goto("/")
    await expect(page.locator(".desk-tools button.theme-toggle")).toHaveAccessibleName(
      /^(Passer en mode sombre|Switch to dark mode)$/,
    )
  })

  // The menu button shows below the 760px breakpoint only (CSS). Its visible
  // "Menu"/"Fermer" text is its accessible name.
  test("menu button has an accessible name where it renders", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/")
    const menu = page.locator("button.menu-toggle")
    if (isMobile) {
      await expect(menu).toBeVisible()
      await expect(menu).toHaveAccessibleName(/\S/)
      await expect(menu).toHaveAttribute("aria-expanded", "false")
      await menu.click()
      await expect(menu).toHaveAttribute("aria-expanded", "true")
      await expect(page.locator("#mobile-menu")).toBeVisible()
    } else {
      await expect(menu).toBeHidden()
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
    // The hook and the tech stack both sit above the fold — the stack was
    // hoisted directly under the hook so a technical reader sees it first.
    // The access CTA at the foot reveals on scroll, so drive to the bottom.
    // behavior:"instant" overrides the site-wide `scroll-behavior: smooth`
    // (main.scss), which can otherwise drop a programmatic scrollTo under load.
    await expect(page.locator(".case-hook")).toBeVisible()
    await expect(page.locator(".case-tech")).toBeVisible()
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    )

    const contactCta = page.locator('.case-encart a[href*="/contact"]')
    const publicLink = page.locator('.case-encart a[href^="http"]')
    const hasWayForward =
      (await contactCta.count()) > 0 || (await publicLink.count()) > 0
    expect(hasWayForward, "case study must offer a way forward").toBe(true)

    // The request carries ?project=<slug>, and the form names the project
    // so the visitor doesn't have to.
    if ((await contactCta.count()) > 0) {
      await contactCta.click()
      await expect(page).toHaveURL(/\/contact\?project=fleetops/)
      await expect(page.locator("textarea[name=message]")).toHaveValue(/flotte automobile|Fleet Management/)
    }
  })
})

test.describe("home", () => {
  // The count-up must never ship "0": SSR renders the final values, so a
  // crawler or a no-JS reader sees the real figures.
  test("key figures are prerendered with their final values", async ({
    request,
  }) => {
    const html = await (await request.get("/")).text()
    expect(html).toMatch(/class="figure-value[^"]*"[^>]*>8\+</)
  })

  test("experience lists every engagement with its timeline bar", async ({
    page,
  }) => {
    await page.goto("/")
    const rows = page.locator(".exp-row")
    await expect(rows).toHaveCount(6)
    // The bar is positioned in % of the 2018→2026 axis; an empty style means
    // the start/end frontmatter did not reach the page.
    for (let i = 0; i < 6; i++) {
      await expect(rows.nth(i).locator(".exp-bar")).toHaveAttribute(
        "style",
        /left:\s*[\d.]+%.*width:\s*[\d.]+%/,
      )
    }
    await expect(page.locator(".exp-current")).toHaveCount(1)
  })

  // A blank canvas is the silent failure here: the field must actually paint,
  // with motion and as a still frame under reduced motion.
  for (const motion of ["no-preference", "reduce"] as const) {
    test(`wave field paints (${motion})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: motion })
      await page.goto("/")
      const canvas = page.locator("canvas.wave-field")
      await expect(canvas).toBeAttached({ timeout: 10_000 })
      await expect
        .poll(
          () =>
            canvas.evaluate((c: HTMLCanvasElement) => {
              const ctx = c.getContext("2d")
              if (!ctx || !c.width) return 0
              const d = ctx.getImageData(0, 0, c.width, c.height).data
              let n = 0
              for (let i = 3; i < d.length; i += 4) if (d[i]) n++
              return n
            }),
          { timeout: 10_000 },
        )
        .toBeGreaterThan(1000)
    })
  }

  // Active state follows the section: a case study lights up Projects.
  test("nav marks the current section", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop nav only")
    await page.goto("/projects/fleetops")
    const active = page.locator(".desk-nav .nav-link.is-active")
    await expect(active).toHaveCount(1)
    await expect(active).toHaveAttribute("href", "/projects")
  })
})

test.describe("case studies", () => {
  const slugs = ["fleetops", "finboard", "luckydraw", "securevault"]

  // Story fields still holding a TODO placeholder must be dropped at render,
  // never shown as content.
  for (const slug of slugs) {
    test(`${slug} renders no TODO placeholder`, async ({ page }) => {
      await page.goto(`/projects/${slug}`)
      await expect(page.locator(".case-article")).toBeVisible()
      expect(await page.locator("main").innerText()).not.toMatch(/TODO/i)
    })
  }

  // Lazy images only load once scrolled to; walk the page, then every shot
  // must have decoded (a wrong path is otherwise an empty grey box).
  test("every screenshot loads", async ({ page }) => {
    await page.goto("/projects/fleetops")
    const height = await page.evaluate(() => document.body.scrollHeight)
    for (let y = 0; y < height; y += 600) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y)
    }
    await page.waitForLoadState("networkidle")
    const broken = await page.$$eval(".shot", (imgs) =>
      (imgs as HTMLImageElement[]).filter((i) => !i.naturalWidth).map((i) => i.src),
    )
    expect(broken).toEqual([])
  })
})

test.describe("blog", () => {
  // Every post is in the prerendered list (crawlable); a chip only narrows it.
  test("topic chips filter the list", async ({ page }) => {
    await page.goto("/blog")
    const rows = page.locator(".blog-card")
    const all = await rows.count()
    expect(all).toBe(9)
    const chip = page.locator(".chip", { hasText: "TypeScript" })
    await chip.click()
    await expect(chip).toHaveAttribute("aria-pressed", "true")
    const filtered = await rows.count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThan(all)
  })

  // The contents list comes from the build-time TOC, so it is in the HTML.
  test("article contents are prerendered", async ({ request }) => {
    const html = await (await request.get("/blog/fastapi-architecture")).text()
    expect(html).toMatch(/class="art-toc"/)
    expect(html).toMatch(/href="#[a-z0-9-]+"/)
  })
})

test.describe("contact", () => {
  test("form relies on native validation and toggles topics", async ({ page }) => {
    await page.goto("/contact")
    await expect(page.locator('input[name="name"]')).toHaveAttribute("required", "")
    await expect(page.locator('input[name="email"]')).toHaveAttribute("type", "email")
    await expect(page.locator('textarea[name="message"]')).toHaveAttribute("required", "")
    const topic = page.locator(".topic").first()
    await expect(topic).toHaveAttribute("aria-pressed", "false")
    await topic.click()
    await expect(topic).toHaveAttribute("aria-pressed", "true")
    // No CTA band on the destination page itself.
    await expect(page.locator(".cta-band")).toHaveCount(0)
  })
})

test.describe("back to top", () => {
  // Hidden at the top (and out of the tab order), shown once scrolled,
  // and it must actually bring the page back up.
  test("appears after scrolling and returns to the top", async ({ page }) => {
    await page.goto("/research")
    await page.waitForSelector("html.hydrated")
    const button = page.locator("button.stt")
    await expect(button).toBeHidden()
    await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }))
    await expect(button).toBeVisible()
    await expect(button).toHaveAccessibleName(/.+/)
    await button.click()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    await expect(button).toBeHidden()
  })
})
