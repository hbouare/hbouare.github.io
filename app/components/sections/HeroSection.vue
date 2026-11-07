<!-- app/components/sections/HeroSection.vue -->
<!--
  Home hero. The wave field fills the frame behind the text; the overlay is
  pointer-transparent except for the CTAs, so moving or clicking anywhere
  else in the hero drives the field.
-->
<template>
  <section class="hero">
    <ClientOnly>
      <LazyUiWaveField :readout="readout" />
    </ClientOnly>

    <div class="hero-inner gutter">
      <p class="eyebrow hero-tag">{{ $t("hero.tag") }}</p>

      <div class="hero-main">
        <i18n-t scope="global" keypath="hero.title" tag="h1" class="t-hero hero-title">
          <template #em>
            <em class="em-accent">{{ $t("hero.title_em") }}</em>
          </template>
        </i18n-t>

        <div class="hero-foot">
          <div class="hero-intro">
            <p class="hero-subtitle">{{ $t("hero.subtitle") }}</p>
            <div class="hero-ctas">
              <NuxtLink :to="localePath('/contact')" class="btn btn--primary">
                {{ $t("hero.cta_contact") }} <span aria-hidden="true">→</span>
              </NuxtLink>
              <NuxtLink :to="localePath('/projects')" class="link-text">
                {{ $t("hero.cta_projects") }}
              </NuxtLink>
            </div>
          </div>

          <div class="hero-readout" aria-hidden="true">
            <div>{{ $t("hero.readout_hint") }}</div>
            <div ref="readout" class="tabular">t = 000.00 s</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const readout = ref<HTMLElement | null>(null)
</script>

<style scoped>
.hero {
  position: relative;
  height: clamp(640px, 56vw, 800px);
  border-bottom: 1px solid var(--rule);
  overflow: hidden;
  cursor: crosshair;
}

.hero-inner {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  padding-top: clamp(24px, 4vw, 56px);
  padding-bottom: clamp(28px, 3.6vw, 52px);
  pointer-events: none;
}

.hero-tag {
  margin: 0;
  max-width: 720px;
}

.hero-main {
  display: flex;
  flex-direction: column;
  gap: clamp(24px, 3.4vw, 48px);
}
.hero-title {
  max-width: 1100px;
}

.hero-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 48px;
  align-items: flex-end;
  justify-content: space-between;
}
.hero-intro {
  flex: 1 1 480px;
  max-width: 580px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.hero-subtitle {
  margin: 0;
  font-size: clamp(16px, 1.3vw, 18px);
  line-height: 1.6;
}
.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 28px;
  align-items: center;
  pointer-events: auto;
  cursor: auto;
}

.hero-readout {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  font-family: var(--f-mono);
  font-size: 11px;
  color: var(--muted);
  text-align: right;
}

@media (max-width: 759.98px) {
  .hero-readout {
    display: none;
  }
}
</style>
