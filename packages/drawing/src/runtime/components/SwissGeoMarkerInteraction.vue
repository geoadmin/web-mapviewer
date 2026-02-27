<script setup lang="ts">
import type { DrawingInteractionExposed } from '~/types/interactions'
import type { SimpleGeometry } from 'ol/geom'

import { featureStyleUtils } from '@swissgeo/api/utils'
import { DEFAULT_ICON_SET_NAME } from '@swissgeo/staging-config/constants'
import { useDrawingModeInteraction, useDrawingStore } from '#imports'
import Feature from 'ol/Feature'

const emits = defineEmits<{
    drawEnd: [feature: Feature<SimpleGeometry>]
}>()

const drawingStore = useDrawingStore()

useDrawingModeInteraction({
    editableFeatureArgs: {
        featureType: 'MARKER',
        icon: drawingStore.iconSets.find((set) => set.name === DEFAULT_ICON_SET_NAME)?.icons[0],
        iconSize: drawingStore.edit.preferred.size,
        fillColor: drawingStore.edit.preferred.color,
        textPlacement: drawingStore.edit.preferred.textPlacement,
        textSize: drawingStore.edit.preferred.size,
        textOffset: featureStyleUtils.DEFAULT_MARKER_TITLE_OFFSET,
    },
    drawEndCallback: (feature: Feature<SimpleGeometry>): void => {
        emits('drawEnd', feature)
    },
})

defineExpose<DrawingInteractionExposed>({
    removeLastPoint: () => {},
})
</script>

<template>
    <slot />
</template>
