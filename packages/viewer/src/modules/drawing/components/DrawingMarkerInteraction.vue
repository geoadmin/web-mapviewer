<script setup lang="ts">
import type { SimpleGeometry } from 'ol/geom'

import Feature from 'ol/Feature'

import type { DrawingInteractionExposed } from '@/modules/drawing/types/interaction'

import { EditableFeatureTypes } from '@/api/features.api'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'
import useDrawingStore from '@/store/modules/drawing'
import { DEFAULT_MARKER_TITLE_OFFSET } from '@/utils/featureStyleUtils'

const emits = defineEmits<{
    drawEnd: [feature: Feature<SimpleGeometry>]
}>()

const drawingStore = useDrawingStore()

useDrawingModeInteraction({
    editableFeatureArgs: {
        icon: drawingStore.iconSets.find((set) => set.name === 'default')?.icons[0],
        featureType: EditableFeatureTypes.Marker,
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
