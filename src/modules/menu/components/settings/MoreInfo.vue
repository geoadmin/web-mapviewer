<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'

const store = useStore()
const i18n = useI18n()

const isDesktopMode = computed(() => store.getters.isDesktopMode)
const cmsUrl = computed(() => i18n.t('cms_link_button_url'))

function openCmsLink() {
    window.open(cmsUrl.value, '_blank', 'noreferrer')
}
</script>

<template>
    <HeaderLink v-if="isDesktopMode" @click="openCmsLink">
        {{ i18n.t('cms_link_button_title') }}
    </HeaderLink>
    <button v-else class="btn btn-light m-1" @click="openCmsLink">
        {{ i18n.t('cms_link_button_title') }}
    </button>
</template>
