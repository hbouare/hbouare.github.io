// nuxt.config.ts
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify"

export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  compatibilityDate: "2025-01-01",

  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      emailjsServiceId: '',
      emailjsTemplateId: '',
      emailjsPublicKey: '',
    },
  },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      title: "Hamed Bouare",
      titleTemplate: "%s - Hamed Bouare",
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
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=DM+Mono:wght@300;400&family=Syne:wght@400;600;700;800&display=swap",
        },
      ],
    },
  },

  modules: [
    "@nuxt/content",
    "@nuxtjs/i18n",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        config.plugins?.push(vuetify({ autoImport: true }))
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
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
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
        "/contact",
        "/en/contact",
      ],
      crawlLinks: true,
    },
  },

  css: ["~/assets/styles/main.scss"],
})
