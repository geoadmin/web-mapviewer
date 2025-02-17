<script setup>
import { useI18n } from 'vue-i18n'

import GeoadminTooltip from '@/utils/components/GeoadminTooltip.vue'

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
            <GeoadminTooltip
                class="px-1"
                placement="right"
            >
                {{ t(title) }}
                <!-- we're inside the <a> tag, thus we need to override the font color -->
                <template #content>
                    <div class="text-black tool-tooltip">{{ t(tooltip) }}</div>
                </template>
            </GeoadminTooltip>
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

.tool-tooltip {
    padding: 6px 10px;
}
</style>
