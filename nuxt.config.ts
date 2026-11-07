// nuxt.config.ts

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
    // CSS page transition (.page-* in base.css); `out-in` keeps the two
    // pages from overlapping.
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      title: "Hamed Bouare",
      titleTemplate: "%s - Hamed Bouare",
      style: [
        {
          // Canvas colour before the stylesheet loads (mirrors --bg in
          // tokens.css). No body-hiding: the theme lives in data-theme, set
          // by the script below before paint, so there is no flash to mask.
          innerHTML:
            'html,body{margin:0;background:#f3f0e8}html[data-theme="dark"],html[data-theme="dark"] body{background:#13120f}',
          tagPosition: "head",
        },
      ],
      script: [
        {
          // A saved choice wins; otherwise the OS preference decides.
          innerHTML: `(function(){var d=document.documentElement,t;try{t=localStorage.getItem('portfolio-theme')}catch(e){}if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.setAttribute('data-theme',t);d.style.colorScheme=t})()`,
          tagPosition: "head",
        },
      ],
      meta: [
        {
          name: "description",
          content:
            "Hamed Bouare, architecte logiciel · IA & Data Engineering. Docteur en modélisation numérique, je conçois et fiabilise des systèmes complexes.",
        },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          property: "og:title",
          content: "Hamed Bouare — Architecte logiciel · IA & Data Engineering",
        },
        {
          property: "og:description",
          content:
            "Docteur en modélisation numérique, je conçois et fiabilise des systèmes complexes — data, IA, du front-end au back-end.",
        },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "https://hamedbouare.me/og-image.png" },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Hamed Bouare — Architecte logiciel · IA & Data Engineering",
        },
        {
          name: "twitter:description",
          content:
            "Docteur en modélisation numérique, je conçois et fiabilise des systèmes complexes.",
        },
        { name: "twitter:image", content: "https://hamedbouare.me/og-image.png" },
      ],
      link: [
        // SVG (theme-adaptive ink) is preferred by modern browsers; the ICO is
        // the raster fallback (Google Search, legacy), apple-touch-icon for iOS.
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico", sizes: "16x16 32x32 48x48" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          // « Sismogramme »: Newsreader (display), Instrument Sans (text),
          // IBM Plex Mono (markers, code). TODO: self-host via @nuxt/fonts.
          href: "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap",
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
  ],

  // Nuxt Content v3 config
  content: {
    build: {
      markdown: {
        highlight: {
          // Sober, low-chroma palettes close to the « Sismogramme » tokens.
          theme: {
            dark: "vitesse-dark",
            default: "vitesse-light",
          },
        },
      },
    },
  },

  // i18n config
  i18n: {
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

  vite: {
    define: {
      "process.env.DEBUG": false,
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
        "/research",
        "/en/research",
        "/contact",
        "/en/contact",
      ],
      crawlLinks: true,
    },
  },

  css: ["~/assets/styles/tokens.css", "~/assets/styles/base.css"],
})
