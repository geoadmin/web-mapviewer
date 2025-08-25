<script setup>
import { WGS84 } from '@swissgeo/coordinates'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { computePolygonPerimeterArea } from '@/utils/geodesicManager'
import { reprojectGeoJsonData } from '@/utils/geoJsonUtils'

const { geometry } = defineProps({
    geometry: {
        type: Object,
        required: true,
        validator: (value) => value?.type === 'Polygon',
    },
})

const { t } = useI18n()
const store = useStore()
const projection = computed(() => store.state.position.projection)

const geometryWgs84 = computed(() => {
    if (projection.value === WGS84) {
        return geometry
    }
    return reprojectGeoJsonData(geometry, WGS84, projection.value)
})

/** @type {ComputedRef<string>} */
const humanReadableArea = computed(() => {
    const coords = geometryWgs84.value.coordinates[0]
    const res = computePolygonPerimeterArea(coords)
    const calculatedArea = res.area
    let result = ''
    if (calculatedArea) {
        const unitThreshold = 1e5
        const divider = 1e6
        const precision = 5

        const value = calculatedArea < unitThreshold ? calculatedArea : calculatedArea / divider
        result += parseFloat(value.toPrecision(precision))
        if (calculatedArea < unitThreshold) {
            result += ' m'
        } else {
            result += ' km'
        }
    }
    return result
})
</script>

<template>
    <GeoadminTooltip
        :tooltip-content="t('area')"
        placement="right"
    >
        <div class="area-information-container d-flex align-items-center">
            <div class="rectangle" />
            <div class="area-information ps-2">
                <span
                    class="align-middle"
                    data-cy="feature-area-information"
                >
                    {{ humanReadableArea }}<sup>2</sup>
                </span>
            </div>
        </div>
    </GeoadminTooltip>
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
    @extend %clear-no-ios-long-press;
}
</style>
