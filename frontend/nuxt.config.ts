// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],

  typescript: {
    strict: true,
    typeCheck: true,
  },

  imports: {
    dirs: ['composables', 'utils', 'types'],
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.API_BASE_URL || 'http://localhost:3001',
      logtoEndpoint: process.env.LOGTO_ENDPOINT || 'https://your-logto.com',
      logtoAppId: process.env.LOGTO_APP_ID || '',
    },
  },

  app: {
    head: {
      title: 'Logto User Center',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Logto User Center Management System' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  vite: {
    resolve: {
      alias: {
        '@': '.',
      },
    },
  },
})
