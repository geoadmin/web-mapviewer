<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'

const store = useStore()
const i18n = useI18n()

const isDesktopMode = computed(() => store.getters.isDesktopMode)
const lang = computed(() => store.state.i18n.lang)

function openCmsLink() {
    window.open(`https://help.geo.admin.ch?lang=${lang.value}`, '_blank', 'noreferrer')
}
</script>

<template>
    <HeaderLink v-if="isDesktopMode" @click="openCmsLink">
        {{ i18n.t('help_label') }}
    </HeaderLink>
    <button v-else class="btn btn-sm btn-light m-1" @click="openCmsLink">
        {{ i18n.t('help_label') }}
    </button>
</template>
