// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig : {
      public : {
        tonUrl : 'https://anton.tools/api/v0/'
      }
    },
    modules : [
      '@nuxtjs/i18n',
      '@pinia/nuxt',
      '@fedorae/nuxt-uikit',
      '@nuxtjs/device'
    ],
    device: {
      refreshOnResize: true
    },
    pinia: {
      autoImports: [
        'defineStore', 
        ['defineStore', 'definePiniaStore'],
      ],
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
          iso: 'en-US',
          file: 'en.json'
        },
        {
          code: 'ru',
          iso: 'ru-RU',
          file: 'ru.json'
        }
      ],
      langDir: 'i18n'
    }
})
