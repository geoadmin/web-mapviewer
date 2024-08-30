<script setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'

const props = defineProps({
    showAsButton: {
        type: Boolean,
        default: false,
    },
})

const { showAsButton } = toRefs(props)

const store = useStore()
const i18n = useI18n()

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
    <HeaderLink :show-as-button="showAsButton" @click="openCmsLink">
        {{ i18n.t('help_label') }}
    </HeaderLink>
</template>
