<script setup lang="ts">
import { onMounted, provide, watch } from 'vue'
import { I18nInjectionKey } from 'vue-i18n'

import i18n from '@/i18n'

interface I18nHostProps {
    locale?: 'en' | 'de' | 'fr' | 'it' | 'rm'
}

const { locale = 'en' } = defineProps<I18nHostProps>()

onMounted(() => {
    i18n.global.locale = locale
})

provide(I18nInjectionKey, i18n)

watch(
    () => locale,
    (locale) => {
        i18n.global.locale = locale
    }
)
</script>

<template>
    <slot />
</template>
