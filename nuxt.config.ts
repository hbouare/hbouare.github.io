// nuxt.config.ts
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify"

export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2025-01-01",

  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      emailjsServiceId: "",
      emailjsTemplateId: "",
      emailjsPublicKey: "",
    },
  },

  app: {
    // The page transition is driven by GSAP JS hooks defined on <NuxtPage>
    // in app.vue (css: false). This entry stays as the SSR/no-JS fallback
    // name; `mode: out-in` keeps the two pages from overlapping.
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      title: "Hamed Bouare",
      titleTemplate: "%s - Hamed Bouare",
      style: [
        {
          // Fix #3: CSS anti-flash INLINE dans le <head>, pas dans un fichier externe.
          // Fix #1: opacity:0 au lieu de visibility:hidden (rien ne passe à travers).
          innerHTML:
            'html,body{margin:0;background:#000}html[data-theme="light"],html[data-theme="light"] body{background:#fff}html:not(.hydrated) body{opacity:0}html.hydrated body{transition:opacity .1s}',
          tagPosition: "head",
        },
      ],
      script: [
        {
          // Also marks <html> as scripting-capable: scroll-reveal blocks rest
          // at opacity 0 and are revealed by GSAP, so without JS they must
          // fall back to visible rather than staying blank.
          innerHTML: `(function(){var d=document.documentElement,t=localStorage.getItem('portfolio-theme')||'dark';d.setAttribute('data-theme',t);d.style.colorScheme=t;d.classList.add('js')})()`,
          tagPosition: "head",
        },
      ],
      meta: [
        {
          name: "description",
          content:
            "Portfolio de Hamed Bouare, Data Engineer et développeur Full-Stack avec une expérience internationale.",
        },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          property: "og:title",
          content: "Hamed Bouare — Data Engineer & Full-Stack Developer",
        },
        {
          property: "og:description",
          content:
            "Portfolio de Hamed Bouare, Data Engineer et développeur Full-Stack avec une expérience internationale.",
        },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "/og-image.svg" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Hamed Bouare — Data Engineer & Full-Stack Developer",
        },
        {
          name: "twitter:description",
          content:
            "Portfolio de Hamed Bouare, Data Engineer et développeur Full-Stack.",
        },
        { name: "twitter:image", content: "/og-image.svg" },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          // Inter is the design system's documented substitute for D-DIN
          // (display tiers run 700 uppercase with positive tracking).
          // DM Mono is kept for code only — a deliberate, documented
          // deviation, since the source system has no monospace tier.
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=DM+Mono:wght@400&display=swap",
        },
      ],
    },
  },

  site: {
    url: "https://hamedbouare.me",
  },

  modules: [
    "@nuxt/content",
    "@nuxtjs/i18n",
    "@nuxtjs/sitemap",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // vite-plugin-vuetify, Nuxt and the root all resolve their own copy of
        // vite's types. The plugin array is structurally identical in each but
        // nominally distinct, and no single PluginOption import satisfies all
        // three — so widen the target array instead. Runtime is unaffected.
        ;(config.plugins as unknown[])?.push(vuetify({ autoImport: true }))
      })
    },
  ],

  // Nuxt Content v3 config
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            dark: "github-dark",
            default: "github-light",
          },
        },
      },
    },
  },

  // i18n config
  i18n: {
    bundle: { optimizeTranslationDirective: false },
    baseUrl: "https://hamedbouare.me",
    strategy: "prefix_except_default",
    defaultLocale: "fr",
    locales: [
      { code: "fr", name: "Français", language: "fr-FR", file: "fr.json" },
      { code: "en", name: "English", language: "en-US", file: "en.json" },
    ],
    langDir: "locales/",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },

  build: {
    transpile: ["vuetify"],
  },

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    define: {
      "process.env.DEBUG": false,
    },
    // `css.preprocessorOptions.scss.api = "modern-compiler"` was removed:
    // the modern Sass compiler is now the only API, so the option no longer
    // exists in Vite's types.
  },

  // Static generation for GitHub Pages
  nitro: {
    preset: "github-pages",
    prerender: {
      routes: [
        "/",
        "/en",
        "/blog",
        "/en/blog",
        "/projects",
        "/en/projects",
        "/research",
        "/en/research",
        "/contact",
        "/en/contact",
      ],
      crawlLinks: true,
    },
  },

  css: ["~/assets/styles/main.scss"],
})
