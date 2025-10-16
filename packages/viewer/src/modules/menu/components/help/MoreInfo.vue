<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import HeaderLink from '@/modules/menu/components/header/HeaderLink.vue'

const { showAsButton } = defineProps<{
    showAsButton?: boolean
}>()

const { t } = useI18n()
const cmsUrl = computed(() => t('cms_news_url'))

function openCmsLink() {
    window.open(cmsUrl.value, '_blank', 'noreferrer')
}
</script>

<template>
    <HeaderLink
        :show-as-button="showAsButton"
        data-cy="header-cms-link"
        @click="openCmsLink"
    >
        {{ t('cms_news_button_title') }}
    </HeaderLink>
</template>
