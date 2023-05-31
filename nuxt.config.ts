// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    css: [
        "@/node_modules/uikit/src/scss/uikit.scss"
    ],
    modules : [
      '@nuxtjs/i18n',
    ],
    vite: {
        css: {
          preprocessorOptions: {
            scss: {
              additionalData: '@use "@/assets/styles/colors.scss" as *;@import "uikit/src/scss/variables-theme.scss"; @import "uikit/src/scss/mixins-theme.scss";',
            },
          },
        }
    }
})
