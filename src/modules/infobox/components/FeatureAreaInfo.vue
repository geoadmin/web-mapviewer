<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Polygon } from 'ol/geom'
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
    <div :title="$t('area')">
        <div v-if="hasArea">
            <font-awesome-icon :icon="['fa', 'arrows-up-down-left-right']" />
            {{ area }}
            <sup>2</sup>
        </div>
    </div>
</template>
