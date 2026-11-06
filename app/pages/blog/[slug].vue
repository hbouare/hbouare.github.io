<!-- app/pages/blog/[slug].vue -->
<!--
  Article. The contents list comes from Nuxt Content's build-time TOC (the
  H2s), so it is in the prerendered HTML, not built after hydration. The
  first paragraph is set as the standfirst. Next article = the next older
  post, wrapping round.
-->
<template>
  <div v-if="post">
    <section class="art-head gutter">
      <NuxtLink :to="localePath('/blog')" class="back-link">← {{ $t("blog.view_all") }}</NuxtLink>
      <div class="art-meta">
        <time :datetime="post.date">{{ formatDate(post.date) }}</time>
        <span aria-hidden="true">·</span>
        <span>{{ post.readTime }} {{ $t("blog.min_read") }}</span>
      </div>
      <h1 class="t-h1 art-title">{{ post.title }}</h1>
      <ul class="art-tags" role="list">
        <li v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</li>
      </ul>
    </section>

    <div class="art-body gutter">
      <aside v-if="toc.length" class="art-aside">
        <nav class="art-toc" :aria-label="$t('blog.toc')">
          <div class="label art-toc-label">{{ $t("blog.toc") }}</div>
          <a
            v-for="(h, i) in toc"
            :key="h.id"
            :href="`#${h.id}`"
            :class="{ 'is-active': h.id === activeId }"
          >
            <span class="num">{{ String(i + 1).padStart(2, "0") }}</span>
            <span>{{ h.text }}</span>
          </a>
        </nav>
      </aside>

      <article ref="contentRef" class="prose">
        <ContentRenderer :value="post" />
      </article>
    </div>

    <NuxtLink
      v-if="next"
      :to="localePath(`/blog/${next.slug}`)"
      class="rule-row is-interactive art-next gutter"
    >
      <span class="eyebrow">{{ $t("blog.next") }}</span>
      <span class="art-next-title">{{ next.title }} →</span>
    </NuxtLink>

    <UiCtaBand
      :title="$t('home.cta_title')"
      :text="$t('home.cta_text')"
      :button="$t('home.cta_button')"
      :to="localePath('/contact')"
    />
  </div>

  <section v-else class="gutter section">
    <p class="t-intro muted">{{ $t("blog.not_found") }}</p>
    <NuxtLink :to="localePath('/blog')" class="link-text">← {{ $t("blog.view_all") }}</NuxtLink>
  </section>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { formatDate } = useFormatDate()

const slug = route.params.slug as string
const contentRef = ref<HTMLElement | null>(null)

const { data: post } = await useAsyncData(`post-${locale.value}-${slug}`, () =>
  queryCollection(`${locale.value}_blog`).where("slug", "=", slug).first(),
)

// Siblings for the "next article" link — two fields only, not every post.
const { data: siblings } = await useAsyncData(`blog-nav-${locale.value}`, () =>
  queryCollection(`${locale.value}_blog`).select("slug", "title", "date").order("date", "DESC").all(),
)
const next = computed(() => {
  const all = siblings.value ?? []
  const i = all.findIndex((p) => p.slug === slug)
  if (i < 0 || all.length < 2) return null
  return all[(i + 1) % all.length] ?? null
})

const toc = computed(() =>
  (post.value?.body?.toc?.links ?? []).map((l) => ({ id: l.id, text: l.text })),
)
const { activeId } = useTableOfContents(contentRef)

if (post.value) {
  useSeoMeta({
    title: post.value.title,
    description: post.value.excerpt,
    ogTitle: `${post.value.title} - Hamed Bouare`,
    ogDescription: post.value.excerpt,
    ogType: "article",
  })

  useJsonLd({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.value.title,
    description: post.value.excerpt,
    datePublished: post.value.date,
    inLanguage: locale.value,
    author: { "@type": "Person", name: "Hamed Bouare", url: "https://hamedbouare.me" },
  })
}

// Copy-to-clipboard on code blocks (progressive: absent without JS).
onMounted(() => nextTick(setupCopyButtons))

function setupCopyButtons() {
  contentRef.value?.querySelectorAll("pre").forEach((pre) => {
    const wrapper = document.createElement("div")
    wrapper.className = "code-block"
    pre.parentNode?.insertBefore(wrapper, pre)
    wrapper.appendChild(pre)

    const btn = document.createElement("button")
    btn.type = "button"
    btn.className = "copy-btn"
    btn.textContent = t("blog.copy_code")
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector("code")?.textContent ?? pre.textContent ?? "")
        btn.textContent = t("blog.copied")
        setTimeout(() => (btn.textContent = t("blog.copy_code")), 2000)
      } catch {
        // Clipboard unavailable: the code stays selectable.
      }
    })
    wrapper.appendChild(btn)
  })
}
</script>

<style scoped>
.art-head {
  display: flex;
  flex-direction: column;
  gap: clamp(18px, 2.2vw, 28px);
  padding-top: clamp(40px, 6vw, 88px);
  padding-bottom: clamp(32px, 4vw, 56px);
  border-bottom: 1px solid var(--rule);
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
.art-meta {
  display: flex;
  gap: 12px;
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--muted);
}
.art-title {
  max-width: 1100px;
  font-size: clamp(38px, 5.6vw, 80px);
  line-height: 1.04;
  letter-spacing: -0.03em;
}
.art-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.art-body {
  display: flex;
  flex-wrap: wrap;
  gap: 32px 64px;
  padding-block: clamp(48px, 6vw, 96px);
}
.art-aside {
  flex: 1 1 220px;
}
.art-toc {
  position: sticky;
  top: 96px;
  display: flex;
  flex-direction: column;
  font-family: var(--f-mono);
  font-size: 12px;
  line-height: 1.45;
}
.art-toc-label {
  font-size: 12px;
  padding-bottom: 10px;
}
.art-toc a {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid var(--rule);
  transition: color 0.2s;
}
.art-toc a:hover,
.art-toc a.is-active {
  color: var(--accent);
}
.num {
  color: var(--accent);
}

.art-next {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px 32px;
  padding-block: clamp(32px, 4vw, 56px);
}
.art-next-title {
  font-family: var(--f-display);
  font-weight: 300;
  font-size: clamp(24px, 3vw, 44px);
  letter-spacing: -0.02em;
}

@media (max-width: 759.98px) {
  .art-aside {
    display: none;
  }
}
</style>

<style>
/* Prose — the Markdown body. Unscoped: ContentRenderer's elements are not
   this component's own. */
.prose {
  flex: 999 1 620px;
  min-width: 0;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  font-size: 18px;
  line-height: 1.75;
}
.prose > div {
  display: contents;
}
.prose p,
.prose ul,
.prose ol,
.prose pre {
  margin: 0;
}
.prose p {
  line-height: inherit;
}
/* Standfirst. */
.prose > div > p:first-child {
  font-family: var(--f-display);
  font-size: clamp(20px, 1.8vw, 24px);
  line-height: 1.5;
}
.prose h2 {
  margin: 24px 0 0;
  font-family: var(--f-display);
  font-weight: 400;
  font-size: clamp(26px, 2.4vw, 34px);
  line-height: 1.2;
  letter-spacing: -0.015em;
  scroll-margin-top: 96px;
}
.prose h3 {
  margin: 8px 0 0;
  font-family: var(--f-display);
  font-weight: 400;
  font-size: 22px;
  line-height: 1.3;
  scroll-margin-top: 96px;
}
/* Nuxt Content wraps heading text in a self-link; keep it quiet. */
.prose h2 a,
.prose h3 a {
  color: inherit;
}
.prose a {
  border-bottom: 1px solid var(--accent);
}
.prose a:hover {
  color: var(--accent);
}
.prose h2 a,
.prose h3 a {
  border-bottom: none;
}
.prose strong {
  font-weight: 600;
}
.prose :not(pre) > code {
  font-family: var(--f-mono);
  font-size: 0.8em;
  background: var(--surface);
  padding: 2px 6px;
  border-radius: 3px;
}
.prose .code-block {
  position: relative;
}
.prose pre {
  font-family: var(--f-mono);
  font-size: 13px;
  line-height: 1.6;
  background: var(--surface);
  border: 1px solid var(--rule);
  border-radius: 6px;
  padding: 20px;
  overflow-x: auto;
}
.prose pre code {
  font-family: inherit;
}
.prose .copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  font-family: var(--f-mono);
  font-size: 11px;
  color: var(--muted);
  background: var(--bg);
  border: 1px solid var(--rule);
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: color 0.2s;
}
/* Always visible: a hover-only button does not exist on touch screens. */
.prose .copy-btn:hover {
  color: var(--ink);
}
.prose blockquote {
  margin: 8px 0;
  padding: 4px 0 4px 24px;
  border-left: 2px solid var(--accent);
  font-family: var(--f-display);
  font-style: italic;
  font-size: clamp(22px, 2vw, 26px);
  line-height: 1.4;
}
.prose blockquote p {
  margin: 0;
}
.prose ul {
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
  font-size: 16px;
  line-height: 1.6;
}
.prose ul li {
  padding: 14px 0;
  border-bottom: 1px solid var(--rule);
}
.prose ol {
  padding-left: 1.4em;
}
.prose ol li + li {
  margin-top: 8px;
}
.prose table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  display: block;
  overflow-x: auto;
}
.prose th,
.prose td {
  padding: 10px 12px 10px 0;
  border-bottom: 1px solid var(--rule);
  text-align: left;
  vertical-align: top;
}
.prose th {
  font-family: var(--f-mono);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--muted);
}
.prose img {
  max-width: 100%;
  height: auto;
  border: 1px solid var(--rule);
  border-radius: var(--radius-img);
}
</style>
