<script setup>
import tippy from 'tippy.js'
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { CoordinateFormat } from '@/utils/coordinates/coordinateFormat'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import log from '@/utils/logging'

const props = defineProps({
    identifier: {
        type: String,
        required: true,
    },
    value: {
        type: [Array, String],
        required: true,
    },
    extraValue: {
        type: String,
        default: null,
    },
    resetDelay: {
        type: Number,
        default: 1000,
    },
    coordinateFormat: {
        type: CoordinateFormat,
        default: null,
    },
    coordinateProjection: {
        type: CoordinateSystem,
        default: null,
    },
})
const { identifier, value, extraValue, resetDelay, coordinateFormat, coordinateProjection } =
    toRefs(props)

const copyButton = ref(null)
const copied = ref(false)

const i18n = useI18n()

const store = useStore()
const projection = computed(() => coordinateProjection.value ?? store.state.position.projection)
const lang = computed(() => store.state.i18n.lang)

const buttonIcon = computed(() => {
    if (copied.value) {
        return 'check'
    }
    // as copy is part of the "Regular" icon set, we have to give the 'far' identifier
    return ['far', 'copy']
})

let copyTooltip = null

onMounted(() => {
    copyTooltip = tippy(copyButton.value, {
        arrow: true,
        placement: 'right',
        hideOnClick: false,
        // no tooltip on mobile/touch
        touch: false,
        // The French translation of "copy_done" contains a &nbsp;
        allowHTML: true,
    })
    setTooltipContent()
})
onBeforeUnmount(() => {
    copyTooltip.destroy()
})

watch(lang, setTooltipContent)
watch(copied, setTooltipContent)

function setTooltipContent() {
    if (copied.value) {
        copyTooltip.setContent(i18n.t('copy_done'))
    } else {
        copyTooltip.setContent(i18n.t('copy_cta'))
    }
}

function display(coordinates) {
    if (coordinateFormat.value) {
        return coordinateFormat.value.format(coordinates, projection.value)
    }
    return coordinates
}
async function copyValue() {
    try {
        await navigator.clipboard.writeText(display(value.value))
        copied.value = true
        // leaving the "Copied" text for the wanted delay, and then reverting to "Copy"
        setTimeout(() => {
            copied.value = false
        }, resetDelay.value)
    } catch (error) {
        log.error(`Failed to copy to clipboard:`, error)
    }
}
</script>

<template>
    <div class="location-popup-label">
        <slot />
    </div>
    <div class="location-popup-data gap-1 align-items-center">
        <div>
            <div :data-cy="`${identifier}`">
                {{ display(value) }}
            </div>
            <div v-if="extraValue" :data-cy="`${identifier}-extra-value`">
                {{ extraValue }}
            </div>
        </div>
        <button
            ref="copyButton"
            :data-cy="`${identifier}-button`"
            class="location-popup-copy-button btn btn-sm btn-light text-black-50"
            type="button"
            @click="copyValue"
        >
            <FontAwesomeIcon class="icon" :icon="buttonIcon" :data-cy="`${identifier}-icon`" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
.location-popup-data {
    display: grid;
    grid-template-columns: auto max-content;
}
.location-popup-data {
    @extend .clear-no-ios-long-press;
}
</style>
