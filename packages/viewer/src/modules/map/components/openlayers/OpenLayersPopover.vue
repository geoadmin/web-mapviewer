<script setup lang="ts">
/**
 * Shows a popover on the map at the given position (coordinates) and with the slot as the content
 * of the popover
 */

import type { Map } from 'ol'
import type { SingleCoordinate } from '@swissgeo/coordinates'
import { inject, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

import MapPopover, { MapPopoverMode } from '@/modules/map/components/MapPopover.vue'

interface Props {
    coordinates?: SingleCoordinate
    authorizePrint?: boolean
    title?: string
    useContentPadding?: boolean
    mode?: MapPopoverMode
}

const props = withDefaults(defineProps<Props>(), {
    coordinates: undefined,
    authorizePrint: false,
    title: '',
    useContentPadding: false,
    mode: MapPopoverMode.FLOATING,
})

const anchorPosition = ref({ top: 0, left: 0 })
const popoverAnchor = useTemplateRef<InstanceType<typeof MapPopover>>('popoverAnchor')

const olMap = inject<Map>('olMap')!

watch(() => props.coordinates, calculateAnchorPosition)

onMounted(() => {
    calculateAnchorPosition()
    olMap.on('postrender', calculateAnchorPosition)
})
onUnmounted(() => {
    olMap.un('postrender', calculateAnchorPosition)
})

function calculateAnchorPosition(): void {
    if (!props.coordinates) {
        return
    }
    const computedPixel = olMap.getPixelFromCoordinate(props.coordinates)
    // when switching back from Cesium (or any other map framework), there can be a very small
    // period where the map isn't yet able to process a pixel, this if is there to defend against that
    if (computedPixel && computedPixel.length >= 2) {
        const [left, top] = computedPixel
        const popoverEl = popoverAnchor.value?.$el as HTMLElement | undefined
        if (popoverEl && left !== undefined && top !== undefined) {
            anchorPosition.value.left = left - popoverEl.clientWidth / 2
            // adding 15px to the top so that the tip of the arrow of the tooltip is on the edge
            // of the highlighting circle of the selected feature
            anchorPosition.value.top = top + 15
        }
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
