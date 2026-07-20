// content.config.ts
import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const experienceSchema = z.object({
  id:       z.string(),
  order:    z.number(),
  role:     z.string(),
  company:  z.string(),
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
  // gracefully (the card simply omits them) rather than shipping a
  // half-built layout. Together they drive the /projects/[slug] narrative:
  // hook → context (intro) → challenge → solution → highlights → impact.
  context:    z.string().optional(),          // anonymised client, e.g. "Fintech scale-up"
  role:       z.string().optional(),          // your role, e.g. "Lead back-end"
  period:     z.string().optional(),          // e.g. "2023 · 6 months"
  hook:         z.string().optional(),          // one-line pitch (teaser + case-study hero)
  intro:        z.string().optional(),          // context paragraph: who / what need
  objectives:   z.array(z.string()).optional(), // business objectives
  challenge:    z.string().optional(),          // the business/technical challenge
  solution:     z.string().optional(),          // how the product answers it
  architecture: z.string().optional(),          // general architecture (from the stack)
  highlights:   z.array(z.string()).optional(), // standout features / technical points
  deliverables: z.array(z.string()).optional(), // what was delivered
  impact:       z.array(z.string()).optional(), // outcomes / value
  // Source visibility. `private` (default) shows a "request access" CTA
  // instead of dead repo/demo buttons.
  access:   z.enum(['private', 'public']).default('private'),
  github:   z.string().optional(),
  demo:     z.string().optional(),
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
