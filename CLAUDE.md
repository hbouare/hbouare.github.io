# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio site for Hamed Bouare. **Nuxt 4** + **Vuetify 4** + **Nuxt Content v3** + **@nuxtjs/i18n**, statically generated (SSG) and deployed to **GitHub Pages** at `hamedbouare.me`. Package manager is **yarn** (1.22.22) — the README mentions npm but CI and deploy use yarn.

## Commands

```bash
yarn dev          # dev server
yarn generate     # static build → .output/public (this is what CI runs)
yarn preview      # serve the generated output
yarn deploy       # nuxt generate + gh-pages -d .output/public (manual deploy)
yarn typecheck    # nuxt typecheck (vue-tsc)
```

There is no linter and there are no unit tests. Two automated guards exist and
both must stay green:

- `yarn typecheck` — **clean, zero errors.** Keep it that way; its value
  collapses the moment a baseline of "expected" errors is tolerated again.
- `yarn test:e2e` — Playwright, runs against the **static build** (not the dev
  server), desktop + mobile. Every test maps to a bug that actually shipped
  here. Run `npx playwright install chromium` once after cloning.

The e2e suite guards failure modes that produce **no console error**: the theme
desyncing from the DOM, Vuetify utility classes silently not shipping, text
rendered in a colour that matches its background, horizontal overflow, and
missing accessible names. Do not delete a test here without replacing the
guarantee — each one was written after the corresponding bug reached the
built output.

**TypeScript is pinned to 5.x on purpose.** TypeScript 7 dropped the
`./lib/tsc` subpath export that `vue-tsc` requires; letting it float to 7
breaks `yarn typecheck` entirely.

Deploy is normally automatic: pushing to `main` or `master` triggers `.github/workflows/deploy.yml`, which runs `yarn generate` and publishes via GitHub Pages. EmailJS credentials are injected at build time from repo secrets (`EMAILJS_SERVICE_ID`, `_TEMPLATE_ID`, `_PUBLIC_KEY` → `NUXT_PUBLIC_EMAILJS_*`).

## Architecture

### Content is the data layer (i18n-split collections)

All experiences, projects, and blog posts are Markdown in `content/<locale>/<type>/*.md`, validated by Zod schemas in [content.config.ts](content.config.ts). There are **six collections**, one per (locale × type): `fr_experience`, `fr_projects`, `fr_blog`, `en_experience`, `en_projects`, `en_blog`.

Pages query the collection matching the current locale at runtime, e.g.:

```ts
const { locale } = useI18n()
queryCollection(`${locale.value}_blog`).order("date", "DESC").all()
```

So adding content means adding a Markdown file under **both** `content/fr/...` and `content/en/...` with frontmatter that satisfies the schema (e.g. experiences need `id, order, role, company, period, location, flag, tags`). New routes are picked up by Nitro's `crawlLinks` prerender — add explicit entries to `nitro.prerender.routes` in [nuxt.config.ts](nuxt.config.ts) only for pages not reachable by crawling.

### Theming (dark-first, anti-flash, View Transitions)

Theme state lives in **Vuetify** (`dark`/`light` themes defined in [app/plugins/vuetify.ts](app/plugins/vuetify.ts)), and everything else mirrors it:

- An **inline `<head>` script** in [nuxt.config.ts](nuxt.config.ts) reads `localStorage['portfolio-theme']` and sets `data-theme` + `colorScheme` *before paint* to prevent a flash. Inline CSS hides the body (`opacity:0`) until `html.hydrated`.
- [app/composables/useAppTheme.ts](app/composables/useAppTheme.ts) has a **single reactive watcher** on `theme.name` that writes localStorage + the DOM `data-theme` attribute.

Two ordering constraints are load-bearing. Both were violated during the
refactor and both produced the *same* silent symptom — `data-theme="light"`
with `.v-application` stuck on `v-theme--dark`:

1. **The watcher must NOT be `immediate`.** At setup the theme name is still
   the SSR default (`dark`), so an immediate run writes `dark` to localStorage
   and destroys a saved `light` preference before anything reads it.
2. **The restore must NOT happen in the Vuetify plugin.** Calling
   `theme.change()` during plugin install races hydration, and Vue re-patches
   `.v-application` back to the SSR theme. The restore belongs in
   `app.vue`'s `onMounted` (via `syncTheme()`), after hydration and before the
   anti-flash reveal.

Constraint 2 reproduces only intermittently, so it survives manual testing —
it was caught by `yarn test:e2e`, not by looking.

Keep this one-way flow intact: **Vuetify theme name → watcher → DOM/localStorage**.
Never write `data-theme` or localStorage by hand.

**Always change the theme through `theme.change(name)` / `theme.toggle([a, b])`.**
Vuetify 4 made `theme.global.name` read-only behind a deprecation `Proxy`.
Assigning `theme.global.name.value = x` still *looks* like it works — it even
sets the underlying ref — but it does not drive the theme, and because
`deprecate()` is stripped from production builds **it fails completely
silently, with no console output**. This exact bug shipped once already: the
DOM went light while `.v-application` stayed `v-theme--dark`.

`toggleTheme(event)` uses Vuetify 4's native transition API —
`setTransitionOrigin(event)` anchors the clip-path reveal to the click point
and `toggle([...], true)` runs the swap inside it. Do not hand-roll
`document.startViewTransition` again; the framework owns it now.

When verifying a theme change, assert on **`.v-application`'s `v-theme--*`
class**, not on `data-theme` — the two can disagree, and that disagreement is
precisely the failure mode above.

### i18n

`@nuxtjs/i18n`, strategy `prefix_except_default`, default locale **`fr`** (no prefix), `en` under `/en`. UI strings live in `i18n/locales/{fr,en}.json`; content lives in the per-locale Markdown collections above. Use `useLocalePath()` for internal links and `$t()` / `useI18n().t()` for UI strings.

## Design system

The visual language is **monochrome, uppercase, hairline-separated, flat**.
[DESIGN.md](DESIGN.md) is the source spec; the rules below are how it is
actually implemented here, including the places this project deliberately
departs from it.

### The load-bearing rule: no accent colour

Black and white do all the chromatic work. Hierarchy is carried by
**typography, tracking, tone (muted vs full ink), and 1px hairlines** — never
by hue. Adding a brand accent colour breaks the system.

`primary` is therefore the *ink* colour (white on dark, black on light), not a
brand tint. `color="primary"` on a filled control gives you white-on-white in
dark mode — see the pitfalls below.

The only exception is the semantic set (`error`, `warning`, `info`, `success`).
Those are **functional only**: form validation and feedback. Never decorative.

### Tokens — never raw values

Colour tokens live in [app/plugins/vuetify.ts](app/plugins/vuetify.ts) for both
modes. Use `rgb(var(--v-theme-<token>))`, never a hex literal, and never
`rgba(var(--v-theme-primary), 0.12)` for a border — that was the old idiom and
it is gone; borders use the `border` token at full opacity.

Available: `background`, `surface`, `surface-2`, `primary`, `on-primary`,
`secondary`, `on-background`, `on-surface`, `muted`, `border`, plus the four
semantic ones.

Spacing and type tokens live as custom properties in
[app/assets/styles/main.scss](app/assets/styles/main.scss) (`--space-*`,
`--type-*`, `--section-pad`, `--font-*`).

### Typography

Two families only: **Inter** (display + body, the spec's documented D-DIN
substitute) and **DM Mono** — *code only*.

Use the tier classes; never restate a font-size in a component:

| Class | Use |
|---|---|
| `.type-display-xxl/xl/lg` | Display headings. Always uppercase, 700, positively tracked. |
| `.type-title` | Card / list-item titles. **Not** uppercase. |
| `.type-body-lg` / `.type-body-md` | Reading copy / UI copy. |
| `.type-micro-cap` | Eyebrows, meta, nav, labels. Uppercase. |
| `.type-button-cap` | Button labels (applied globally via defaults). |
| `.type-caption` | Footer, legal, helper text. |

**The responsive stair-step (80 → 60 → 48 → 40) lives in ONE place**: the
`:root` breakpoint blocks in `main.scss`. Never add per-component type
breakpoints — that duplication is exactly what this refactor removed.

### Vuetify conventions

[app/plugins/vuetify.ts](app/plugins/vuetify.ts) sets the global `defaults`
that carry the visual language:

- `VBtn` — ghost outlined **pill**, uppercase cap label. This *is* the CTA
  component; there is no wrapper for it. Prefer `variant="text"` for secondary
  actions rather than a second pill: the system allows **one pill per band**.
- `VCard` — `elevation: 0`, `rounded: 'lg'` (8px). The system has **no shadow
  tier**; separation is a hairline or a surface step.
- `VChip` — outlined pill, small.
- `VTextField` / `VTextarea` — outlined, 4px radius.

**Prefer the defaults over per-component props.** If you find yourself writing
`rounded=`, `variant=`, or `color=` on one of these, ask whether the default is
wrong instead.

#### Pitfalls that have already caused bugs here

- **`color="…"` on `variant="outlined"` sets the TEXT and BORDER colour, not
  the background.** `color="surface"` on an outlined card paints the label in
  the surface colour — invisible against the canvas. Leave `color` off and let
  text inherit.
- **`color="primary"` + `variant="flat"`** renders white-on-white in dark mode,
  because `primary` is the ink colour. Use the ghost default.
- **`color` on `<v-app-bar>`** emits an inline `background-color` that only
  `!important` can beat. Omit it and style the background in CSS.

#### Overrides and specificity

Vuetify 4 wraps its own CSS in `@layer`, so **unlayered author CSS wins on
cascade order alone**. You should not need `!important` or doubled selectors to
override Vuetify. If you reach for one, the real cause is almost always an
inline style coming from a prop — remove the prop instead.

`import 'vuetify/styles'` in the plugin is **required**: `vite-plugin-vuetify`
autoImport only injects per-component styles, so without it every utility class
(`mb-6`, `ga-4`, `d-none`, `px-md-10`, the whole grid) silently becomes a
no-op. This has broken the site once.

### Shared UI primitives

Reach for these before writing new CSS:

- `<UiEyebrow>` — micro-cap kicker with the 28px hairline rule. `tone="muted"`,
  `:rule="false"`.
- `<UiDisplayTitle tag level>` — display tier heading.
- `<UiSectionHeader>` — eyebrow + display title; the standard section opener.
- `.hairline-interactive` — hover/focus state for any hairline surface. The
  system has no shadow, so hover = the hairline strengthening to full ink.
- `<UiRevealBlock :delay>` — scroll reveal.

### Documented departures from DESIGN.md

The spec describes a photography-led marketing site. This is a text-driven
portfolio, so four departures are intentional — keep them, and keep them
documented:

1. **No full-bleed photography.** The spec's primary depth medium ("the
   photographs *are* the design system") does not exist here. Bands are
   typographic title cards instead.
2. **Monospace is kept, for code only.** The spec has no mono tier; this site
   has nine technical posts with syntax highlighting.
3. **A `.type-title` tier was added.** The spec jumps 48px → 16px because it
   has no cards; a card-driven portfolio needs a title tier.
4. **`surface-2` and a real `muted` were derived.** The spec has only two dark
   surfaces and its "muted" (`#f0f0fa`) is indistinguishable from white —
   unusable for the volume of secondary text here.

Light mode is also an extension: the source system has no dark/light toggle,
so the light palette is built from its shop-site tokens.

### Accessibility floor

- Every icon-only control needs an `aria-label` (from i18n, not hardcoded), and
  toggles need `aria-expanded`. Several were missing entirely.
- Interactive states must cover `:focus-visible`, not just `:hover` — on a
  monochrome ghost UI the focus ring is the only affordance.
- Measured contrast is **AA across both themes** (full ink 21:1, muted 6.1:1
  dark / 6.9:1 light). If you introduce a new tone, measure it; do not eyeball
  near-black on black.
- `prefers-reduced-motion` is honoured globally in `main.scss` — the
  `!important` there is deliberate and must win.

### Components are auto-imported with directory prefixes

Nuxt auto-imports from `app/components/<dir>/`, so a component in `ui/` is `<Ui...>`, in `sections/` is `<Sections...>`, in `navigation/` is `<Navigation...>`. Scroll-reveal animations wrap content in `<UiRevealBlock :delay="...">`, backed by [app/composables/useScrollReveal.ts](app/composables/useScrollReveal.ts).

### Contact form

[app/components/sections/ContactSection.vue](app/components/sections/ContactSection.vue) / [app/pages/contact.vue](app/pages/contact.vue) send via `@emailjs/browser` using `runtimeConfig.public.emailjs*` (empty in repo, supplied by CI secrets).

## Design reference

[DESIGN.md](DESIGN.md) is the source design-system spec (colors, typography,
spacing, tokens). Consult it before changing layout, colour, or typographic
styling — but read the "Documented departures" section above first: it is an
extraction of a photography-led marketing site, and four of its rules do not
transfer to this portfolio.

## Avoiding regressions

There is no test suite, so verification is manual and must be **measured, not
eyeballed**. Before considering a visual change done:

```bash
yarn typecheck                      # must stay at the 10-error baseline
yarn generate                       # must stay at 30 prerendered HTML routes
npx serve .output/public -l 4173    # then check the built output, not just dev
```

Then, in the browser:

- Check **both themes**. Toggle, and also **reload** — restore-on-load and
  toggle are different code paths, and only one of them was broken last time.
- Check **390 / 768 / 1440**. Confirm `document.documentElement.scrollWidth`
  does not exceed `clientWidth` (no horizontal overflow).
- **Measure computed colours** on anything you restyled
  (`getComputedStyle(el).color` vs its resolved background). Monochrome UIs
  fail quietly: near-black text on black looks like empty space, not like a
  bug. Three separate contrast bugs in this codebase were found this way and
  none of them produced a console error.
- Confirm the **route count is unchanged** — nav changes can break Nitro's
  `crawlLinks` discovery.

A silent failure is the default failure mode in this stack. An empty console
proves nothing.

## Notes

- `.data/` is Nuxt Content's local SQLite cache (better-sqlite3); `.nuxt/` and `.output/` are build artifacts; `dist` is a symlink to `.output/public`. None are source.
- Base URL / canonical is `https://hamedbouare.me` (see `site.url` and `i18n.baseUrl`); the README's note about changing `app.baseURL` is stale — this repo deploys to a custom domain (`CNAME`), not a project subpath.
