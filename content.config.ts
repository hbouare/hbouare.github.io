// content.config.ts
import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const experienceSchema = z.object({
  id:       z.string(),
  order:    z.number(),
  role:     z.string(),
  company:  z.string(),
  period:   z.string(),
  location: z.string(),
  flag:     z.string(),
  tags:     z.array(z.string()),
})

const projectSchema = z.object({
  id:       z.string(),
  order:    z.number(),
  title:    z.string(),
  featured: z.boolean().default(false),
  tags:     z.array(z.string()),
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
