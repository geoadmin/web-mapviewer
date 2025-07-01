<script setup>
import GeoadminTooltip from '@geoadmin/tooltip'
import { computed } from 'vue'
import { useStore } from 'vuex'

import EditableFeature from '@/api/features/EditableFeature.class.js'
import { DrawingIcon, DrawingIconSet, generateURL } from '@/api/icon.api.js'

const { icon, currentFeature, currentIconSet, tooltipDisabled } = defineProps({
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
    /* tooltip will be disabled when the symbol selector is collapsed */
    tooltipDisabled: {
        type: Boolean,
        default: false,
    },
})

const emits = defineEmits(['change', 'change:iconSize', 'change:icon', 'change:iconColor', 'load'])

const store = useStore()
const currentLang = computed(() => store.state.i18n.lang)
const isTooltipDisabled = computed(() => icon.description === null || tooltipDisabled)

const isTextSameLanguage = (langKey) => langKey === currentLang.value

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
    return generateURL(icon, currentFeature.fillColor)
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
</script>

<template>
    <GeoadminTooltip
        :disabled="isTooltipDisabled"
        use-default-padding
    >
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
            />
        </button>
        <template #content>
            <div
                v-for="(text, key) in icon.description"
                :key="key"
            >
                <strong v-if="isTextSameLanguage(key)">{{ text }}</strong>
                <template v-else> {{ text }}</template>
            </div>
        </template>
    </GeoadminTooltip>
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
