export default defineNuxtConfig({
    modules: ['@nuxt/ui', '@nuxtjs/i18n', '../src/module'],
    devtools: { enabled: true },
    colorMode: false,
    compatibilityDate: 'latest',
    '@swissgeo/components': {
        global: false,
    },
})
