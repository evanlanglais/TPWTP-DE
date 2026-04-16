// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/eslint', '@vueuse/nuxt', '@nuxtjs/supabase'],
  app: {
    head: {
      title: 'Park Predictor',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
      ]
    }
  },
  supabase: {
    redirect: false
  },
  css: ['~/assets/css/main.css'],
  nitro: {
    compressPublicAssets: true,
    routeRules: {
      // Reference data — long cache
      '/api/destinations': { headers: { 'cache-control': 'public, max-age=3600, stale-while-revalidate=86400' } },
      '/api/parks': { headers: { 'cache-control': 'public, max-age=3600, stale-while-revalidate=86400' } },
      '/api/parks/*/attractions': { headers: { 'cache-control': 'public, max-age=3600, stale-while-revalidate=86400' } },

      // Live data — short cache
      '/api/parks/summary': { headers: { 'cache-control': 'public, max-age=60' } },
      '/api/parks/*/l1/live': { headers: { 'cache-control': 'public, max-age=60' } },

      // Single park detail — reference data (wildcard catches :id but not sub-paths)
      '/api/parks/*': { headers: { 'cache-control': 'public, max-age=3600, stale-while-revalidate=86400' } },
    },
    azure: {
      config: {
        platform: {
          apiRuntime: 'node:20'
        }
      }
    }
  }
})
