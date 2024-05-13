<script setup>
/**
 * Shows a popover on the map at the given position (coordinates) and with the slot as the content
 * of the popover
 */

import { inject, onMounted, onUnmounted, ref, toRefs, watch } from 'vue'

import MapPopover, { MapPopoverMode } from '@/modules/map/components/MapPopover.vue'

const props = defineProps({
    coordinates: {
        type: Array,
        required: true,
    },
    authorizePrint: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: '',
    },
    useContentPadding: {
        type: Boolean,
        default: false,
    },
    mode: {
        type: String,
        default: MapPopoverMode.FLOATING,
        validator: (value) => Object.values(MapPopoverMode).includes(value),
    },
})
const { coordinates, authorizePrint, title, useContentPadding } = toRefs(props)

const anchorPosition = ref({ top: 0, left: 0 })
const popoverAnchor = ref(null)

const olMap = inject('olMap')

watch(coordinates, getPixelForCoordinateFromMap)

onMounted(() => {
    getPixelForCoordinateFromMap()
    olMap.on('postrender', getPixelForCoordinateFromMap)
})
onUnmounted(() => {
    olMap.un('postrender', getPixelForCoordinateFromMap)
})

function getPixelForCoordinateFromMap() {
    const computedPixel = olMap.getPixelFromCoordinate(coordinates.value)
    // when switching back from Cesium (or any other map framework), there can be a very small
    // period where the map isn't yet able to process a pixel, this if is there to defend against that
    if (computedPixel) {
        const [left, top] = computedPixel
        anchorPosition.value.left = left - popoverAnchor.value.$el.clientWidth / 2
        // adding 15px to the top so that the tip of the arrow of the tooltip is on the edge
        // of the highlighting circle of the selected feature
        anchorPosition.value.top = top + 15
    }
}
</script>

<template>
    <MapPopover
        ref="popoverAnchor"
        :authorize-print="authorizePrint"
        :title="title"
        :use-content-padding="useContentPadding"
        :anchor-position="anchorPosition"
        :mode="mode"
    >
        <template #extra-buttons>
            <slot name="extra-buttons" />
        </template>
        <slot />
    </MapPopover>
</template>
