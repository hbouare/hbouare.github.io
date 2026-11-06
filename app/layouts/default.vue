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
/* isolation: a stacking context, so a z-index -1 background canvas (the
   article tree) paints above the body background and below the content.
   Without it, it would sit under body's background — html has its own
   background (inline head style), so body's is painted as a block. */
.app-shell {
  isolation: isolate;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
main {
  flex: 1;
}
</style>
