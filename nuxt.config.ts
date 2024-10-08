// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'src/',

  runtimeConfig : {
    public : {
      tonUrl : 'https://anton.tools/api/v0/',
      tonMeta : 'https://anton.tools/api/metadata',
      tonSuperset: 'https://superset.anton.tools/api/v1',
      dashboard: false,
      testnet: false
    }
  },

  build: {
    transpile: ['@vuepic/vue-datepicker']
  },

  modules : [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxtjs/device',
    '@nuxtjs/google-fonts',
    '@nuxtjs/color-mode'
  ],

  colorMode: {
    preference: 'system',
    fallback: 'light'
  },

  pinia: {
    autoImports: [
      'defineStore', 
      ['defineStore', 'definePiniaStore']
    ]
  },

  imports: {
    dirs: ['stores']
  },

  googleFonts: {
    families: {
      'Roboto Mono' : true,
      Inter: [400, 700],
      'Fira Mono': true
    }
  },

  devtools: {
    enabled: false
  },

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    baseUrl: 'https://explorer.anton.tools',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    },
    locales : [
      {
        code: 'en',
        language: 'en-US',
        file: 'en.json'
      },
      {
        code: 'ru',
        language: 'ru-RU',
        file: 'ru.json'
      }
    ],
    langDir: 'i18n'
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    }
  },

  compatibilityDate: '2024-10-02'
})