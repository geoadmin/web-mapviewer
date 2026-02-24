<script setup lang="ts">
import type { CoordinateSystem, SingleCoordinate } from '@swissgeo/coordinates'

import log from '@swissgeo/log'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { CoordinateFormat } from '@/utils/coordinates/coordinateFormat'

import usePositionStore from '@/store/modules/position'
import formatCoordinates from '@/utils/coordinates/coordinateFormat'

const {
    identifier,
    value,
    extraValue,
    resetDelay = 1000,
    coordinateFormat,
    coordinateProjection,
} = defineProps<{
    identifier: string
    value: number[] | string
    extraValue?: string
    resetDelay?: number
    coordinateFormat?: CoordinateFormat
    coordinateProjection?: CoordinateSystem
}>()

const copied = ref(false)

const positionStore = usePositionStore()
const { t } = useI18n()
const projection = computed(() => coordinateProjection ?? positionStore.projection)
const copyButtonText = computed(() => t(copied.value ? 'copy_done' : 'copy_cta'))

const buttonIcon = computed(() => {
    if (copied.value) {
        return 'check'
    }
    // as copy is part of the "Regular" icon set, we have to give the 'far' identifier
    return ['far', 'copy']
})

function display(coordinates: number[] | string): string | number[] {
    if (coordinateFormat && Array.isArray(coordinates) && coordinates.length >= 2) {
        return formatCoordinates(
            coordinateFormat,
            coordinates as SingleCoordinate,
            projection.value
        )
    }
    return coordinates
}

async function copyValue(): Promise<void> {
    try {
        const displayValue = display(value)
        const textValue = typeof displayValue === 'string' ? displayValue : displayValue.join(', ')
        await navigator.clipboard.writeText(textValue)
        copied.value = true
        // leaving the "Copied" text for the wanted delay, and then reverting to "Copy"
        setTimeout(() => {
            copied.value = false
        }, resetDelay)
    } catch (error) {
        log.error({
            title: 'CoordinateCopySlot.vue',
            messages: [`Failed to copy to clipboard:`, error],
        })
    }
}
</script>

<template>
    <div class="location-popup-label">
        <slot />
    </div>
    <div class="location-popup-data align-items-center gap-1">
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
@import '@swissgeo/theme/scss/geoadmin-theme';

.location-popup-data {
    @extend %clear-no-ios-long-press;

    display: grid;
    grid-template-columns: auto max-content;
}
</style>
