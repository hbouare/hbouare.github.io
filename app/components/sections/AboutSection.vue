<template>
  <section id="about" class="section-pad">
    <v-container class="px-6 px-md-10" fluid>
      <v-row>
        <v-col cols="12" md="5">
          <UiRevealBlock>
            <UiSectionHeader
              :label="$t('about.section')"
              :line1="$t('about.title_1')"
              :line-em="$t('about.title_em')"
              :line3="$t('about.title_3')"
            />
            <div class="font-mono about-text mt-6">
              <p>{{ $t("about.p1") }}</p>
              <p class="mt-4">{{ $t("about.p2") }}</p>
              <p class="mt-4">{{ $t("about.p3") }}</p>
            </div>
          </UiRevealBlock>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.about-text {
  font-size: 0.8rem;
  line-height: 2;
  color: rgb(var(--v-theme-muted));
}
</style>
