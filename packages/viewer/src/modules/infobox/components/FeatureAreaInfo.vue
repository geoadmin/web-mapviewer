<script setup lang="ts">
import { WGS84 } from '@swissgeo/coordinates'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed, type ComputedRef, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { computePolygonPerimeterArea } from '@/utils/geodesicManager'
import { reprojectGeoJsonGeometry } from '@/utils/geoJsonUtils'
import usePositionStore from '@/store/modules/position.store'
import type { Geometry, Polygon } from 'geojson'

const { geometry } = defineProps({
    geometry: {
        type: Object as PropType<Geometry>,
        required: true,
    },
})

const { t } = useI18n()

const positionStore = usePositionStore()
const { projection } = storeToRefs(positionStore)

const geometryWgs84 = computed<Geometry>(() => {
    if (projection.value === WGS84) {
        return geometry
    }
    return reprojectGeoJsonGeometry(geometry!, WGS84, projection.value)
})

const humanReadableArea: ComputedRef<string> = computed(() => {
    const coords = (geometryWgs84.value as Polygon).coordinates[0]
    let result = ''
    if (!coords || coords?.length < 2) {
        return result
    }
    const res = computePolygonPerimeterArea(coords)
    if (!res || !('area' in res)) {
        return result
    }
    const calculatedArea = res.area as number
    if (calculatedArea) {
        const unitThreshold = 1e5
        const divider = 1e6
        const precision = 5

        const value = calculatedArea < unitThreshold ? calculatedArea : calculatedArea / divider
        result += parseFloat(value.toPrecision(precision)).toString()
        result += calculatedArea < unitThreshold ? ' m' : ' km'
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
