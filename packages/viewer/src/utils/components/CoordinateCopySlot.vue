<script setup lang="ts">
import type { CoordinateSystem } from '@swissgeo/coordinates'

import log from '@swissgeo/log'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import usePositionStore from '@/store/modules/position.store'
import formatCoordinates, { type CoordinateFormat } from '@/utils/coordinates/coordinateFormat'

interface Props {
    identifier: string
    value: number[] | string
    extraValue?: string
    resetDelay?: number
    coordinateFormat?: CoordinateFormat
    coordinateProjection?: CoordinateSystem
}

const props = withDefaults(defineProps<Props>(), {
    extraValue: undefined,
    resetDelay: 1000,
    coordinateFormat: undefined,
    coordinateProjection: undefined,
})

const copied = ref(false)

const positionStore = usePositionStore()
const { t } = useI18n()
const projection = computed(() => props.coordinateProjection ?? positionStore.projection)
const copyButtonText = computed(() => t(copied.value ? 'copy_done' : 'copy_cta'))

const buttonIcon = computed(() => {
    if (copied.value) {
        return 'check'
    }
    // as copy is part of the "Regular" icon set, we have to give the 'far' identifier
    return ['far', 'copy']
})

function display(coordinates: number[] | string): string | number[] {
    if (props.coordinateFormat && Array.isArray(coordinates) && coordinates.length >= 2) {
        return formatCoordinates(
            props.coordinateFormat,
            coordinates as [number, number],
            projection.value
        )
    }
    return coordinates
}

async function copyValue(): Promise<void> {
    try {
        const displayValue = display(props.value)
        const textValue = typeof displayValue === 'string' ? displayValue : displayValue.join(', ')
        await navigator.clipboard.writeText(textValue)
        copied.value = true
        // leaving the "Copied" text for the wanted delay, and then reverting to "Copy"
        setTimeout(() => {
            copied.value = false
        }, props.resetDelay)
    } catch (error) {
        log.error(`Failed to copy to clipboard:`, error as Error)
    }
}
</script>

<template>
    <div class="location-popup-label">
        <slot />
    </div>
    <div class="location-popup-data align-items-center gap-1">
        <div>
            <div :data-cy="`${props.identifier}`">
                {{ display(props.value) }}
            </div>
            <div
                v-if="props.extraValue"
                :data-cy="`${props.identifier}-extra-value`"
            >
                {{ props.extraValue }}
            </div>
        </div>
        <GeoadminTooltip
            placement="right"
            :tooltip-content="copyButtonText"
        >
            <button
                :data-cy="`${props.identifier}-button`"
                class="location-popup-copy-button btn btn-sm btn-light text-black-50"
                type="button"
                @click="copyValue"
            >
                <FontAwesomeIcon
                    class="icon"
                    :icon="buttonIcon"
                    :data-cy="`${props.identifier}-icon`"
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
