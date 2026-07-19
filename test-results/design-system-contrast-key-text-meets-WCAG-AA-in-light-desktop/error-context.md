# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: design-system.spec.ts >> contrast >> key text meets WCAG AA in light
- Location: tests\e2e\design-system.spec.ts:112:5

# Error details

```
Error: expect(locator).toHaveClass(expected) failed

Locator: locator('.v-application')
Expected pattern: /v-theme--light/
Received string:  "v-application v-theme--dark v-layout v-layout--full-height v-locale--is-ltr"
Timeout: 20000ms

Call log:
  - Expect "toHaveClass" with timeout 20000ms
  - waiting for locator('.v-application')
    37 × locator resolved to <div class="v-application v-theme--dark v-layout v-layout--full-height v-locale--is-ltr">…</div>
       - unexpected value "v-application v-theme--dark v-layout v-layout--full-height v-locale--is-ltr"

```

```yaml
- banner:
  - link:
    - /url: /
  - navigation
  - button "FR"
  - button "Mode clair"
  - button "Ouvrir le menu"
- navigation:
  - list
- main:
  - paragraph: Full-Stack · Data Engineer · DevOps
  - heading "Building the future line by line" [level=1]
  - paragraph: Engineer and PhD specializing in the design and development of data-driven digital systems. Experienced across the full application lifecycle, from data modeling and backend services to interface development and production deployment. Focused on turning complex data challenges into scalable and reliable technical solutions that support both research and operational teams.
  - link "See my projects":
    - /url: /projects
  - link "Contact me":
    - /url: /contact
  - link "Download CV":
    - /url: /cv/cv-hamed-bouare-fr.pdf
  - paragraph: International experience
  - text: 🇫🇷 France 🇬🇧 United Kingdom 🇩🇿 Algeria 8+ Years of exp. 3 Countries 20+ Projects shipped
  - img
  - text: Curiosity Python · FastAPI · Django · Flask Nuxt.js · Vue.js · Vuetify OpenShift · Kubernetes · Docker PostgreSQL · Redis · Mongodb Javascript · TypeScript · Node.js Playwright · Selenium · Cypress Vitest · Jest · Pytest Travis · Gitlab ci · Github actions Aws · Terraform Python · FastAPI · Django · Flask Nuxt.js · Vue.js · Vuetify OpenShift · Kubernetes · Docker PostgreSQL · Redis · Mongodb Javascript · TypeScript · Node.js Playwright · Selenium · Cypress Vitest · Jest · Pytest Travis · Gitlab ci · Github actions Aws · Terraform
  - paragraph: 01 — About
  - heading "Versatile developer & world explorer" [level=2]
  - paragraph: "Working on projects across several countries has shaped the way I approach engineering challenges: listening first, understanding the context, and collaborating with teams from diverse cultural and professional backgrounds."
  - paragraph: I believe the best software is the kind that genuinely simplifies people’s work and frees up time for what truly matters.
  - paragraph: This belief guides both my technical decisions and the way I collaborate with product and business teams.
  - paragraph: 02 — Experience
  - heading "Where I've built things" [level=2]
  - text: June 2024 — Present
  - heading "Data Engineer & Full-Stack Developer" [level=3]
  - paragraph: EDF
  - paragraph: Contributed to the development of applications and tools dedicated to the processing and enhancement of energy data within the DevCo team. Worked closely with business stakeholders to understand their needs and design technical solutions that facilitate the analysis, transformation, and validation of data used in their operations.
  - text: Python Vue.js Typescript OpenShift Airflow Redis Gitlab CD/CD PostgreSQL Playwright 🇫🇷 Saint-Denis, France April 2024 — February 2026
  - heading "Full-Stack Developer" [level=3]
  - paragraph: Paris Institute for Advanced Study
  - paragraph: The Paris Institute for Advanced Study is an international research center that hosts scholars from around the world to foster interdisciplinary collaboration and the development of scientific projects. Contributed to the redesign of the institute’s website by implementing new features and improving the user interface and overall user experience, helping to showcase research programs, institutional activities, and visiting researchers.
  - text: Nuxt.js Typescript Aws Mongodb Github Actions Terraform 🇫🇷 Paris, France January 2023 — January 2024
  - heading "Front-End Developer" [level=3]
  - paragraph: GE HealthCare
  - paragraph: Contributed to the development of several web applications integrating artificial intelligence technologies for the analysis and monitoring of complex medical conditions, particularly glioblastoma, an aggressive form of brain cancer. These applications enable the processing and analysis of medical data to support research, monitoring, and the study of this pathology.
  - text: TypeScript Python Imaging Framework Playwright Docker Jenkins SinonJs Rally 🇫🇷 Buc, France June 2022 — December 2022
  - heading "Full-Stack Developer" [level=3]
  - paragraph: BHP
  - paragraph: BHP Group is a global mining company specializing in the extraction of resources such as iron ore, diamonds, uranium, coal, oil, and bauxite, with operations across multiple countries. Contributed to the improvement of a web application designed to analyze activities across mining sites by facilitating the centralization and exploitation of operational data.
  - text: Nodes.js Vue.js Mongodb Postgresql Gitlab CD/CD Docker Jira 🇫🇷 Paris, France September 2021 — June 2022
  - heading "Back-End Developer" [level=3]
  - paragraph: SNCF
  - paragraph: Contributed to the development of a web application designed to analyze interactions between trains and railway infrastructure for the DGII-VA-I division of SNCF. The tool relies on numerical simulations to help maintenance teams identify sections of the rail network that may present operational risks and to anticipate maintenance interventions.
  - text: Python Postgresql Matlab Angular Gitlab CI/CD Docker Jira 🇫🇷 Paris, France April 2018 — September 2021
  - heading "Research Engineer & Back-End Developer" [level=3]
  - paragraph: LSBB & Avignon University
  - paragraph: The Low Noise Underground Laboratory (LSBB), located in Rustrel (Vaucluse, France), is an interdisciplinary research facility established within a former military base that has been repurposed for scientific research. It consists of a network of underground galleries excavated in a highly heterogeneous karstic massif, whose geological characteristics influence the propagation of mechanical waves and the distribution of stress fields around the tunnels.
  - paragraph: In this context, contributed to the design and development of a robust application based on numerical simulations, aimed at studying wave propagation within these underground galleries and analyzing the dynamic response of the tunnel and its surrounding environment under both harmonic and transient conditions.
  - text: 🇫🇷 & 🇬🇧 Avignon, France & Edinburgh, United Kingdom
- contentinfo: © 2026 Hamed Bouare — All rights reserved Available for new projects
```

# Test source

```ts
  21  |   const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a) as [number, number]
  22  |   return (l1 + 0.05) / (l2 + 0.05)
  23  | }
  24  | 
  25  | /** Resolved foreground + first non-transparent background behind an element. */
  26  | async function colorsOf(page: Page, selector: string) {
  27  |   return page.evaluate((sel) => {
  28  |     const parse = (s: string): [number, number, number] => {
  29  |       const m = s.match(/[\d.]+/g) ?? ["0", "0", "0"]
  30  |       return s.startsWith("color(srgb")
  31  |         ? (m.slice(0, 3).map((v) => Math.round(parseFloat(v) * 255)) as [number, number, number])
  32  |         : (m.slice(0, 3).map(Number) as [number, number, number])
  33  |     }
  34  |     const el = document.querySelector(sel)
  35  |     if (!el) throw new Error(`not found: ${sel}`)
  36  |     let node: Element | null = el
  37  |     let bg: [number, number, number] = [0, 0, 0]
  38  |     while (node) {
  39  |       const c = getComputedStyle(node).backgroundColor
  40  |       if (c && !/,\s*0\)$/.test(c) && c !== "transparent") {
  41  |         bg = parse(c)
  42  |         break
  43  |       }
  44  |       node = node.parentElement
  45  |     }
  46  |     return { fg: parse(getComputedStyle(el).color), bg }
  47  |   }, selector)
  48  | }
  49  | 
  50  | const themeClass = (page: Page) =>
  51  |   page.locator(".v-application").getAttribute("class")
  52  | 
  53  | test.describe("theme", () => {
  54  |   // Guards the bug where Vuetify 4 made theme.global.name read-only: the DOM
  55  |   // went light (data-theme, body background) while .v-application stayed
  56  |   // v-theme--dark. Assert on the Vuetify class, not on data-theme.
  57  |   test("toggle switches the Vuetify theme, not just the DOM attribute", async ({
  58  |     page,
  59  |   }) => {
  60  |     await page.goto("/")
  61  |     expect(await themeClass(page)).toContain("v-theme--dark")
  62  | 
  63  |     await page.locator("button.theme-toggle").first().click()
  64  |     await expect(page.locator(".v-application")).toHaveClass(/v-theme--light/)
  65  | 
  66  |     // All three layers must agree — the failure mode was them diverging.
  67  |     await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
  68  |     expect(
  69  |       await page.evaluate(() => localStorage.getItem("portfolio-theme")),
  70  |     ).toBe("light")
  71  |   })
  72  | 
  73  |   test("theme survives a reload", async ({ page }) => {
  74  |     await page.goto("/")
  75  |     await page.locator("button.theme-toggle").first().click()
  76  |     await expect(page.locator(".v-application")).toHaveClass(/v-theme--light/)
  77  | 
  78  |     await page.reload()
  79  |     await expect(page.locator(".v-application")).toHaveClass(/v-theme--light/)
  80  |   })
  81  | })
  82  | 
  83  | test.describe("vuetify integration", () => {
  84  |   // Guards the missing `import 'vuetify/styles'`, which silently turned every
  85  |   // utility class into a no-op while the templates still referenced them.
  86  |   test("utility classes are actually applied", async ({ page }) => {
  87  |     await page.goto("/")
  88  |     const applied = await page.evaluate(() => {
  89  |       const probe = document.createElement("div")
  90  |       probe.className = "d-flex mb-6 ga-4"
  91  |       document.body.appendChild(probe)
  92  |       const s = getComputedStyle(probe)
  93  |       const result = {
  94  |         display: s.display,
  95  |         marginBottom: s.marginBottom,
  96  |         gap: s.gap,
  97  |       }
  98  |       probe.remove()
  99  |       return result
  100 |     })
  101 |     expect(applied.display).toBe("flex")
  102 |     expect(applied.marginBottom).not.toBe("0px")
  103 |     expect(applied.gap).not.toBe("normal")
  104 |   })
  105 | })
  106 | 
  107 | test.describe("contrast", () => {
  108 |   // Guards two shipped bugs: white-on-white CTAs (color="primary" + flat) and
  109 |   // text painted in the surface colour (color="surface" on an outlined card).
  110 |   // A monochrome UI hides these — they look like empty space, not like a bug.
  111 |   for (const theme of ["dark", "light"] as const) {
  112 |     test(`key text meets WCAG AA in ${theme}`, async ({ page }) => {
  113 |       // The preference has to be written after the first navigation:
  114 |       // addInitScript runs before the origin is established, so it would
  115 |       // target the wrong localStorage.
  116 |       await page.goto("/")
  117 |       await page.evaluate((t) => localStorage.setItem("portfolio-theme", t), theme)
  118 |       await page.reload()
  119 |       // Generous timeout: the whole suite runs parallel against one static
  120 |       // server, so hydration can lag well past the 5s default.
> 121 |       await expect(page.locator(".v-application")).toHaveClass(
      |                                                    ^ Error: expect(locator).toHaveClass(expected) failed
  122 |         new RegExp(`v-theme--${theme}`),
  123 |         { timeout: 20_000 },
  124 |       )
  125 | 
  126 |       for (const sel of [
  127 |         ".type-display-xxl",
  128 |         ".hero-subtitle",
  129 |         ".v-btn",
  130 |         ".stat-number",
  131 |         ".ui-eyebrow",
  132 |       ]) {
  133 |         const { fg, bg } = await colorsOf(page, sel)
  134 |         expect(contrast(fg, bg), `${sel} in ${theme}`).toBeGreaterThanOrEqual(4.5)
  135 |       }
  136 |     })
  137 |   }
  138 | })
  139 | 
  140 | test.describe("layout", () => {
  141 |   test("no horizontal overflow", async ({ page }) => {
  142 |     for (const path of ["/", "/projects", "/blog", "/contact"]) {
  143 |       await page.goto(path)
  144 |       const overflows = await page.evaluate(
  145 |         () =>
  146 |           document.documentElement.scrollWidth >
  147 |           document.documentElement.clientWidth,
  148 |       )
  149 |       expect(overflows, `horizontal overflow on ${path}`).toBe(false)
  150 |     }
  151 |   })
  152 | 
  153 |   // The display tier must stair-step from the :root tokens, not from
  154 |   // per-component breakpoints.
  155 |   test("display tier scales down on mobile", async ({ page, isMobile }) => {
  156 |     test.skip(!isMobile, "mobile-only assertion")
  157 |     await page.goto("/")
  158 |     const size = await page
  159 |       .locator(".type-display-xxl")
  160 |       .first()
  161 |       .evaluate((el) => parseInt(getComputedStyle(el).fontSize))
  162 |     expect(size).toBeLessThanOrEqual(60)
  163 |   })
  164 | })
  165 | 
  166 | test.describe("routes", () => {
  167 |   // Nav changes can break Nitro's crawlLinks discovery, silently dropping
  168 |   // prerendered pages from the build.
  169 |   const paths = [
  170 |     "/",
  171 |     "/projects",
  172 |     "/blog",
  173 |     "/contact",
  174 |     "/blog/nuxt4-introduction",
  175 |     "/en",
  176 |     "/en/blog",
  177 |   ]
  178 |   for (const path of paths) {
  179 |     test(`${path} renders`, async ({ page }) => {
  180 |       const res = await page.goto(path)
  181 |       expect(res?.status()).toBe(200)
  182 |       await expect(page.locator(".v-application")).toBeVisible()
  183 |     })
  184 |   }
  185 | })
  186 | 
  187 | test.describe("accessibility", () => {
  188 |   // Both icon-only toggles shipped with no accessible name at all.
  189 |   test("icon-only controls have accessible names", async ({ page }) => {
  190 |     await page.goto("/")
  191 |     for (const sel of ["button.theme-toggle", "button.menu-toggle"]) {
  192 |       const label = await page.locator(sel).first().getAttribute("aria-label")
  193 |       expect(label, `${sel} needs an aria-label`).toBeTruthy()
  194 |     }
  195 |   })
  196 | })
  197 | 
```