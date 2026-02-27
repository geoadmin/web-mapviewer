// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
    modules: ['@nuxt/ui', '@nuxtjs/i18n', '@pinia/nuxt', '@swissgeo/components'],
    alias: {
        '#composables': './src/runtime/composables',
    },
    pinia: {
        storesDirs: ['./src/runtime/stores'],
    },
})
