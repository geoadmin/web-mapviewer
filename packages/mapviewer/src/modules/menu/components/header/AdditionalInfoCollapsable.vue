<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref } from 'vue'

import MoreInfo from '@/modules/menu/components/help/MoreInfo.vue'
import UpdateInfo from '@/modules/menu/components/help/UpdateInfo.vue'

const isOpen = ref(false)
</script>

<template>
    <div
        @mouseenter="isOpen = true"
        @mouseleave="isOpen = false"
        @click="isOpen = true"
    >
        <!-- Menu Button. We need to override the rounded corners, then apply a new rounding on the top -->
        <button class="darken-on-hover d-flex btn btn-xs rounded-0 align-items-center">
            <FontAwesomeIcon :icon="isOpen ? 'caret-up' : 'caret-down'" />
            <span class="ms-1">News</span>
        </button>

        <!-- Collapsible Menu Items -->
        <div
            v-if="isOpen"
            class="d-flex flex-column-reverse position-absolute z-menu-1 background bg-white shadow-lg"
            data-cy="news-menu"
        >
            <MoreInfo class="darken-on-hover collapsable-menu-element rounded-0 p-1 px-2" />
            <UpdateInfo class="darken-on-hover collapsable-menu-element rounded-0 p-1 px-2" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@swissgeo/theme/scss/geoadmin-theme';
@import '@/scss/variables.module';
// we need this component to be under the searchbar when not hovered, and over it when hovered.

.z-menu-1 {
    z-index: $zindex-menu + 1;
}
.darken-on-hover {
    background-color: transparent;
}
.darken-on-hover:hover {
    background-color: $list-item-hover-bg-color;
}
.collapsable-menu-element {
    font-size: 0.825rem;
}
</style>
