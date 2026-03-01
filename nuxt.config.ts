// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/eslint', '@vueuse/nuxt', '@nuxtjs/supabase'],
  supabase: {
    redirect: false
  },
  css: ['~/assets/css/main.css'],
  nitro: {
    azure: {
      config: {
        platform: {
          apiRuntime: 'node:20'
        }
      }
    }
  }
})
