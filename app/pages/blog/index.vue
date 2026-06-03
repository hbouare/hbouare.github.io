<!-- app/pages/blog/index.vue -->
<template>
  <div class="blog-page">
    <UiPlumBlossom />
    <v-container class="px-6 px-md-10 section-v-pad position-relative" fluid>
      <UiRevealBlock>
        <UiSectionHeader
          tag="h1"
          :label="$t('blog.section')"
          :line1="$t('blog.title_1')"
          :line-em="$t('blog.title_em')"
        />
      </UiRevealBlock>

      <!-- Skeleton loaders -->
      <v-row v-if="!posts && !error" class="mt-14">
        <v-col v-for="n in 6" :key="n" cols="12" md="6" lg="4">
          <v-skeleton-loader type="article" color="surface" rounded="0" />
        </v-col>
      </v-row>

      <!-- Error state -->
      <p v-else-if="error" class="font-mono text-muted text-center py-16">
        {{ $t("blog.load_error") }}
      </p>

      <template v-else>
        <v-row class="mt-14">
          <v-col v-for="(post, i) in posts" :key="post.slug" cols="12" md="6" lg="4">
            <UiRevealBlock :delay="i * 100">
              <UiBlogCard :post="post" accent-bar title-tag="h2" />
            </UiRevealBlock>
          </v-col>
        </v-row>

        <p v-if="!posts?.length" class="font-mono text-muted text-center py-16">
          {{ $t("blog.no_posts") }}
        </p>
      </template>
    </v-container>
  </div>
</template>

<script setup lang="ts">
const { locale, t } = useI18n()

useSeoMeta({
  title: "Blog",
  description: t("blog.meta_desc"),
  ogTitle: "Blog - Hamed Bouare",
  ogDescription: t("blog.meta_desc"),
})

const { data: posts, error } = await useAsyncData(`blog-all-${locale.value}`, () =>
  queryCollection(`${locale.value}_blog`).order("date", "DESC").all(),
)
</script>

<style scoped lang="scss">
.blog-page {
  position: relative;
  min-height: 100vh;
}
</style>
