<template>
  <v-app>
    <NavigationTopBar />
    <v-main>
      <slot />
    </v-main>
    <NavigationFooter />
    <NavigationScrollToTop />
  </v-app>
</template>
<script setup lang="ts"></script>
