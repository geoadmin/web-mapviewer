import '@/index.ts'

import { createApp } from 'vue'

import DevApp from '@/DevApp.vue'

const app = createApp(DevApp)
app.mount('#app')
