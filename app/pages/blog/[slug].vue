<!-- app/pages/blog/[slug].vue -->
<template>
  <div class="blog-layout">
    <!-- Main content -->
    <div class="blog-main">
      <v-container class="px-6 px-md-10" fluid >
        <div class="section-v-pad">
          <UiRevealBlock>
            <NuxtLink
              :to="localePath('/blog')"
              class="back-link type-micro-cap text-muted"
            >
              <v-icon size="14" class="mr-1">mdi-arrow-left</v-icon>
              {{ $t("blog.view_all") }}
            </NuxtLink>
          </UiRevealBlock>

          <!-- Skeleton while loading -->
          <div v-if="!post && !postError" class="py-8">
            <v-skeleton-loader type="heading" class="mb-6" />
            <v-skeleton-loader type="paragraph" class="mb-4" />
            <v-skeleton-loader type="paragraph" class="mb-4" />
            <v-skeleton-loader type="paragraph" />
          </div>

          <div v-if="post">
            <UiRevealBlock>
              <div class="d-flex align-center ga-3 mb-6 flex-wrap">
                <span class="type-micro-cap text-muted">{{
                  formatDate(post.date)
                }}</span>
                <span class="type-micro-cap text-muted">·</span>
                <span class="type-micro-cap text-muted"
                  >{{ post.readTime }} {{ $t("blog.min_read") }}</span
                >
              </div>

              <h1 class="post-title type-display-lg">{{ post.title }}</h1>

              <div class="d-flex flex-wrap ga-1 mt-5">
                <v-chip v-for="tag in post.tags" :key="tag" size="x-small">{{ tag }}</v-chip>
              </div>
            </UiRevealBlock>

            <v-divider class="my-10" />

            <div ref="contentRef" class="post-content">
              <ContentRenderer :value="post" />
            </div>
          </div>

          <div v-else-if="postError" class="text-center py-20">
            <p class="type-body-md text-muted">{{ $t("blog.not_found") }}</p>
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

const { formatDate } = useFormatDate()

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

// Size and tracking come from .type-micro-cap.
.back-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  margin-bottom: 2rem;
  transition: color 0.2s ease;

  &:hover,
  &:focus-visible {
    color: rgb(var(--v-theme-on-background));
  }
}

// Long-form prose. Body runs at the reading tier, not the UI tier — this
// is the one surface where line length and leading matter most.
.post-content {
  font-size: var(--type-body-lg);
  line-height: 1.8;
  color: rgb(var(--v-theme-on-background));

  :deep(h2),
  :deep(h3) {
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: 0.4px;
    margin-top: 2em;
    margin-bottom: 0.5em;
    color: rgb(var(--v-theme-on-background));
  }

  // Nuxt Content wraps headings in an anchor for deep-linking; the UA
  // underline on it must not read as a link inside the prose.
  :deep(h2 a),
  :deep(h3 a) {
    text-decoration: none;
    color: inherit;
  }

  :deep(h2) {
    font-size: var(--type-prose-h2);
  }

  :deep(h3) {
    font-size: var(--type-title);
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
    border: 1px solid rgb(var(--v-theme-border));
    padding: 1.25rem;
    margin: 0;
    overflow-x: auto;
    font-size: var(--type-code);
  }

  :deep(.copy-btn) {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.25rem 0.6rem;
    font-size: calc(var(--type-code) * 0.8);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    background: rgb(var(--v-theme-surface-2));
    color: rgb(var(--v-theme-muted));
    border: 1px solid rgb(var(--v-theme-border));
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--font-mono);
  }

  :deep(.copy-btn:hover) {
    color: rgb(var(--v-theme-on-background));
    border-color: rgb(var(--v-theme-on-background));
  }

  :deep(.copy-btn--success) {
    color: rgb(var(--v-theme-on-background));
    border-color: rgb(var(--v-theme-on-background));
  }

  :deep(code) {
    font-family: var(--font-mono);
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

  // Emphasis is weight + full-ink colour, never a hue.
  :deep(strong) {
    color: rgb(var(--v-theme-on-background));
    font-weight: 700;
  }
}
</style>
