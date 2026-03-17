<!-- app/pages/blog/[slug].vue -->
<template>
  <div class="blog-layout">
    <!-- Main content -->
    <div class="blog-main">
      <v-container class="px-6 px-md-10" fluid style="max-width: 800px">
        <div class="section-v-pad">
          <UiRevealBlock>
            <NuxtLink
              :to="localePath('/blog')"
              class="back-link font-mono text-muted"
            >
              <v-icon size="14" class="mr-1">mdi-arrow-left</v-icon>
              {{ $t("blog.view_all") }}
            </NuxtLink>
          </UiRevealBlock>

          <!-- Skeleton while loading -->
          <div v-if="!post && !postError" class="py-8">
            <v-skeleton-loader
              type="heading"
              color="surface"
              rounded="0"
              class="mb-6"
            />
            <v-skeleton-loader
              type="paragraph"
              color="surface"
              rounded="0"
              class="mb-4"
            />
            <v-skeleton-loader
              type="paragraph"
              color="surface"
              rounded="0"
              class="mb-4"
            />
            <v-skeleton-loader type="paragraph" color="surface" rounded="0" />
          </div>

          <div v-if="post">
            <UiRevealBlock>
              <div class="d-flex align-center ga-3 mb-6 flex-wrap">
                <span class="font-mono text-muted blog-meta">{{
                  formatDate(post.date)
                }}</span>
                <span class="font-mono text-muted">·</span>
                <span class="font-mono text-muted blog-meta"
                  >{{ post.readTime }} {{ $t("blog.min_read") }}</span
                >
              </div>

              <h1 class="post-title font-playfair">{{ post.title }}</h1>

              <div class="d-flex flex-wrap ga-1 mt-5">
                <v-chip
                  v-for="tag in post.tags"
                  :key="tag"
                  variant="outlined"
                  color="primary"
                  rounded="0"
                  size="x-small"
                  class="font-mono"
                  >{{ tag }}</v-chip
                >
              </div>
            </UiRevealBlock>

            <v-divider class="my-10" :color="'primary'" opacity="0.15" />

            <div ref="contentRef" class="post-content font-mono">
              <ContentRenderer :value="post" />
            </div>
          </div>

          <div v-else-if="postError" class="text-center py-20">
            <p class="font-mono text-muted">Article introuvable.</p>
          </div>
        </div>
      </v-container>
    </div>

    <!-- TOC sidebar (desktop only) -->
    <aside v-if="post" class="blog-sidebar d-none d-lg-block">
      <UiBlogToc :headings="headings" :active-id="activeId" />
    </aside>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const contentRef = ref<HTMLElement | null>(null)

const { data: post, error: postError } = await useAsyncData(
  `post-${locale.value}-${route.params.slug}`,
  () =>
    queryCollection(`${locale.value}_blog`)
      .where("slug", "=", route.params.slug as string)
      .first(),
)

if (post.value) {
  useSeoMeta({
    title: post.value.title,
    description: post.value.excerpt,
    ogTitle: `${post.value.title} - Hamed Bouare`,
    ogDescription: post.value.excerpt,
  })

  useJsonLd({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.value.title,
    description: post.value.excerpt,
    datePublished: post.value.date,
    author: {
      "@type": "Person",
      name: "Hamed Bouare",
      url: "https://hamedbouare.me",
    },
  })
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString(locale.value === "fr" ? "fr-FR" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

// Table of contents
const { headings, activeId } = useTableOfContents(contentRef)

// Copy-to-clipboard for code blocks
onMounted(() => {
  nextTick(() => {
    setupCopyButtons()
  })
})

function setupCopyButtons() {
  if (!contentRef.value) return

  const codeBlocks = contentRef.value.querySelectorAll("pre")
  codeBlocks.forEach((pre) => {
    // Wrap in a relative container
    const wrapper = document.createElement("div")
    wrapper.className = "code-block-wrapper"
    pre.parentNode?.insertBefore(wrapper, pre)
    wrapper.appendChild(pre)

    const btn = document.createElement("button")
    btn.className = "copy-btn font-mono"
    btn.textContent = t("blog.copy_code")
    btn.setAttribute("aria-label", t("blog.copy_code"))

    btn.addEventListener("click", async () => {
      const code =
        pre.querySelector("code")?.textContent ?? pre.textContent ?? ""
      try {
        await navigator.clipboard.writeText(code)
        btn.textContent = t("blog.copied")
        btn.classList.add("copy-btn--success")
        setTimeout(() => {
          btn.textContent = t("blog.copy_code")
          btn.classList.remove("copy-btn--success")
        }, 2000)
      } catch {
        // Fallback silently
      }
    })

    wrapper.appendChild(btn)
  })
}
</script>

<style scoped lang="scss">
.blog-layout {
  display: flex;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  gap: 0;
}

.blog-main {
  flex: 1;
  min-width: 0;
  max-width: 800px;
}

.blog-sidebar {
  width: 220px;
  flex-shrink: 0;
  padding-top: 12rem;
  padding-right: 1rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  text-decoration: none;
  margin-bottom: 2rem;
  transition: color 0.2s ease;

  &:hover {
    color: rgb(var(--v-theme-primary)) !important;
  }
}

.blog-meta {
  font-size: 0.62rem;
  letter-spacing: 0.1em;
}

.post-title {
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.post-content {
  font-size: 0.82rem;
  line-height: 2;
  color: rgb(var(--v-theme-on-background));

  :deep(h1),
  :deep(h2),
  :deep(h3) {
    font-family: "Playfair Display", serif;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-top: 2em;
    margin-bottom: 0.5em;
    color: rgb(var(--v-theme-on-background));
  }

  :deep(h2) {
    font-size: 1.6rem;
  }

  :deep(h3) {
    font-size: 1.2rem;
  }

  :deep(p) {
    margin-bottom: 1.2em;
    color: rgb(var(--v-theme-muted));
  }

  :deep(.code-block-wrapper) {
    position: relative;
    margin: 1.5em 0;
  }

  :deep(pre) {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-theme-primary), 0.12);
    padding: 1.25rem;
    margin: 0;
    overflow-x: auto;
    font-size: 0.72rem;
  }

  :deep(.copy-btn) {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.25rem 0.6rem;
    font-size: 0.55rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    background: rgba(var(--v-theme-primary), 0.08);
    color: rgb(var(--v-theme-muted));
    border: 1px solid rgba(var(--v-theme-primary), 0.15);
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: "DM Mono", monospace;
  }

  :deep(.copy-btn:hover) {
    background: rgba(var(--v-theme-primary), 0.15);
    color: rgb(var(--v-theme-primary));
  }

  :deep(.copy-btn--success) {
    color: rgb(var(--v-theme-primary));
    border-color: rgba(var(--v-theme-primary), 0.3);
  }

  :deep(code) {
    font-family: "DM Mono", monospace;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 1.5em;
    margin-bottom: 1.2em;
  }

  :deep(li) {
    margin-bottom: 0.4em;
    color: rgb(var(--v-theme-muted));
  }

  :deep(strong) {
    color: rgb(var(--v-theme-primary));
  }
}
</style>
