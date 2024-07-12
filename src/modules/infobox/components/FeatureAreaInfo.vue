<script setup>
import area from '@turf/area'
import { computed, toRefs } from 'vue'
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { reprojectGeoJsonData, transformIntoTurfEquivalent } from '@/utils/geoJsonUtils'
import { round } from '@/utils/numberUtils'

const props = defineProps({
    geometry: {
        type: Object,
        required: true,
        validator: (value) => value?.type === 'Polygon',
    },
})
const { geometry } = toRefs(props)

useTippyTooltip('.area-information-container[data-tippy-content]', { placement: 'right' })

const store = useStore()
const projection = computed(() => store.state.position.projection)

const geometryWgs84 = computed(() => {
    if (projection.value === WGS84) {
        return geometry.value
    }
    return reprojectGeoJsonData(geometry.value, WGS84, projection.value)
})

/** @type {ComputedRef<string>} */
const humanReadableArea = computed(() => {
    const calculatedArea = area(transformIntoTurfEquivalent(geometryWgs84.value))
    let result = ''
    if (calculatedArea) {
        const unitThreshold = 1e5
        const divider = 1e6
        const precision = 5

        const value = calculatedArea < unitThreshold ? calculatedArea : calculatedArea / divider
        result += parseFloat(value.toPrecision(precision))
        if (calculatedArea >= unitThreshold) {
            result += ' km'
        } else {
            result += ' m'
        }
    }
    return result
})
</script>

<template>
    <div class="area-information-container d-flex align-items-center" data-tippy-content="area">
        <div class="rectangle"></div>
        <div class="area-information ps-2">
            <span class="align-middle" data-cy="feature-area-information"
                >{{ humanReadableArea }}<sup>2</sup></span
            >
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
$rectangle-line-width: 2px;
$rectangle-line-color: $gray-600;
$transparent: rgba(0, 0, 0, 0);
.rectangle {
    height: 1rem;
    width: 1.5rem;
    border-radius: 0.1rem;
    border: $rectangle-line-width solid $rectangle-line-color;
    background: repeating-linear-gradient(
        45deg,
        // transparent stripe
        $transparent,
        $transparent $rectangle-line-width,
        // gray stripe
        $rectangle-line-color $rectangle-line-width,
        // another transparent stripe, sandwiching the gray stripe
        $transparent 2 * $rectangle-line-width
    );
}
.area-information {
    @extend .clear-no-ios-long-press;
}
</style>
