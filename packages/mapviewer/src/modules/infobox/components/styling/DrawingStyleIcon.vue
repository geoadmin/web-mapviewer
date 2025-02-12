<script setup>
import log from '@geoadmin/log'
import { computed, useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import EditableFeature from '@/api/features/EditableFeature.class'
import { DrawingIcon, DrawingIconSet } from '@/api/icon.api'
import { SUPPORTED_LANG } from '@/modules/i18n'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const { icon, currentFeature, currentIconSet } = defineProps({
    icon: {
        type: DrawingIcon,
        required: true,
    },
    currentFeature: {
        type: EditableFeature,
        required: true,
    },
    currentIconSet: {
        type: DrawingIconSet,
        required: true,
    },
})

const emits = defineEmits(['change', 'change:iconSize', 'change:icon', 'change:iconColor', 'load'])

const store = useStore()
const currentLang = computed(() => store.state.i18n.lang)

const iconButton = useTemplateRef('iconButton')
const tooltipText = computed(() => {
    if (icon.description) {
        let str = ''
        for (const [key, value] of Object.entries(icon.description)) {
            str =
                str +
                `<div>${currentLang.value === key ? `<strong>${value}</strong>` : value}</div>`
            if (!SUPPORTED_LANG.includes(key)) {
                log.error('Language key provided is not supported: ', key)
            }
        }
        return str
    }
    return null
})

const { refreshTippyAttachment, removeTippy } = useTippyTooltip(iconButton, tooltipText, {
    placement: 'top',
    allowHTML: true,
})

function onCurrentIconChange(icon) {
    emits('change:icon', icon)
    emits('change')
}

/**
 * Generate an icon URL with medium size (so that the size doesn't change in the icon selector, even
 * when the user selects a different size for the icon the map)
 *
 * @param {DrawingIcon} icon
 * @returns {String} An icon URL
 */
function generateColorizedURL(icon) {
    return icon.generateURL(currentFeature.fillColor)
}

function getImageStrokeStyle(isColorable, isSelected, color) {
    if (isColorable) {
        return {
            filter: `drop-shadow(1px 1px 0 ${color.border}) drop-shadow(-1px -1px 0 ${color.border})`,
        }
    } else if (isSelected) {
        return { filter: 'drop-shadow(0px 0px 0 white)' }
    }
}

function onImageLoad() {
    emits('load')
}

function refreshTooltip() {
    refreshTippyAttachment()
}

function removeTooltip() {
    removeTippy()
}

defineExpose({ refreshTooltip, removeTooltip })
</script>

<template>
    <button
        ref="iconButton"
        class="icon-description btn btn-sm"
        :class="{
            'btn-light': currentFeature.icon?.name !== icon.name,
            'btn-primary': currentFeature.icon?.name === icon.name,
        }"
        :data-cy="`drawing-style-icon-selector-${icon.name}`"
        @click="onCurrentIconChange(icon)"
    >
        <img
            :alt="icon.name"
            :src="generateColorizedURL(icon)"
            class="marker-icon-image"
            :style="
                getImageStrokeStyle(
                    currentIconSet.isColorable,
                    currentFeature.icon?.name === icon.name,
                    currentFeature.fillColor
                )
            "
            crossorigin="anonymous"
            @load="onImageLoad"
        >
    </button>
</template>

<style lang="scss" scoped>

.marker-icon-image {
    width: 2rem;
    height: 2rem;
}
button {
    --bs-btn-padding-x: 0.25rem;
}
</style>
