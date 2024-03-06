<script setup>
import { Polygon } from 'ol/geom'
import { computed, toRefs } from 'vue'

import EditableFeature from '@/api/features/EditableFeature.class'
import { round } from '@/utils/numberUtils'

const props = defineProps({
    feature: {
        type: EditableFeature,
        required: true,
    },
})
const { feature } = toRefs(props)
const geometry = computed(() => new Polygon([feature.value.coordinates]))

/** @type {ComputedRef<Number>} */
const area = computed(() => {
    const calculatedArea = geometry.value.getArea()
    let result = ''
    if (calculatedArea) {
        result += roundValueIfGreaterThan(calculatedArea, 1000, 100000)
        if (calculatedArea > 10000) {
            result += 'km'
        } else {
            result += 'm'
        }
    }
    return result
})

function roundValueIfGreaterThan(value, threshold, divider) {
    if (value > threshold) {
        return `${round(value / divider, 2)}`
    }
    return `${round(value, 2)}`
}
</script>

<template>
    <div :title="$t('area')" class="d-flex align-items-center">
        <div class="rectangle"></div>
        <div class="area-information ps-2" data-cy="feature-area-information">
            {{ area }}
            <sup>2</sup>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.rectangle {
    height: 1rem;
    width: 1.5rem;
    border: 2px solid black;
    background-color: #999;
}
.area-information {
    @extend .clear-no-ios-long-press;
}
</style>
