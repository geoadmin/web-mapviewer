import '@/index'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import DevApp from '@/DevApp.vue'

const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {},
    missingWarn: false,
})

const app = createApp(DevApp)
app.use(i18n)
app.mount('#app')
