<!-- app/components/navigation/Footer.vue -->
<template>
  <footer class="app-footer gutter">
    <span>© {{ year }} Hamed Bouare — {{ $t("footer.rights") }}</span>
    <span class="status avail">{{ $t("footer.available") }}</span>
    <span class="socials">
      <a href="https://github.com/hbouare" target="_blank" rel="noopener">GitHub</a>
      <a
        href="https://www.linkedin.com/in/hamed-bouare-phd-0a1981112/"
        target="_blank"
        rel="noopener"
      >LinkedIn</a>
    </span>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.app-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 40px;
  justify-content: space-between;
  align-items: center;
  padding-block: 28px;
  border-top: 1px solid var(--rule);
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--muted);
}
.avail {
  color: var(--ink);
}
.socials {
  display: flex;
  gap: 20px;
}
.socials a {
  padding: 12px 0;
  transition: color 0.2s;
}
.socials a:hover {
  color: var(--accent);
}
</style>
