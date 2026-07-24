<!-- app/components/navigation/TopBar.vue -->
<template>
  <!--
    No `color` prop: it emits an inline background-color that only
    !important could beat. Leaving it off lets plain author CSS own the
    background — see the unscoped block below.
  -->
  <v-app-bar
    :elevation="0"
    :class="['app-nav', { 'nav-scrolled': scrolled }]"
    height="72"
    flat
  >
    <v-container class="d-flex align-center px-6 px-md-10 h-100" fluid>
      <!-- Logo with handwriting animation -->
      <NuxtLink :to="localePath('/')" class="nav-logo text-decoration-none">
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
            'nav-link type-micro-cap',
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
        class="nav-icon-btn lang-toggle"
        @click="switchLocale(locale === 'fr' ? 'en' : 'fr')"
      >
        {{ locale === "fr" ? "EN" : "FR" }}
      </button>

      <!-- Theme toggle -->
      <button
        class="nav-icon-btn nav-icon-btn--square theme-toggle"
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

      <!--
        Mobile menu — rendered only below md, gated by v-if like the drawer.
        Vuetify's display utilities (d-md-none) CANNOT hide it: `.nav-icon-btn`
        is unlayered scoped CSS with `display: inline-flex`, and unlayered
        author CSS beats Vuetify's layered utilities, so d-md-none is inert
        here. v-if sidesteps the cascade entirely and keeps this consistent
        with the drawer's smAndDown gate.
      -->
      <button
        v-if="smAndDown"
        class="nav-icon-btn nav-icon-btn--square menu-toggle ml-1"
        :aria-label="$t('nav.menu')"
        :aria-expanded="mobileMenu"
        @click="mobileMenu = !mobileMenu"
      >
        <v-icon icon="mdi-menu" size="18" />
      </button>
    </v-container>
  </v-app-bar>

  <!--
    Mobile drawer — rendered only below the md breakpoint (< 960px), the
    same switch the nav links/button use in CSS. On desktop it is not in the
    DOM at all rather than merely hidden.

    SSR-safe: with `ssr: true` (createVuetify), useDisplay reports the same
    assumed breakpoint on the server and on first client render, so this
    v-if produces no hydration mismatch; the real viewport is measured in
    onMounted and the drawer appears after hydration on mobile. The menu
    button stays CSS-driven, so mobile users see it immediately with no flash
    — the drawer only needs to exist once they tap, well after hydration.
  -->
  <v-navigation-drawer
    v-if="smAndDown"
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
        class="type-micro-cap mb-2"
        @click="mobileMenu = false"
      >
        {{ $t(`nav.${item.key}`) }}
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify"

const { locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { isDark, toggleTheme } = useAppTheme()

// Matches the md switch used by the nav links/button CSS (d-md-flex /
// d-md-none). Gates the drawer's presence so it never renders on desktop.
const { smAndDown } = useDisplay()

const scrolled = ref(false)
const mobileMenu = ref(false)

// If the viewport grows past the breakpoint while the drawer is open, close
// it: the v-if unmounts the drawer, and without this mobileMenu would stay
// true and re-open it on a later shrink back to mobile.
watch(smAndDown, (isMobile) => {
  if (!isMobile) mobileMenu.value = false
})

const route = useRoute()

const navItems = [
  { key: "about", to: "/", exact: true },
  { key: "projects", to: "/projects" },
  { key: "research", to: "/research" },
  { key: "blog", to: "/blog" },
  { key: "contact", to: "/contact" },
]

type AppLocale = "fr" | "en"

const switchLocale = async (code: AppLocale) => {
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

// Size and tracking come from .type-micro-cap; only state is local.
.nav-link {
  color: rgb(var(--v-theme-muted));
  text-decoration: none;
  transition: color 0.2s;
  &:hover,
  &:focus-visible,
  &.router-link-active,
  &.router-link-exact-active {
    color: rgb(var(--v-theme-on-background));
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
  &:hover,
  &:focus-visible {
    color: rgb(var(--v-theme-on-background));
    border-color: rgb(var(--v-theme-border));
  }
}

// Square 34px icon affordance, shared by the theme and menu toggles.
.nav-icon-btn--square {
  width: 34px;
  height: 34px;
  padding: 0;
}

.lang-toggle {
  font-size: var(--type-micro-cap);
  letter-spacing: 0.96px;
  text-transform: uppercase;
  padding: 4px 10px;
  margin-right: 4px;
}
</style>

<!--
  Unscoped: the app bar background and the teleported drawer both live
  outside this component's scope.

  Vuetify 4 wraps its own CSS in @layer, so unlayered author styles like
  these win on cascade order alone — no !important and no doubled selectors
  needed. Dropping the `color` prop removed the last inline style that
  would have required one.
-->
<style lang="scss">
.v-app-bar.app-nav {
  background: transparent;
  transition: box-shadow 0.3s ease;
}

// Scrolled state: the nav leaves overlay mode and takes the canvas.
// The system has no shadow tier, so separation is a hairline, not a shadow.
.v-app-bar.app-nav.nav-scrolled {
  background: rgb(var(--v-theme-background));
  border-bottom: 1px solid rgb(var(--v-theme-border));

  @supports (backdrop-filter: blur(1px)) {
    background: rgba(var(--v-theme-background), 0.92);
    backdrop-filter: blur(12px);
  }
}

// Mobile drawer — teleported to body, so scoped styles can't reach it.
.v-navigation-drawer {
  .v-list-item {
    color: rgb(var(--v-theme-muted));
    transition: color 0.25s;

    &:hover,
    &:focus-visible,
    &.router-link-active {
      color: rgb(var(--v-theme-on-background));
    }
  }
  .v-list-item__overlay {
    display: none;
  }
}
</style>
