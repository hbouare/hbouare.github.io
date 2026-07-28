// content.config.ts
import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const experienceSchema = z.object({
  id:       z.string(),
  order:    z.number(),
  role:     z.string(),
  company:  z.string(),
  // The engagement's sector — Énergie / Santé / Ferroviaire… This is the
  // proof framing: a decision-maker scans sectors and critical environments,
  // not job titles.
  sector:   z.string().optional(),
  period:   z.string(),
  // Contract type (e.g. "Freelance", "Temps plein"). Optional — only set it
  // where it disambiguates, e.g. two overlapping missions run in parallel.
  employment: z.string().optional(),
  location: z.string(),
  flag:     z.string(),
  tags:     z.array(z.string()),
})

const projectSchema = z.object({
  // `slug`, not `id`: Nuxt Content reserves `id` for its own internal
  // collection identifier (a full source path), so a frontmatter `id` is
  // silently shadowed. `slug` is the clean route key — same as the blog.
  slug:     z.string(),
  order:    z.number(),
  title:    z.string(),
  featured: z.boolean().default(false),
  tags:     z.array(z.string()),
  // Case-study fields — all optional so an unfilled project degrades
  // gracefully (the card simply omits them). Together they drive the lean
  // /projects/[slug] narrative:
  //   hook (pitch) → status → intro (overview) → highlights → layers.
  // `status` any value beginning with `TODO` is treated as unfilled and
  // dropped at render (see `isFilled` in app/pages/projects/[slug].vue).
  context:    z.string().optional(),          // category, e.g. "Personal project — fintech"
  hook:       z.string().optional(),          // one-line pitch (teaser + case-study hero)
  status:     z.string().optional(),          // e.g. "Functional · demo" — a hero-meta caption
  intro:      z.string().optional(),          // the overview paragraph (problem + response in one)
  highlights: z.array(z.string()).optional(), // key features

  // ── Architecture, in three plain layers ─────────────────────────────────
  // Each describes what the layer DOES for this project (not its stack — the
  // tech lives in `tags`). Rendered by <CaseLayers> under "Under the hood".
  frontend: z.string().optional(),
  backend:  z.string().optional(),
  database: z.string().optional(),

  // ── Visuals (optional) ───────────────────────────────────────────────────
  // `cover` is the big hero screenshot (browser mockup, top of the case study).
  cover: z.object({
    src: z.string(),
    alt: z.string().optional(),
  }).optional(),

  // Gallery — screenshots in an asymmetric 6-column grid, opened in a
  // lightbox. `device` picks the mockup frame (browser | phone); `span` (2–6)
  // drives how many of the six columns a tile occupies. Absent → section dropped.
  gallery: z.array(z.object({
    src:     z.string(),
    caption: z.string().optional(),
    alt:     z.string().optional(),
    device:  z.enum(["browser", "phone"]).optional(),
    span:    z.number().optional(),
  })).optional(),

  // There is deliberately NO repository/demo/docs URL here. Source access is
  // granted personally on request via the contact page, and a field kept
  // "for reference only" would not stay private: Nuxt Content serialises the
  // whole document into the prerendered `_payload.json`, so a URL that is
  // never rendered is still one fetch away. Keep repository links out of
  // content entirely.
})

const blogSchema = z.object({
  slug:     z.string(),
  title:    z.string(),
  date:     z.string(),
  readTime: z.number(),
  tags:     z.array(z.string()),
  excerpt:  z.string(),
})

export default defineContentConfig({
  collections: {
    fr_experience: defineCollection({ type: 'page', source: 'fr/experience/*.md', schema: experienceSchema }),
    fr_projects:   defineCollection({ type: 'page', source: 'fr/projects/*.md',   schema: projectSchema }),
    fr_blog:       defineCollection({ type: 'page', source: 'fr/blog/*.md',       schema: blogSchema }),
    en_experience: defineCollection({ type: 'page', source: 'en/experience/*.md', schema: experienceSchema }),
    en_projects:   defineCollection({ type: 'page', source: 'en/projects/*.md',   schema: projectSchema }),
    en_blog:       defineCollection({ type: 'page', source: 'en/blog/*.md',       schema: blogSchema }),
  },
})
