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
        <button class="btn m-0 px-1 no-text-decoration btn-xs">
            <FontAwesomeIcon :icon="isOpen ? 'caret-up' : 'caret-down'" />
            <span class="small-space-left">{{ t('cms_news_button_title') }}</span>
        </button>

        <!-- Collapsible Menu Items -->
        <div
            v-if="isOpen"
            class="simple-news-menu shadow-lg"
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

.no-text-decoration {
    text-decoration: none;
}
.small-space-left {
    margin-left: 2px;
}
.simple-news-menu {
    display: grid;
    // The menu takes the whole available width, the open close button only as much as needed
    grid-template-rows: 1fr auto;
    z-index: $zindex-menu-tray;
    position: absolute;
    text-align: left;
}
.darken-on-hover:hover {
    background-color: $list-item-hover-bg-color;
}
</style>
