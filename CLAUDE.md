# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio site for Hamed Bouare. **Nuxt 4** + **Nuxt Content v3** + **@nuxtjs/i18n**, plain CSS (no UI framework; GSAP only for the title line splits), statically generated (SSG) and deployed to **GitHub Pages** at `hamedbouare.me`. Package manager is **yarn** (1.22.22) — the README mentions npm but CI and deploy use yarn.

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

The e2e suite guards failure modes that produce **no console error**: the
theme not set before first paint, the painted theme disagreeing with
`data-theme`, text below AA contrast, horizontal overflow, content stuck at
opacity 0, a blank wave-field canvas, a `TODO` placeholder rendered, broken
screenshots, and missing accessible names. Do not delete a test here without replacing the
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

So adding content means adding a Markdown file under **both** `content/fr/...` and `content/en/...` with frontmatter that satisfies the schema (e.g. experiences need `id, order, role, company, period, start, location, flag, tags`; `start`/`end` are decimal years drawn as the home-page timeline bar, no `end` = ongoing). New routes are picked up by Nitro's `crawlLinks` prerender — add explicit entries to `nitro.prerender.routes` in [nuxt.config.ts](nuxt.config.ts) only for pages not reachable by crawling.

#### Frontmatter is PUBLISHED, whether or not it is rendered

Nuxt Content serialises the **whole document** into the prerendered
`_payload.json` next to each route. A field that no component reads is still
one `curl` away at `/projects/<slug>/_payload.json`.

This bit once already: repository URLs were kept in project frontmatter as an
"author-side reference, deliberately never rendered", and shipped in the
payload of every build. **Never put anything in content that must not be
public** — private URLs, client names, credentials. There is no render-time
way to take it back.

The corollary is a performance one: `queryCollection().all()` with no
`select()` ships every full document. `/projects` was serving four complete
case studies to draw four teaser cards. Pages that render a subset of fields
should `select()` that subset — and note that `select()` narrows the row type
*before* `order()` sees it, so a column you sort on has to be selected too.

#### Project case studies (`/projects/[slug]`)

Told as an article: header + 3-cell meta grid, hero shot, then a sticky
contents list and four sections — **Problème → Contraintes → Démarche →
Résultat** — then the code-access box and the next-project link.

Sections come from the `story` frontmatter object (`problem`, `constraints`,
`approach`, `result`, each `{ title?, text?, points? }`), and gallery shots
are placed with `gallery[].section: approach | result`. The page builds one
list of sections (`sections`, computed) and renders it in one loop.

Two content rules:

- **No invented copy.** A project without `story` falls back to what it
  already has: `intro` as the problem, `highlights` as the approach, its
  gallery as figures. A section left empty disappears and the numbering
  closes up.
- **Values starting with `TODO` are dropped at render** (`isFilled`). The
  placeholders are visible reminders in the source that can never ship as
  fabricated facts — e2e asserts no case study renders "TODO". Do not
  "helpfully" fill them in (notably `result.text`, the measurable result):
  they are the author's to supply.

Source access is granted personally via `/contact`; there is no repo, demo or
docs link on these pages.

### Theming

Theme = the **`data-theme` attribute on `<html>`**. All colour is CSS custom
properties keyed on it ([tokens.css](app/assets/styles/tokens.css)).

- An **inline `<head>` script** in [nuxt.config.ts](nuxt.config.ts) sets
  `data-theme` before first paint: saved choice
  (`localStorage['portfolio-theme']`), else `prefers-color-scheme`. There is
  no body-hiding anti-flash: nothing theme-dependent is rendered by JS, so
  there is nothing to hide. **If that script breaks, nothing errors** — the
  page corrects itself at hydration, but every dark visit fades in from
  light. A syntax error did exactly that once; the "theme is set before first
  paint" e2e test guards it.
- [useAppTheme.ts](app/composables/useAppTheme.ts): `theme` state → **one
  watcher** (`useThemeDomSync`, installed once in `app.vue`) → DOM. Change it
  only via `toggleTheme()` / `syncTheme()`; never write `data-theme` by hand.
- **Only an explicit toggle is persisted.** Until the visitor chooses, the OS
  preference applies, including live OS changes.
- **Markup that depends on the theme is switched in CSS, not rendered from
  state** — the prerendered HTML cannot know the theme. See
  [ThemeLabel.vue](app/components/ui/ThemeLabel.vue): both labels render and
  `html[data-theme]` shows one.
- Verify a theme change on the **painted** colour
  (`getComputedStyle(document.body).backgroundColor`), not only the attribute.

### i18n

`@nuxtjs/i18n`, strategy `prefix_except_default`, default locale **`fr`** (no prefix), `en` under `/en`. UI strings live in `i18n/locales/{fr,en}.json`; content lives in the per-locale Markdown collections above. Use `useLocalePath()` for internal links and `$t()` / `useI18n().t()` for UI strings.

- A title with one emphasised word uses `<i18n-t keypath>` with an `{em}`
  slot. Word order differs between FR and EN, so never split a title into
  `title_1` / `title_em` keys.
- The language switch is a **link** (`switchLocalePath`), not a button, so
  Nitro's crawler reaches every `/en` route from any page.
- Desktop Chrome in Playwright is `en-US` and is redirected from `/` to
  `/en`: write e2e text assertions locale-neutrally.

## Design system — « Sismogramme »

Source spec: [design_handoff_portfolio_refonte/README.md](design_handoff_portfolio_refonte/README.md)
(prototype: `Portfolio.dc.html`, open it through a local HTTP server).
Editorial, light and dark: "the rigour of a researcher, the precision of an
engineer". Every page leads to **« Discuter d'un projet »** (`/contact`)
through the hero or the end-of-page CTA band — not the header: its CTA was
removed at the owner's request, unlike the handoff.
`DESIGN.md` is the previous system's spec and no longer applies.

### Tokens — never raw values

- Colour ([tokens.css](app/assets/styles/tokens.css)): `--bg`, `--surface`,
  `--ink`, `--muted`, `--rule`, `--accent`, `--error`, `--wave-trace`, for
  both themes. Never a hex in a component.
- Type: `--f-display` (Newsreader), `--f-sans` (Instrument Sans), `--f-mono`
  (IBM Plex Mono); fluid sizes `--fs-hero/h1/h2/cta/h3/list/lead/intro/figure`.
- Space and layout: `--sp-*` (4px base), `--gutter`, `--section-y`,
  `--block-gap`.

### The accent is rare

`--accent` marks one word of a title, numbers, wave fronts and status —
never a background fill. **The light accent is `#b53f18`, not the handoff's
`#c2441a`**: the handoff value measures 4.46:1 on `--bg` and 4.08:1 on
`--surface` (the README claims ≈5:1), below AA for the 11–12px mono uses.
Measure any new tone; do not trust a stated ratio.

### Primitives — reach for these first ([base.css](app/assets/styles/base.css))

| Class | Use |
|---|---|
| `.t-hero` `.t-h1` `.t-h2` `.t-cta` | Display 300 headings (fluid). `em` inside is italic; `.em-accent` colours it. |
| `.t-h3` `.t-list` `.t-lead` `.t-intro` | Organisation/service titles, list titles, standfirst, intro. |
| `.eyebrow` / `.label` | Mono uppercase markers, 12px / 11px. |
| `.btn` + `--primary` / `--secondary` / `--inverse` | Pill buttons: ink, outlined, on the inverted CTA band. |
| `.link-text`, `.tag` (`--caps`, `--accent`), `.chip` (`aria-pressed`), `.status` | Links, tags, filter chips, availability dot. |
| `.gutter`, `.section`, `.editorial` (`__key` / `__body`) | Side margin, section rhythm, marker column + content column (wraps by itself). |
| `.cells` | Grid of cells with perfect 1px hairlines (gap over a `--rule` background). |
| `.rule-row` (+ `.is-interactive`) | Hairline row; surface on hover. |

Shared components: `<UiPageIntro>` (eyebrow + H1 + intro, one per inner
page), `<UiCtaBand>` (inverted end-of-page block, every page except
Contact), `<UiWaveField>`, `<UiThemeLabel>`, `<UiPlumField>`, and
`<NavigationScrollToTop>` (in the layout; shown past 400px by an observer on
a sentinel, no scroll listener; the footer reserves its width on the right
from 760px, or it covers the last link).

### Layout rules

- **One breakpoint: 760px** — except the header, which switches at
  **1024px**: the full bar needs ~900px of content and overflowed by up to
  200px at 768px (measured).
- No shadows. Borders are 1px `--rule`. Radii: pills 999px, cards 8px,
  images 6px.
- Plain unlayered CSS, no framework: no `!important` anywhere except the
  reduced-motion block.

### Accessibility floor

- `:focus-visible` = 2px accent outline, offset 3px (global).
- Touch targets ≥ 44px on mobile. Nothing may be hover-only: the code-block
  "Copy" button was, and could not be reached on touch.
- Contrast is AA in both themes, measured; e2e checks key text.
- No icons. Toggles carry `aria-pressed` / `aria-expanded`.

### Components are auto-imported with directory prefixes

`app/components/ui/` → `<Ui...>`, `sections/` → `<Sections...>`,
`navigation/` → `<Navigation...>`.

### Contact form

[app/pages/contact.vue](app/pages/contact.vue) sends via `@emailjs/browser` using `runtimeConfig.public.emailjs*` (empty in repo, supplied by CI secrets). Native HTML5 validation only; states `idle → sending → sent | error`; no confirm dialog (removed on purpose); a hidden `hb-trap` honeypot silently drops bots. Selected topics go in a `topics` param **and** are prefixed to the message, so they arrive whatever the EmailJS template contains.

## Motion

Motion follows master's `config/motion.ts`: short, decisive, no overshoot
(power3.out ≈ `--ease-out`). Durations and distances are tokens in
tokens.css. GSAP is used for one thing only, splitting titles into lines;
everything else is CSS or canvas. Seven things move, all honouring
`prefers-reduced-motion`:

- **Hero wave field** — [useWaveField.ts](app/composables/useWaveField.ts),
  a port of the prototype's `waveSim()`. Canvas 2D, client-only
  (`<ClientOnly><LazyUiWaveField>`), DPR capped at 2, one rAF loop paused
  off-screen, colours read from `--wave-trace` / `--accent` and re-read when
  `data-theme` flips. Reduced motion: one still frame at t = 1.7s, no
  interaction.
- **Key figures count-up** — SSR renders the **final** values; the client
  rewinds to 0 only when motion is allowed, then counts up at 30%
  visibility. Never ship a "0".
- **Page transitions** — CSS (`.page-*` in base.css), master's values: the
  old page leaves in 250ms (12px up), the new one enters in 600ms (from 12px
  below, `--ease-out`).
- **Scroll reveal** — the `v-reveal` directive
  ([plugins/reveal.ts](app/plugins/reveal.ts)): `.fade`, `.scale`,
  `.stagger` (on a list container) and `.lines` (section titles rise line by
  line behind a mask, GSAP SplitText, desktop only). One shared
  IntersectionObserver, fires once, as the element starts to enter.
- **Handwritten logo** — the header name is an SVG `<text>` traced, inked
  and erased on a 10s CSS loop (TopBar.vue); a visually-hidden span carries
  the link's name. Its **rest state is the written name**, and reduced
  motion sets `animation: none` on it: the global override alone would run
  the loop once and leave it erased.
- **Article tree** — [usePlumField.ts](app/composables/usePlumField.ts),
  generative "plum" branches from the screen edges on `/blog` and
  `/blog/[slug]` (master's algorithm and constants, unchanged), in
  `--plum-trace` (the accent, faint). Fixed canvas at `z-index: -1`, which
  only shows because `.app-shell` is `isolation: isolate`: `<html>` has its
  own background (inline head style), so body's background paints over
  anything negative outside that context — drawn, invisible, no error. The
  "blog tree is painted on screen" test guards it. Reduced motion: the
  whole tree at once; a theme flip repaints, it does not regrow.
- **Theme reveal** — `toggleTheme(event)` runs the swap inside a View
  Transition and grows a clip-path circle with Vuetify 4's values, as on the
  old site: `circle(0% → 150%)`, 500ms ease-in-out. The origin is the
  viewport CORNER nearest the click (the button centre for a keyboard
  press): the old toggle sat in the corner, so the theme swept corner to
  corner along the diagonal; the click point itself reads as a blob. The CSS colour fades (`--theme-fade`) are disabled
  during it. No View Transitions or reduced motion: a plain swap.

Content once ended up in the DOM but invisible: a reveal rested it at
opacity 0 and never fired. The scroll reveal is built so that cannot recur;
keep these invariants:

- **The server renders nothing hidden** (`getSSRProps` is empty). Without
  JS, or before hydration, every page is complete.
- **Only what is still below the viewport is hidden**, on mount. Never hide
  content already on screen (it would flicker) — this is why the hero and
  page intros have no reveal.
- **The observer's root extends far above the viewport**, so content
  scrolled past or jumped over (anchor, End key, restored scroll) counts as
  seen. It fires on entry, not at 85%: something in the last 15% of a page
  could never reach that line.
- **A stagger container also handles children added after mount**: data
  fetched on client navigation arrives later (the /en redirect does this).
- **`.lines` splits a CLONE of the title.** SplitText's `revert()` rebuilds
  children from innerHTML, which would orphan the nodes Vue patches; the
  originals are put back once the lines have risen.
- **Duration tokens are read with their unit**: the CSS minifier rewrites
  `900ms` as `.9s`.
- **Never animate a `.cells` child**: its hairlines are the `--rule`
  background showing through the gap, and a hidden cell leaves a solid
  block. Reveal the whole grid.

The "no content is left invisible" test jumps to the bottom of every page in
both motion modes; "without JavaScript" checks the SSR output.

## Avoiding regressions

Verification is measured, not eyeballed:

```bash
yarn typecheck                      # zero errors
yarn generate                       # check the prerendered route count
yarn test:e2e                       # against the static build
```

Then check the built output in both themes (toggle **and** reload), at
390 / 768 / 1440, with `document.documentElement.scrollWidth <= clientWidth`.
A silent failure is the default failure mode here: an empty console proves
nothing.

## Notes

- `.data/` is Nuxt Content's local SQLite cache (better-sqlite3); `.nuxt/` and `.output/` are build artifacts; `dist` is a symlink to `.output/public`. None are source.
- Base URL / canonical is `https://hamedbouare.me` (see `site.url` and `i18n.baseUrl`); the README's note about changing `app.baseURL` is stale — this repo deploys to a custom domain (`CNAME`), not a project subpath.
