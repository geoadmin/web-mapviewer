<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'

const store = useStore()
const i18n = useI18n()

const isDesktopMode = computed(() => store.getters.isDesktopMode)
const lang = computed(() => store.state.i18n.lang)
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
    <HeaderLink v-if="isDesktopMode" @click="openCmsLink">
        {{ i18n.t('help_label') }}
    </HeaderLink>
    <button v-else class="btn btn-light m-1" @click="openCmsLink">
        {{ i18n.t('help_label') }}
    </button>
</template>
