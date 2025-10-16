<script setup lang="ts">
import GeoadminTooltip from '@swissgeo/tooltip'
import { useI18n } from 'vue-i18n'

const { isSelected, title, tooltip, dropdownMenu } = defineProps<{
    isSelected?: boolean
    title: string
    tooltip?: string
    dropdownMenu?: boolean
}>()

const emit = defineEmits<{
    toggleMenu: []
}>()

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
                use-default-padding
            >
                {{ t(title) }}
                <!-- we're inside the <a> tag, thus we need to override the font color -->
                <template #content>
                    <div class="text-black">{{ tooltip ? t(tooltip) : '' }}</div>
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
        @extend %menu-item;

        cursor: pointer;
        height: 2.75em;
        line-height: 2.75em;
    }
}
</style>
