// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
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
