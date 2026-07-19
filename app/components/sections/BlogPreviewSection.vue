<template>
  <section id="blog" class="section-pad section-surface">
    <v-container class="px-6 px-md-10" fluid>
      <!-- Header self-animates; the row is no longer reveal-wrapped. -->
      <div class="d-flex align-end justify-space-between flex-wrap ga-4 mb-14">
          <UiSectionHeader
            :label="$t('blog.section')"
            :line1="$t('blog.title_1')"
            :line-em="$t('blog.title_em')"
          />
          <v-btn
            :to="localePath('/blog')"
            variant="text"
            append-icon="mdi-arrow-right"
          >
            {{ $t("blog.view_all") }}
          </v-btn>
      </div>

      <!-- Skeleton loaders while data loads -->
      <v-row v-if="!posts">
        <v-col v-for="n in 2" :key="n" cols="12" md="6">
          <v-skeleton-loader type="article" />
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col v-for="(post, i) in posts" :key="post.slug" cols="12" md="6">
          <UiRevealBlock :delay="i * 150">
            <UiBlogCard :post="post" accent-bar />
          </UiRevealBlock>
        </v-col>
      </v-row>

      <div v-if="!posts?.length" class="type-body-md text-muted text-center py-12">
        {{ $t("blog.no_posts") }}
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()

const { data: posts } = await useAsyncData(`blog-preview-${locale.value}`, () =>
  queryCollection(`${locale.value}_blog`).order("date", "DESC").limit(2).all(),
)
</script>
