// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],

  // API 代理：前端 :3000 → 后端 :3001（同源 cookie，免 CORS）
  routeRules: {
    '/api/**': {
      proxy: 'http://localhost:3001/api/**',
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  // 禁用 Google Fonts
  ui: {
    fonts: false,
  },

  imports: {
    dirs: ['composables', 'utils', 'types', 'stores'],
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
      title: 'Authlode — SSO 用户管理平台',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Authlode SSO User Management Platform' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],
})
