<!-- app/components/sections/AboutSection.vue -->
<template>
  <section id="about" class="section gutter editorial" aria-labelledby="about-title">
    <div class="editorial__key eyebrow about-key">{{ $t("about.section") }}</div>
    <div class="editorial__body about-body">
      <i18n-t scope="global" id="about-title" keypath="about.title" tag="h2" class="t-h2">
        <template #em>
          <em>{{ $t("about.title_em") }}</em>
        </template>
      </i18n-t>
      <p class="t-lead about-lead">{{ $t("about.p1") }}</p>
      <div class="about-cols">
        <p>{{ $t("about.p2") }}</p>
        <p>{{ $t("about.p3") }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-key {
  padding-top: 12px;
}
.about-body {
  display: flex;
  flex-direction: column;
  gap: var(--block-gap);
}
.about-lead {
  max-width: 860px;
}
.about-cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 24px 40px;
  font-size: 16px;
  line-height: 1.65;
  color: var(--muted);
}
.about-cols p {
  margin: 0;
  line-height: inherit;
}
</style>
