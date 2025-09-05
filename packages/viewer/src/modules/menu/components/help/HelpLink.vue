<script setup lang="js">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'

const { showAsButton } = defineProps({
    showAsButton: {
        type: Boolean,
        default: false,
    },
})

const store = useStore()
const { t } = useI18n()

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
    <HeaderLink
        :show-as-button="showAsButton"
        @click="openCmsLink"
    >
        {{ t('help_label') }}
    </HeaderLink>
</template>
