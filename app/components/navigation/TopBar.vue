<!-- app/components/navigation/TopBar.vue -->
<template>
  <v-app-bar
    :elevation="scrolled ? 2 : 0"
    :class="['app-nav', { 'nav-scrolled': scrolled }]"
    height="72"
    color="transparent"
    flat
  >
    <v-container class="d-flex align-center px-6 px-md-10 h-100" fluid>
      <!-- Logo with handwriting animation -->
      <NuxtLink :to="localePath('/')" class="nav-logo text-decoration-none" :aria-label="$t('nav.home')">
        <svg
          class="logo-svg"
          viewBox="0 0 44 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- H -->
          <path
            class="logo-letter letter-1"
            d="M4 4 L4 28 M4 16 L16 16 M16 4 L16 28"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- B -->
          <path
            class="logo-letter letter-2"
            d="M24 4 L24 28 M24 4 L34 4 Q40 4 40 10 Q40 16 34 16 L24 16 L34 16 Q42 16 42 22 Q42 28 34 28 L24 28"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </NuxtLink>

      <v-spacer />

      <!-- Desktop nav links -->
      <nav class="d-none d-md-flex align-center ga-8 mr-6">
        <NuxtLink
          v-for="item in navItems"
          :key="item.key"
          :to="localePath(item.to)"
          :class="[
            'nav-link font-mono text-uppercase text-caption',
            {
              'router-link-exact-active':
                item.exact && route.path === localePath(item.to),
            },
          ]"
          :exact="item.exact"
        >
          {{ $t(`nav.${item.key}`) }}
        </NuxtLink>
      </nav>

      <!-- Compact lang toggle -->
      <button
        class="nav-icon-btn lang-toggle font-mono"
        :aria-label="locale === 'fr' ? 'Switch to English' : 'Passer en français'"
        @click="switchLocale(locale === 'fr' ? 'en' : 'fr')"
      >
        {{ locale === "fr" ? "EN" : "FR" }}
      </button>

      <!-- Theme toggle -->
      <button
        class="nav-icon-btn theme-toggle"
        :aria-label="
          isDark ? $t('theme.toggle_light') : $t('theme.toggle_dark')
        "
        @click="toggleTheme($event)"
      >
        <v-icon
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          size="18"
        />
      </button>

      <!-- Mobile menu -->
      <button
        class="nav-icon-btn theme-toggle d-flex d-md-none ml-1"
        @click="mobileMenu = !mobileMenu"
      >
        <v-icon icon="mdi-menu" size="18" />
      </button>
    </v-container>
  </v-app-bar>

  <!-- Mobile drawer -->
  <v-navigation-drawer
    v-model="mobileMenu"
    location="right"
    width="280"
    temporary
    color="surface-2"
  >
    <v-list class="pt-8 px-4">
      <v-list-item
        v-for="item in navItems"
        :key="item.key"
        :to="localePath(item.to)"
        class="font-mono text-uppercase mb-2"
        rounded="0"
        @click="mobileMenu = false"
      >
        {{ $t(`nav.${item.key}`) }}
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { isDark, toggleTheme } = useAppTheme()

const scrolled = ref(false)
const mobileMenu = ref(false)

const route = useRoute()

const navItems = [
  { key: "about", to: "/", exact: true },
  { key: "projects", to: "/projects" },
  { key: "blog", to: "/blog" },
  { key: "contact", to: "/contact" },
]

const switchLocale = async (code: string) => {
  const path = switchLocalePath(code)
  await navigateTo(path, { external: false })
}

const onScroll = () => {
  scrolled.value = window.scrollY > 40
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll)
})
</script>

<style scoped lang="scss">
// v-app-bar background is overridden globally in main.scss
// .nav-scrolled needs to beat that global rule
.app-nav {
  transition:
    background 0.3s ease,
    box-shadow 0.3s ease;
}
.app-nav.nav-scrolled {
  background: rgba(var(--v-theme-background), 0.92);
  backdrop-filter: blur(12px);
}
.nav-logo {
  display: flex;
  align-items: center;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.8;
  }
}
.logo-svg {
  width: 40px;
  height: 28px;
  color: rgb(var(--v-theme-primary));
}

// Handwriting draw + reverse-erase animation
// Draw: H then B | Erase: B then H (exact reverse)
// Erase retraces the stroke backward (0 → 150), not forward (-150)
.logo-letter {
  fill: none;
  stroke-dasharray: 150;
  stroke-dashoffset: 150;
}
.letter-1 {
  animation: drawH 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.letter-2 {
  animation: drawB 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes drawH {
  //         Draw H first
  0% {
    stroke-dashoffset: 150;
  }
  15% {
    stroke-dashoffset: 0;
  }
  //         Stay visible while B draws + pause
  62% {
    stroke-dashoffset: 0;
  }
  //         Erase H last (reverse direction: 0 → 150)
  78% {
    stroke-dashoffset: 150;
  }
  100% {
    stroke-dashoffset: 150;
  }
}
@keyframes drawB {
  //         Wait for H to draw
  0% {
    stroke-dashoffset: 150;
  }
  15% {
    stroke-dashoffset: 150;
  }
  //         Draw B second
  30% {
    stroke-dashoffset: 0;
  }
  //         Stay visible (pause)
  48% {
    stroke-dashoffset: 0;
  }
  //         Erase B first (reverse direction: 0 → 150)
  62% {
    stroke-dashoffset: 150;
  }
  100% {
    stroke-dashoffset: 150;
  }
}

.nav-link {
  color: rgb(var(--v-theme-muted));
  text-decoration: none;
  letter-spacing: 0.1em;
  font-size: 0.72rem;
  transition: color 0.2s;
  &:hover,
  &.router-link-active,
  &.router-link-exact-active {
    color: rgb(var(--v-theme-primary));
  }
}
.nav-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid transparent;
  cursor: pointer;
  border-radius: 4px;
  color: rgb(var(--v-theme-muted));
  transition:
    color 0.25s,
    border-color 0.25s;
  &:hover {
    color: rgb(var(--v-theme-primary));
    border-color: rgba(var(--v-theme-primary), 0.25);
  }
}
.lang-toggle {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 4px 10px;
  margin-right: 4px;
}
.theme-toggle {
  width: 34px;
  height: 34px;
  padding: 0;
}
</style>

<!-- Unscoped: v-navigation-drawer is teleported to body, scoped styles won't reach it -->
<style lang="scss">
.v-navigation-drawer {
  .v-list-item {
    color: rgb(var(--v-theme-muted)) !important;
    transition: color 0.25s;

    &:hover,
    &:focus-visible {
      color: rgb(var(--v-theme-primary)) !important;
    }
    &.router-link-active {
      color: rgb(var(--v-theme-primary)) !important;
    }
  }
  .v-list-item__overlay {
    display: none !important;
  }
}
</style>
