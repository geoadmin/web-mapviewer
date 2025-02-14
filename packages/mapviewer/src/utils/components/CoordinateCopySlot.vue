<script setup>
import { CoordinateSystem } from '@geoadmin/coordinates'
import log from '@geoadmin/log'
import { computed, ref, useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'
import { CoordinateFormat } from '@/utils/coordinates/coordinateFormat'

const { identifier, value, extraValue, resetDelay, coordinateFormat, coordinateProjection } =
    defineProps({
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

const copyButton = useTemplateRef('copyButton')
const copied = ref(false)

const store = useStore()
const projection = computed(() => coordinateProjection ?? store.state.position.projection)
const copyButtonText = computed(() => (copied.value ? 'copy_done' : 'copy_cta'))

const buttonIcon = computed(() => {
    if (copied.value) {
        return 'check'
    }
    // as copy is part of the "Regular" icon set, we have to give the 'far' identifier
    return ['far', 'copy']
})

useTippyTooltip(copyButton, copyButtonText, {
    placement: 'right',
    hideOnClick: false,
    // no tooltip on mobile/touch
    touch: false,
    // The French translation of "copy_done" contains a &nbsp;
    allowHTML: true,
})

function display(coordinates) {
    return coordinateFormat?.format(coordinates, projection.value) ?? coordinates
}

async function copyValue() {
    try {
        await navigator.clipboard.writeText(display(value))
        copied.value = true
        // leaving the "Copied" text for the wanted delay, and then reverting to "Copy"
        setTimeout(() => {
            copied.value = false
        }, resetDelay)
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
            <div
                v-if="extraValue"
                :data-cy="`${identifier}-extra-value`"
            >
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
            <FontAwesomeIcon
                class="icon"
                :icon="buttonIcon"
                :data-cy="`${identifier}-icon`"
            />
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
