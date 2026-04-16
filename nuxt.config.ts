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
