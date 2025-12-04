<script setup lang="ts">
import type { SimpleGeometry } from 'ol/geom'

import Feature from 'ol/Feature'

import type { DrawingInteractionExposed } from '@/modules/drawing/types/interaction'

import { DEFAULT_ICON_SET_NAME } from '@/api/icons/config'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'
import useDrawingStore from '@/store/modules/drawing'
import { DEFAULT_MARKER_TITLE_OFFSET } from '@/utils/featureStyle'

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
        textOffset: DEFAULT_MARKER_TITLE_OFFSET,
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
