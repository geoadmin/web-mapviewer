<script setup lang="ts">
import Feature from 'ol/Feature'
import type { SimpleGeometry } from 'ol/geom'

import { EditableFeatureTypes } from '@/api/features.api'
import { DEFAULT_MARKER_TITLE_OFFSET } from '@/api/icon.api'
import useDrawingModeInteraction from '@/modules/drawing/components/useDrawingModeInteraction.composable'
import useDrawingStore from '@/store/modules/drawing.store'

type EmitType = {
    (_e: 'drawEnd', _feature: Feature<SimpleGeometry>): void
}
const emits = defineEmits<EmitType>()

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
</script>

<template>
    <slot />
</template>
