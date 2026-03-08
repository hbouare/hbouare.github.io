<template>
  <footer class="app-footer">
    <v-container
      class="d-flex align-center justify-space-between py-5 px-6 px-md-10 flex-wrap ga-3"
      fluid
    >
      <span class="font-mono text-caption text-muted">
        © {{ new Date().getFullYear() }} Hamed Bouare —
        {{ $t("footer.rights") }}
      </span>
      <div class="d-flex align-center ga-2">
        <span class="status-dot" />
        <span class="font-mono text-caption text-primary">{{
          $t("footer.available")
        }}</span>
      </div>
    </v-container>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  border-top: 1px solid rgba(var(--v-theme-primary), 0.12);
}
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: rgb(var(--v-theme-secondary));
  border-radius: 50%;
  animation: blink 2s ease-in-out infinite;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.3);
  }
}
</style>
