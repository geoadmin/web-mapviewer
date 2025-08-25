<script setup>
import { CoordinateSystem } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

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

const copied = ref(false)

const store = useStore()
const { t } = useI18n()
const projection = computed(() => coordinateProjection ?? store.state.position.projection)
const copyButtonText = computed(() => t(copied.value ? 'copy_done' : 'copy_cta'))

const buttonIcon = computed(() => {
    if (copied.value) {
        return 'check'
    }
    // as copy is part of the "Regular" icon set, we have to give the 'far' identifier
    return ['far', 'copy']
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
        <GeoadminTooltip
            placement="right"
            :tooltip-content="copyButtonText"
        >
            <button
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
        </GeoadminTooltip>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.location-popup-data {
    @extend %clear-no-ios-long-press;

    display: grid;
    grid-template-columns: auto max-content;
}
</style>
