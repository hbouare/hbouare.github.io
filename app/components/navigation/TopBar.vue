<!-- app/components/navigation/TopBar.vue -->
<!--
  Sticky header, laid out in CSS so the SSR markup is right for every width:
  wide shows the nav, FR/EN, theme and CTA; narrow shows the short CTA and a
  Menu button that unfolds the panel below.
  Its breakpoint is 1024px, not the system's 760px: the full bar needs ~900px
  of content (measured, FR), so at 760–985px it overflowed by up to 200px.
  The language switch is a real link (not a button) so Nitro's crawler finds
  every /en route from any page.
-->
<template>
  <header class="app-nav" :class="{ 'is-open': menuOpen }">
    <a href="#main" class="skip-link">{{ $t("header.skip") }}</a>

    <div class="bar gutter">
      <NuxtLink :to="localePath('/')" class="logo">
        <!-- The name, written then erased in a loop (the pre-refonte
             handwriting effect). The SVG is decoration; the name is read
             from the hidden span. -->
        <svg class="logo-name" viewBox="0 0 124 28" aria-hidden="true">
          <text x="1" y="21">Hamed Bouare</text>
        </svg>
        <span class="visually-hidden">Hamed Bouare</span>
      </NuxtLink>

      <nav class="desk-nav" :aria-label="$t('header.primary_nav')">
        <NuxtLink
          v-for="item in navItems"
          :key="item.key"
          :to="localePath(item.to)"
          class="nav-link"
          :class="{ 'is-active': item.key === activeKey }"
          :aria-current="item.key === activeKey ? 'page' : undefined"
        >
          {{ $t(`nav.${item.key}`) }}
        </NuxtLink>
      </nav>

      <div class="desk-tools">
        <NuxtLink :to="switchLocalePath(otherLocale)" class="lang-switch">
          <span aria-hidden="true" :class="{ 'is-on': locale === 'fr' }">FR</span>
          <span aria-hidden="true" class="muted">/</span>
          <span aria-hidden="true" :class="{ 'is-on': locale === 'en' }">EN</span>
          <span class="visually-hidden">{{ $t("header.switch_locale") }}</span>
        </NuxtLink>
        <button
          type="button"
          class="pill theme-toggle"
          @click="toggleTheme"
        >
          <UiThemeLabel />
        </button>
        <NuxtLink :to="localePath('/contact')" class="header-cta">
          {{ $t("header.cta") }}
        </NuxtLink>
      </div>

      <div class="mob-tools">
        <NuxtLink :to="localePath('/contact')" class="header-cta header-cta--mob">
          {{ $t("header.cta_short") }}
        </NuxtLink>
        <button
          type="button"
          class="pill pill--tall menu-toggle"
          aria-controls="mobile-menu"
          :aria-expanded="menuOpen ? 'true' : 'false'"
          @click="menuOpen = !menuOpen"
        >
          {{ menuOpen ? $t("header.close") : $t("header.menu") }}
        </button>
      </div>
    </div>

    <div v-show="menuOpen" id="mobile-menu" class="mob-menu">
      <nav class="mob-nav" :aria-label="$t('header.primary_nav')">
        <NuxtLink
          v-for="item in navItems"
          :key="item.key"
          :to="localePath(item.to)"
          class="mob-link"
          :class="{ 'is-active': item.key === activeKey }"
          :aria-current="item.key === activeKey ? 'page' : undefined"
        >
          <span>{{ $t(`nav.${item.key}`) }}</span>
          <span class="mob-num" aria-hidden="true">{{ item.num }}</span>
        </NuxtLink>
      </nav>
      <div class="mob-actions">
        <NuxtLink :to="switchLocalePath(otherLocale)" class="pill pill--block lang-switch">
          <span aria-hidden="true" :class="{ 'is-on': locale === 'fr' }">FR</span>
          <span aria-hidden="true" class="muted">/</span>
          <span aria-hidden="true" :class="{ 'is-on': locale === 'en' }">EN</span>
          <span class="visually-hidden">{{ $t("header.switch_locale") }}</span>
        </NuxtLink>
        <button
          type="button"
          class="pill pill--block theme-toggle"
          @click="toggleTheme"
        >
          <UiThemeLabel />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()
const { toggleTheme } = useAppTheme()

const navItems = [
  { key: "about", to: "/", num: "01" },
  { key: "services", to: "/services", num: "03" },
  { key: "projects", to: "/projects", num: "04" },
  { key: "research", to: "/research", num: "05" },
  { key: "blog", to: "/blog", num: "06" },
  { key: "contact", to: "/contact", num: "07" },
] as const

const otherLocale = computed(() => (locale.value === "fr" ? "en" : "fr"))

// Active section follows the route, so a case study lights up Projects and
// an article lights up Blog.
const activeKey = computed(() => {
  const path = route.path.replace(/^\/en(?=\/|$)/, "") || "/"
  if (path === "/") return "about"
  return navItems.find((i) => i.to !== "/" && path.startsWith(i.to))?.key
})

const menuOpen = ref(false)
watch(() => route.fullPath, () => (menuOpen.value = false))

const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") menuOpen.value = false
}
// Growing past the breakpoint hides the mobile tools; close the panel so it
// does not reappear on a later shrink.
let desktop: MediaQueryList | undefined
const onDesktop = (e: MediaQueryListEvent) => {
  if (e.matches) menuOpen.value = false
}

onMounted(() => {
  window.addEventListener("keydown", onKey)
  desktop = window.matchMedia("(min-width: 1024px)")
  desktop.addEventListener("change", onDesktop)
})
onUnmounted(() => {
  window.removeEventListener("keydown", onKey)
  desktop?.removeEventListener("change", onDesktop)
})
</script>

<style scoped>
.app-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--bg);
  border-bottom: 1px solid var(--rule);
  transition: var(--theme-fade);
}

.skip-link {
  position: absolute;
  left: var(--gutter);
  top: -100px;
  padding: 10px 16px;
  background: var(--ink);
  color: var(--bg);
  border-radius: var(--radius-pill);
  font-size: 14px;
  z-index: 30;
}
.skip-link:focus-visible {
  top: 12px;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 44px;
  padding-block: 16px;
}

.logo {
  display: flex;
  align-items: center;
  font-family: var(--f-display);
  font-style: italic;
  font-size: 21px;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

/* Handwriting, 10s loop: the pen traces the outlines left to right (the
   wipe carries the direction, the dash draws each stroke), the ink fills
   in, it holds, then the name is erased in reverse, right to left. */
.logo-name {
  width: 124px;
  height: 28px;
  overflow: visible;
  animation: logo-wipe 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.logo-name text {
  font: inherit;
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 0.5;
  stroke-dasharray: 120;
  /* Rest state = written: what reduced motion shows. */
  stroke-dashoffset: 0;
  stroke-opacity: 0;
  animation: logo-ink 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes logo-wipe {
  0% {
    clip-path: inset(-20% 100% -20% 0);
  }
  30%,
  62% {
    clip-path: inset(-20% -5% -20% 0);
  }
  80%,
  100% {
    clip-path: inset(-20% 100% -20% 0);
  }
}
/* The outline is only visible while the pen moves; once inked, the fill
   alone carries the letters. */
@keyframes logo-ink {
  0% {
    stroke-dashoffset: 120;
    stroke-opacity: 1;
    fill-opacity: 0;
  }
  30% {
    stroke-dashoffset: 0;
    stroke-opacity: 1;
    fill-opacity: 0;
  }
  40%,
  62% {
    stroke-dashoffset: 0;
    stroke-opacity: 0;
    fill-opacity: 1;
  }
  70% {
    stroke-dashoffset: 0;
    stroke-opacity: 1;
    fill-opacity: 0;
  }
  80%,
  100% {
    stroke-dashoffset: 120;
    stroke-opacity: 1;
    fill-opacity: 0;
  }
}
/* Reduced motion: the name stays written. Without this, the global
   override would run the loop once and leave it erased. */
@media (prefers-reduced-motion: reduce) {
  .logo-name,
  .logo-name text {
    animation: none;
  }
}

.desk-nav {
  display: flex;
  gap: 30px;
  font-size: 14px;
}
.nav-link {
  padding: 6px 0;
  color: var(--muted);
  border-bottom: 1px solid transparent;
  transition: color 0.2s;
}
.nav-link:hover,
.nav-link.is-active {
  color: var(--ink);
}
.nav-link.is-active {
  border-bottom-color: var(--accent);
}

.desk-tools,
.mob-tools {
  display: flex;
  align-items: center;
}
.desk-tools {
  gap: 16px;
}
.mob-tools {
  gap: 8px;
}

.lang-switch {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 4px;
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--muted);
}
.lang-switch .is-on {
  color: var(--ink);
}

.pill {
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--ink);
  background: none;
  border: 1px solid var(--rule);
  border-radius: var(--radius-pill);
  padding: 7px 12px;
  cursor: pointer;
}
.pill--tall {
  height: 44px;
  padding: 0 14px;
}
.pill--block {
  flex: 1;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-cta {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  background: var(--ink);
  color: var(--bg);
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  transition: opacity 0.2s;
}
.header-cta:hover {
  opacity: 0.86;
}
.header-cta--mob {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.mob-menu {
  border-top: 1px solid var(--rule);
  padding: 12px 20px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.mob-nav {
  display: flex;
  flex-direction: column;
}
.mob-link {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 10px 0;
  border-bottom: 1px solid var(--rule);
  font-family: var(--f-display);
  font-weight: 300;
  font-size: 34px;
  letter-spacing: -0.02em;
  color: var(--muted);
}
.mob-link.is-active {
  color: var(--ink);
}
.mob-num {
  font-family: var(--f-mono);
  font-size: 11px;
  color: var(--muted);
}
.mob-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 1023.98px) {
  .desk-nav,
  .desk-tools {
    display: none;
  }
}
@media (min-width: 1024px) {
  .mob-tools,
  .mob-menu {
    display: none;
  }
}
</style>
