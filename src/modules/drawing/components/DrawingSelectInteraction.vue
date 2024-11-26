<script setup>
/**
 * Manages the selection of features on the drawing layer. Shares also which features are selected
 * (as OpenLayers objects) with the modifyInteraction. It will also update the selected feature
 * (style, color, etc...) whenever it is edited through the popover.
 */

import SelectInteraction from 'ol/interaction/Select'
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { DRAWING_HIT_TOLERANCE } from '@/config/map.config'
import useModifyInteraction from '@/modules/drawing/components/useModifyInteraction.composable'
import { editingFeatureStyleFunction } from '@/modules/drawing/lib/style'
import useSaveKmlOnChange from '@/modules/drawing/useKmlDataManagement.composable'

const dispatcher = { dispatcher: 'DrawingSelectInteraction.vue' }

const drawingLayer = inject('drawingLayer')
const olMap = inject('olMap')

const store = useStore()
const { debounceSaveDrawing } = useSaveKmlOnChange()
const selectInteraction = new SelectInteraction({
    style: editingFeatureStyleFunction,
    toggleCondition: () => false,
    layers: [drawingLayer],
    // As we've seen with the old viewer, some small features were hard
    // to select. We will try to add a bigger hit tolerance to mitigate that.
    hitTolerance: DRAWING_HIT_TOLERANCE,
})
const { removeLastPoint } = useModifyInteraction(selectInteraction.getFeatures())

/** OpenLayers feature currently selected */
const currentlySelectedFeature = ref(null)
const selectedFeatures = computed(() => store.getters.selectedFeatures)

watch(selectedFeatures, (newSelectedFeatures) => {
    /* If the store doesn't contain any more feature, we clear our local variable on that topic
       This makes it possible for other modules to call clearAllSelectedFeatures()
       Other modules cannot however call setSelectedFeatures() from the store, as we cannot
       infer the OlFeature from the store feature. They instead have to call the exposed
       selectFeature() function from this module. */
    if (!newSelectedFeatures || newSelectedFeatures.length === 0) {
        selectInteraction.getFeatures().clear()
        currentlySelectedFeature.value = null
    }
})
watch(currentlySelectedFeature, (newFeature, oldFeature) => {
    if (newFeature && newFeature.get('editableFeature')) {
        const editableFeature = newFeature.get('editableFeature')
        editableFeature.setCoordinatesFromFeature(newFeature)
        // binding store feature change events to our handlers
        // so that we can update the style of the OL features as soon
        // as the store feature is edited
        editableFeature.on('change:style', onFeatureChange)
        store.dispatch('setSelectedFeatures', { features: [editableFeature], ...dispatcher })
        if (
            [EditableFeatureTypes.MEASURE, EditableFeatureTypes.LINEPOLYGON].includes(
                editableFeature.featureType
            )
        ) {
            store.dispatch('setProfileFeature', { feature: editableFeature, ...dispatcher })
        }
    } else {
        store.dispatch('clearAllSelectedFeatures', dispatcher)
    }
    if (oldFeature && oldFeature.get('editableFeature')) {
        // editableFeature was removed from the state just before, so we can edit it directly again.
        oldFeature.get('editableFeature').removeListener('change:style', onFeatureChange)
    }
})

onMounted(() => {
    selectInteraction.setActive(true)
    selectInteraction.on('select', onSelectChange)
    olMap.addInteraction(selectInteraction)
})
onBeforeUnmount(() => {
    olMap.removeInteraction(selectInteraction)
    selectInteraction.un('select', onSelectChange)
    selectInteraction.setActive(false)
})

/** Change the selected feature by user input. */
function onSelectChange(event) {
    // The select event lists the changes in two arrays: selected, deselected
    // As we only allow for one feature to be selected at a time this event
    // will always yield one item in either of the arrays.
    if (event.selected.length > 0) {
        currentlySelectedFeature.value = event.selected[0]
    } else {
        currentlySelectedFeature.value = null
    }
}
function onFeatureChange(editableFeature) {
    // The title and description of an editable feature are only set in the editable feature
    // however in the KML standard they should be set in the name and description tags.
    // To do this we need to set them on the ol feature as properties.
    currentlySelectedFeature.value?.set('name', editableFeature.title)
    currentlySelectedFeature.value?.set('description', editableFeature.description)
    if (editableFeature.featureType === EditableFeatureTypes.MARKER) {
        currentlySelectedFeature.value?.set('textOffset', editableFeature.textOffset.toString())
    }
    currentlySelectedFeature.value?.changed()
    debounceSaveDrawing()
}
function selectFeature(feature) {
    selectInteraction.getFeatures().clear()
    if (feature) {
        selectInteraction.getFeatures().push(feature)
    }
    currentlySelectedFeature.value = feature
}

defineExpose({
    selectFeature,
    removeLastPoint,
})
</script>

<template>
    <slot />
</template>
