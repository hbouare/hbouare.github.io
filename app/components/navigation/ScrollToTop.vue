<template>
  <v-btn
    v-show="visible"
    class="scroll-to-top"
    icon="mdi-arrow-up"
    color="primary"
    size="small"
    aria-label="Scroll to top"
    @click="scrollToTop"
  />
</template>

<script setup lang="ts">
const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 400
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" })
}

onMounted(() => window.addEventListener("scroll", onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener("scroll", onScroll))
</script>

<style scoped lang="scss">
.scroll-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
  opacity: 0.85;
  transition: opacity 0.3s, transform 0.3s;
  &:hover {
    opacity: 1;
    transform: translateY(-2px);
  }
}
</style>
