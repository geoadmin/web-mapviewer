<script setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'

const props = defineProps({
    showAsButton: {
        type: Boolean,
        default: false,
    },
})
const { showAsButton } = toRefs(props)

const { t } = useI18n()

const cmsUrl = computed(() => t('cms_link_button_url'))

function openCmsLink() {
    window.open(cmsUrl.value, '_blank', 'noreferrer')
}
</script>

<template>
    <HeaderLink :show-as-button="showAsButton" @click="openCmsLink">
        {{ t('cms_link_button_title') }}
    </HeaderLink>
</template>
