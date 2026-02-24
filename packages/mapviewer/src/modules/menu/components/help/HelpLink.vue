<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'
import useI18nStore from '@/store/modules/i18n'

const i18nStore = useI18nStore()

const { showAsButton = false } = defineProps<{
    showAsButton?: boolean
}>()

const { t } = useI18n()

const lang = computed(() => i18nStore.lang)
const helpPage = computed(() => {
    if (lang.value === 'de' || lang.value === 'rm') {
        return `de/kartenviewer-hilfe`
    }
    if (lang.value === 'fr') {
        return 'fr/visualiseur-de-cartes-aide'
    }
    if (lang.value === 'it') {
        return 'it/visualizzatore-di-mappe-aiuto'
    }
    // Fallback to english for the rest (en and rm)
    return 'en/map-viewer-help'
})

function openCmsLink() {
    window.open(`https://www.geo.admin.ch/${helpPage.value}`, '_blank', 'noreferrer')
}
</script>

<template>
    <HeaderLink
        :show-as-button="showAsButton"
        @click="openCmsLink"
    >
        {{ t('help_label') }}
    </HeaderLink>
</template>
