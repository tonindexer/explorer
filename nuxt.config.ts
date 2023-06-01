// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig : {
      public : {
        tonUrl : 'https://testnet.anton.tools/api/v0/'
      }
    },
    modules : [
      '@nuxtjs/i18n',
      '@pinia/nuxt',
      '@fedorae/nuxt-uikit'
    ],
    vite: {
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: '@use "@/assets/styles/main.scss" as *;',
          },
        },
      }
  },
    pinia: {
      autoImports: [
        'defineStore', 
        ['defineStore', 'definePiniaStore'],
      ],
    }
})
