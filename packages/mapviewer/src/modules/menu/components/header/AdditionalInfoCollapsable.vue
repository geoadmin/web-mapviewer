<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import MoreInfo from '@/modules/menu/components/help/MoreInfo.vue'
import UpdateInfo from '@/modules/menu/components/help/UpdateInfo.vue'

const { t } = useI18n()

const isOpen = ref(false)
</script>

<template>
    <div
        @mouseenter="isOpen = true"
        @mouseleave="isOpen = false"
        @click="isOpen = !isOpen"
    >
        <!-- Menu Button -->
        <button class="btn m-0 px-1 btn-xs">
            <FontAwesomeIcon :icon="isOpen ? 'caret-up' : 'caret-down'" />
            <span class="ms-1">{{ t('cms_news_button_title') }}</span>
        </button>

        <!-- Collapsible Menu Items -->
        <div
            v-if="isOpen"
            class="d-flex flex-column-reverse shadow-lg position-absolute"
            data-cy="news-menu"
        >
            <MoreInfo
                small
                class="darken-on-hover"
            />
            <UpdateInfo
                small
                class="darken-on-hover"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.darken-on-hover:hover {
    background-color: $list-item-hover-bg-color;
}
</style>
