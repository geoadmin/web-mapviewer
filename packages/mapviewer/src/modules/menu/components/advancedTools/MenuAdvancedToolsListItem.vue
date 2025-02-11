<script setup>
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const { isSelected, title, tooltip } = defineProps({
    isSelected: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        required: true,
    },
    tooltip: {
        type: String,
        default: '',
    },
    dropdownMenu: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['toggleMenu'])

const { t } = useI18n()

const tooltipAnchor = useTemplateRef('tooltipAnchor')
useTippyTooltip(tooltipAnchor, tooltip, {
    placement: 'auto',
    touch: false,
})
</script>

<template>
    <div class="advanced-tools-item border-bottom">
        <a
            class="d-flex align-items-center advanced-tools-title text-decoration-none ps-2"
            :class="{ 'text-primary': isSelected, 'text-black': !isSelected }"
            :data-cy="`menu-advanced-tools-${title}`"
            @click="emit('toggleMenu')"
        >
            <FontAwesomeIcon
                class="btn border-0 px-2"
                :class="{ invisible: !dropdownMenu, 'text-primary': isSelected }"
                :icon="`caret-${isSelected ? 'down' : 'right'}`"
            />
            <span
                ref="tooltipAnchor"
                class="px-1"
            >{{ t(title) }} </span>
        </a>
        <slot />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
@import '@/modules/menu/scss/menu-items';
.advanced-tools-item {
    .advanced-tools-title {
        // Here we add the menu-item styling to the title only to avoid hover
        // on the content once the item has been opened
        @extend .menu-item;

        cursor: pointer;
        height: 2.75em;
        line-height: 2.75em;
    }
}
</style>
