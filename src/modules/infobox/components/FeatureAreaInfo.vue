<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Polygon } from 'ol/geom'
import { getLength } from 'ol/sphere'
import { computed, toRefs } from 'vue'

import EditableFeature from '@/api/features/EditableFeature.class'
import { round } from '@/utils/numberUtils'

const props = defineProps({
    feature: {
        type: EditableFeature,
        required: true,
    },
    hasDistance: {
        type: Boolean,
        default: false,
    },
    hasArea: {
        type: Boolean,
        default: false,
    },
})
const { feature, hasDistance, hasArea } = toRefs(props)

/**
 * OpenLayers polygons coordinates are in a triple array. The first array is the "ring", the second
 * is to hold the coordinates, which are in an array themselves. We don't have rings in this case,
 * so we need to create an ol geometry
 *
 * @type {ComputedRef<Polygon>}
 */
const geometry = computed(() => new Polygon([feature.value.coordinates]))
/** @type {ComputedRef<Number>} */
const length = computed(() => {
    const calculatedLength = getLength(geometry.value)
    let result = `${roundValueIfGreaterThan(calculatedLength, 100, 1000)}`
    if (calculatedLength > 100) {
        result += 'km'
    } else {
        result += 'm'
    }
    return result
})
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
    <div v-if="hasDistance">
        <font-awesome-icon :icon="['fa', 'arrows-alt-h']" />
        {{ length }}
    </div>
    <div v-if="hasArea">
        <font-awesome-icon :icon="['fa', 'arrows-up-down-left-right']" />
        {{ area }}
        <sup>2</sup>
    </div>
</template>
