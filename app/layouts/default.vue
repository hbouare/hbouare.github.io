<template>
  <div class="app-shell">
    <NavigationTopBar />
    <main id="main" tabindex="-1">
      <slot />
    </main>
    <NavigationFooter />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
main {
  flex: 1;
}
</style>
