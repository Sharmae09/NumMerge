// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        { name: 'theme-color', content: '#1E1E2D' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ]
    }
  },
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  /*ts-ignore */
  target: "static",
  ssr: false,
  css: ["@ionic/vue/css/core.css", "@/assets/styles.css"],
  // "@/assets/styles/settings.scss"
  modules: ["@nuxtjs/tailwindcss"],
  // tailwindcss: {
  //   exposeConfig: true,
  //   viewer: true,
  //   // and more...
  // },
});
