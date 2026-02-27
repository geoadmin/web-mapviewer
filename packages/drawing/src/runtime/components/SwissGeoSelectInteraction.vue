<script setup lang="ts">
/**
 * Manages the selection of features on the drawing layer. Shares also which features are selected
 * (as OpenLayers objects) with the modifyInteraction. It will also update the selected feature
 * (style, color, etc...) whenever it is edited through the popover.
 */

import type { EditableFeature } from '@swissgeo/api'
import type { ActionDispatcher } from '~/types/drawingStore'
import type { SelectInteractionExposed } from '~/types/interactions'
import type Feature from 'ol/Feature'
import type { StyleFunction } from 'ol/style/Style'
import type { ShallowRef } from 'vue'

import { featuresAPI } from '@swissgeo/api'
import { DRAWING_HIT_TOLERANCE } from '@swissgeo/staging-config/constants'
import { editingFeatureStyleFunction, useDrawingStore, useModifyInteraction } from '#imports'
import SelectInteraction, { SelectEvent } from 'ol/interaction/Select'
import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'

const dispatcher: ActionDispatcher = { name: 'DrawingSelectInteraction.vue' }

const emits = defineEmits<{
    'feature-selected': [Feature | undefined]
}>()

const drawingStore = useDrawingStore()
const olMap = drawingStore.olMap

const selectInteraction = new SelectInteraction({
    style: editingFeatureStyleFunction as StyleFunction,
    toggleCondition: () => false,
    layers: drawingStore.layer.ol ? [drawingStore.layer.ol] : undefined,
    // As we've seen with the old viewer, some small features were hard
    // to select. We will try to add a bigger hit tolerance to mitigate that.
    hitTolerance: DRAWING_HIT_TOLERANCE,
})
const { removeLastPoint } = useModifyInteraction(selectInteraction.getFeatures())

/** OpenLayers feature currently selected */
const currentlySelectedOlFeature: ShallowRef<Feature | undefined> = shallowRef()

watch(
    () => drawingStore.feature.current,
    () => {
        if (!drawingStore.feature.current) {
            selectInteraction.getFeatures().clear()
            currentlySelectedOlFeature.value = undefined
        } else if (currentlySelectedOlFeature.value) {
            onFeatureChange(drawingStore.feature.current)
        }
    },
    {
        deep: true,
    }
)
watch(currentlySelectedOlFeature, (newFeature) => {
    emits('feature-selected', newFeature)
    if (newFeature && newFeature.get('editableFeature')) {
        const editableFeature = newFeature.get('editableFeature') as EditableFeature | undefined
        if (editableFeature) {
            editableFeature.coordinates = featuresAPI.extractOlFeatureCoordinates(newFeature)
            drawingStore.setCurrentlyDrawnFeature(editableFeature, dispatcher)
        }
    } else {
        drawingStore.setCurrentlyDrawnFeature(undefined, dispatcher)
    }
})

onMounted(() => {
    selectInteraction.setActive(true)
    selectInteraction.on('select', onSelectChange)
    olMap?.addInteraction(selectInteraction)
})
onBeforeUnmount(() => {
    olMap?.removeInteraction(selectInteraction)
    selectInteraction.un('select', onSelectChange)
    selectInteraction.setActive(false)
})

/** Change the selected feature by user input. */
function onSelectChange(event: SelectEvent) {
    // The select event lists the changes in two arrays: selected, deselected
    // As we only allow for one feature to be selected at a time this event
    // will always yield one item in either of the arrays.
    if (event.selected.length > 0) {
        currentlySelectedOlFeature.value = event.selected[0]
    } else {
        currentlySelectedOlFeature.value = undefined
    }
}

function onFeatureChange(editableFeature: EditableFeature) {
    // The title and description of an editable feature are only set in the editable feature
    // however in the KML standard they should be set in the name and description tags.
    // To do this we need to set them on the ol feature as properties.
    currentlySelectedOlFeature.value?.set('name', editableFeature.title)
    currentlySelectedOlFeature.value?.set('description', editableFeature.description)
    if (editableFeature.featureType === 'MARKER') {
        currentlySelectedOlFeature.value?.set('textOffset', editableFeature.textOffset.toString())
        currentlySelectedOlFeature.value?.set(
            'showDescriptionOnMap',
            editableFeature.showDescriptionOnMap
        )
    }
    currentlySelectedOlFeature.value?.changed()
}

function selectFeature(feature: Feature | undefined) {
    selectInteraction.getFeatures().clear()
    if (feature) {
        selectInteraction.getFeatures().push(feature)
    }
    currentlySelectedOlFeature.value = feature
}
function setActive(active: boolean) {
    selectInteraction.setActive(active)
}

defineExpose<SelectInteractionExposed>({
    selectFeature,
    removeLastPoint,
    setActive,
})
</script>

<template>
    <slot />
</template>
