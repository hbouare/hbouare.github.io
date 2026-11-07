<!-- app/pages/projects/[slug].vue -->
<!--
  Project case study, told as an article:

    header  — back link, eyebrow, H1, hook, then a 3-cell meta grid
              (context / stack / code access)
    hero    — the cover, full width, with a mono caption
    body    — sticky contents (desktop) + a 780px article:
              01 Problème · 02 Contraintes · 03 Démarche · 04 Résultat
    foot    — "code access" box, then the full-width next-project link

  Sections come from `story` in the frontmatter. Without it, a project falls
  back to content it already has — `intro` as the problem, `highlights` as
  the approach, its gallery as figures — so nothing is ever invented. Any
  value starting with TODO is dropped (`isFilled`); a section left with no
  content disappears, and the numbering closes up.
-->
<template>
  <div v-if="project">
    <section class="case-head gutter">
      <NuxtLink :to="localePath('/projects')" class="back-link">← {{ $t("projects.back") }}</NuxtLink>
      <div class="eyebrow">
        {{ $t("case.eyebrow") }} {{ number }}<template v-if="project.context"> · {{ project.context }}</template>
      </div>
      <h1 class="t-h1 case-title">{{ project.title }}</h1>
      <p v-if="project.hook" class="case-hook">{{ project.hook }}</p>
      <div class="cells case-meta">
        <div v-if="project.context" class="case-meta-cell">
          <span class="label">{{ $t("case.meta_context") }}</span>
          <span>{{ project.context }}</span>
        </div>
        <div class="case-meta-cell case-tech">
          <span class="label">{{ $t("case.meta_stack") }}</span>
          <span>{{ project.tags.join(" · ") }}</span>
        </div>
        <div class="case-meta-cell">
          <span class="label">{{ $t("case.meta_code") }}</span>
          <span>{{ $t("case.meta_code_value") }}</span>
        </div>
      </div>
    </section>

    <figure v-if="project.cover" v-reveal.scale class="case-hero gutter">
      <img
        :src="project.cover.src"
        :alt="project.cover.alt ?? project.title"
        class="shot"
        width="1600"
        height="900"
        fetchpriority="high"
      >
      <figcaption>{{ project.cover.alt ?? project.title }}</figcaption>
    </figure>

    <div class="case-body gutter">
      <aside class="case-aside">
        <nav class="case-toc" :aria-label="$t('case.toc')">
          <div class="label case-toc-label">{{ $t("case.toc") }}</div>
          <a v-for="s in sections" :key="s.id" :href="`#${s.id}`">
            <span class="num">{{ s.num }}</span>{{ s.name }}
          </a>
        </nav>
      </aside>

      <article class="case-article">
        <section v-for="s in sections" :id="s.id" :key="s.id" v-reveal class="case-section">
          <template v-if="s.title">
            <div class="eyebrow case-marker">{{ s.num }} — {{ s.name }}</div>
            <h2 class="case-h2">{{ s.title }}</h2>
          </template>
          <h2 v-else class="eyebrow case-marker">{{ s.num }} — {{ s.name }}</h2>

          <p v-if="s.text" class="case-text">{{ s.text }}</p>

          <div v-if="s.layers.length" class="cells case-layers">
            <div v-for="l in s.layers" :key="l.label" class="case-layer">
              <span class="label">{{ l.label }}</span>
              <span>{{ l.text }}</span>
            </div>
          </div>

          <ul v-if="s.points.length" class="case-points" role="list">
            <li v-for="(pt, i) in s.points" :key="pt">
              <span class="case-bullet" aria-hidden="true">{{ s.lettered ? `${"abcdefgh"[i]}.` : "—" }}</span>{{ pt }}
            </li>
          </ul>

          <div v-if="s.figures.length" class="case-figures">
            <figure v-for="f in s.figures" :key="f.src" v-reveal.scale :class="{ 'is-phone': f.device === 'phone' }">
              <img :src="f.src" :alt="f.alt ?? f.caption ?? ''" class="shot" loading="lazy" decoding="async">
              <figcaption v-if="f.caption">{{ f.caption }}</figcaption>
            </figure>
          </div>
        </section>

        <div v-reveal class="case-encart">
          <div class="label">{{ $t("case.access_title") }}</div>
          <p>{{ $t("case.access_note") }}</p>
          <NuxtLink :to="localePath({ path: '/contact', query: { project: slug } })" class="btn btn--secondary">
            {{ $t("case.access_cta") }} <span aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </article>
    </div>

    <NuxtLink
      v-if="next"
      :to="localePath(`/projects/${next.slug}`)"
      class="rule-row is-interactive case-next gutter"
    >
      <span class="eyebrow">{{ $t("case.next_project") }} — {{ next.number }}</span>
      <span class="case-next-title">{{ next.title }} →</span>
    </NuxtLink>

    <UiCtaBand
      :title="$t('home.cta_title')"
      :text="$t('home.cta_text')"
      :button="$t('home.cta_button')"
      :to="localePath('/contact')"
    />
  </div>

  <section v-else class="page-intro gutter section">
    <p class="t-intro muted">{{ $t("projects.not_found") }}</p>
    <NuxtLink :to="localePath('/projects')" class="link-text">← {{ $t("projects.back") }}</NuxtLink>
  </section>
</template>

<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const slug = route.params.slug as string

const { data: project } = await useAsyncData(`project-${locale.value}-${slug}`, () =>
  queryCollection(`${locale.value}_projects`).where("slug", "=", slug).first(),
)

// Sibling projects, for the number and the "next project" link. Only the
// fields needed: a case study should not ship four full case studies in its
// payload. `order` is selected because select() narrows the row type before
// order() sees it.
const { data: siblings } = await useAsyncData(`projects-nav-${locale.value}`, () =>
  queryCollection(`${locale.value}_projects`)
    .select("slug", "title", "order")
    .order("order", "ASC")
    .all(),
)

const pad = (i: number) => String(i + 1).padStart(3, "0")
const index = computed(() => siblings.value?.findIndex((p) => p.slug === slug) ?? -1)
const number = computed(() => (index.value >= 0 ? pad(index.value) : ""))

// Wraps around, so the sequence never dead-ends.
const next = computed(() => {
  const all = siblings.value
  if (!all?.length || index.value < 0) return null
  const i = (index.value + 1) % all.length
  const p = all[i]
  return p && p.slug !== slug ? { ...p, number: pad(i) } : null
})

// A value still carrying its TODO placeholder counts as unfilled: it stays a
// visible reminder in the source but never ships as a fabricated fact.
const isFilled = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "" && !v.trim().toUpperCase().startsWith("TODO")
const filled = (list?: string[] | null) => (list ?? []).filter(isFilled)

type Shot = NonNullable<NonNullable<typeof project.value>["gallery"]>[number]

interface Section {
  id: string
  num: string
  name: string
  title?: string
  text?: string
  points: string[]
  lettered: boolean
  layers: { label: string; text: string }[]
  figures: Shot[]
}

const sections = computed<Section[]>(() => {
  const p = project.value
  if (!p) return []
  const story = p.story ?? {}
  const gallery = p.gallery ?? []
  // Unassigned shots split: the first two illustrate the approach, the rest
  // the result.
  const figuresFor = (section: "approach" | "result") =>
    gallery.filter((g, i) => (g.section ?? (i < 2 ? "approach" : "result")) === section)

  const layers = (
    [
      ["layer_frontend", p.frontend],
      ["layer_backend", p.backend],
      ["layer_database", p.database],
    ] as const
  )
    .filter(([, text]) => isFilled(text))
    .map(([key, text]) => ({ label: t(`case.${key}`), text: text as string }))

  const raw: Omit<Section, "num">[] = [
    {
      id: "cs-problem",
      name: t("case.s_problem"),
      title: story.problem?.title ?? undefined,
      text: story.problem?.text ?? p.intro ?? undefined,
      points: filled(story.problem?.points),
      lettered: false,
      layers: [],
      figures: [],
    },
    {
      id: "cs-constraints",
      name: t("case.s_constraints"),
      title: story.constraints?.title ?? undefined,
      text: story.constraints?.text ?? undefined,
      points: filled(story.constraints?.points),
      lettered: true,
      layers: [],
      figures: [],
    },
    {
      id: "cs-approach",
      name: t("case.s_approach"),
      title: story.approach?.title ?? undefined,
      text: story.approach?.text ?? undefined,
      points: filled(story.approach?.points ?? (story.constraints?.points ? [] : p.highlights)),
      lettered: false,
      layers,
      figures: figuresFor("approach"),
    },
    {
      id: "cs-result",
      name: t("case.s_result"),
      title: story.result?.title ?? undefined,
      text: story.result?.text ?? undefined,
      points: filled(story.result?.points),
      lettered: false,
      layers: [],
      figures: figuresFor("result"),
    },
  ]

  return raw
    .map((s) => ({
      ...s,
      title: isFilled(s.title) ? s.title : undefined,
      text: isFilled(s.text) ? s.text : undefined,
    }))
    .filter((s) => s.text || s.points.length || s.layers.length || s.figures.length)
    .map((s, i) => ({ ...s, num: String(i + 1).padStart(2, "0") }))
})

if (project.value) {
  const p = project.value
  const description = p.hook ?? p.intro
  const url = `https://hamedbouare.me${localePath(`/projects/${p.slug}`)}`

  useSeoMeta({
    title: p.title,
    description,
    ogTitle: `${p.title} - Hamed Bouare`,
    ogDescription: description,
    ogType: "article",
    ogImage: p.cover ? `https://hamedbouare.me${p.cover.src}` : undefined,
  })

  useJsonLd({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": url,
    name: p.title,
    url,
    abstract: p.hook,
    description,
    keywords: p.tags?.join(", "),
    inLanguage: locale.value,
    creator: { "@type": "Person", name: "Hamed Bouare", url: "https://hamedbouare.me" },
  })
}
</script>

<style scoped>
.case-head {
  display: flex;
  flex-direction: column;
  gap: clamp(20px, 2.4vw, 32px);
  padding-top: clamp(40px, 6vw, 88px);
  padding-bottom: clamp(32px, 4vw, 56px);
}
.back-link {
  align-self: flex-start;
  padding: 6px 0;
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--muted);
  transition: color 0.2s;
}
.back-link:hover {
  color: var(--ink);
}
.case-title {
  max-width: 1100px;
}
.case-hook {
  margin: 0;
  max-width: 760px;
  font-family: var(--f-display);
  font-size: clamp(20px, 2vw, 28px);
  line-height: 1.4;
}
.case-meta {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  border: 1px solid var(--rule);
  margin-top: 8px;
}
.case-meta-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 20px;
  font-size: 15px;
}

.shot {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--rule);
  border-radius: var(--radius-img);
  background: var(--surface);
}
figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
figcaption {
  font-family: var(--f-mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted);
}
.case-hero {
  gap: 10px;
}

.case-body {
  display: flex;
  flex-wrap: wrap;
  gap: 32px 64px;
  padding-block: clamp(56px, 7vw, 112px);
}
.case-aside {
  flex: 1 1 200px;
}
.case-toc {
  position: sticky;
  top: 96px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: var(--f-mono);
  font-size: 12px;
}
.case-toc-label {
  font-size: 12px;
  padding-bottom: 10px;
}
.case-toc a {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid var(--rule);
  transition: color 0.2s;
}
.case-toc a:last-child {
  border-bottom: 1px solid var(--rule);
}
.case-toc a:hover {
  color: var(--accent);
}
.num {
  color: var(--accent);
}

.case-article {
  flex: 999 1 620px;
  min-width: 0;
  max-width: 780px;
  display: flex;
  flex-direction: column;
  gap: clamp(56px, 6vw, 88px);
}
.case-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  scroll-margin-top: 96px;
}
.case-marker {
  margin: 0;
  color: var(--accent);
}
.case-h2 {
  margin: 0;
  font-family: var(--f-display);
  font-weight: 300;
  font-size: clamp(30px, 3.2vw, 44px);
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.case-text {
  margin: 0;
  font-size: 18px;
  line-height: 1.7;
}

.case-layers {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  border: 1px solid var(--rule);
}
.case-layer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  font-size: 15px;
  line-height: 1.55;
}

.case-points {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
}
.case-points li {
  display: flex;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--rule);
  font-size: 16px;
  line-height: 1.55;
}
.case-bullet {
  flex: none;
  padding-top: 3px;
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--muted);
}

.case-figures {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 20px;
}
.case-figures .is-phone {
  grid-column: 1 / -1;
  max-width: 420px;
}

.case-encart {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 28px;
  border: 1px solid var(--rule);
  border-radius: var(--radius-img);
}
.case-encart p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
}
.case-encart .btn {
  align-self: flex-start;
}

.case-next {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px 32px;
  padding-block: clamp(32px, 4vw, 56px);
}
.case-next-title {
  font-family: var(--f-display);
  font-weight: 300;
  font-size: clamp(28px, 3.6vw, 52px);
  letter-spacing: -0.02em;
}

@media (max-width: 759.98px) {
  .case-aside {
    display: none;
  }
}
</style>
