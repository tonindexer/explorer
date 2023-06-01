// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig : {
      public : {
        tonUrl : 'https://testnet.anton.tools/api/v0/'
      }
    },
    css: [
        "@/node_modules/uikit/src/scss/uikit.scss"
    ],
    modules : [
      '@nuxtjs/i18n',
      '@pinia/nuxt'
    ],
    vite: {
        css: {
          preprocessorOptions: {
            scss: {
              additionalData: '@use "@/assets/styles/colors.scss" as *;@import "uikit/src/scss/variables-theme.scss"; @import "uikit/src/scss/mixins-theme.scss";',
            },
          },
        }
    },
    pinia: {
      autoImports: [
        // automatically imports `defineStore`
        'defineStore', // import { defineStore } from 'pinia'
        ['defineStore', 'definePiniaStore'], // import { defineStore as definePiniaStore } from 'pinia'
      ],
    },
})
