<script setup lang="ts">
/**
 * Manages the selection of features on the drawing layer. Shares also which features are selected
 * (as OpenLayers objects) with the modifyInteraction. It will also update the selected feature
 * (style, color, etc...) whenever it is edited through the popover.
 */

import SelectInteraction, { SelectEvent } from 'ol/interaction/Select'
import { computed, inject, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type Feature from 'ol/Feature'
import type VectorLayer from 'ol/layer/Vector'

import log from '@swissgeo/log'
import { EditableFeatureTypes, type EditableFeature, type StoreFeature } from '@/api/features.api'
import { DRAWING_HIT_TOLERANCE } from '@/config/map.config'
import useModifyInteraction from '@/modules/drawing/components/useModifyInteraction.composable'
import { editingFeatureStyleFunction } from '@/modules/drawing/lib/style'
import useSaveKmlOnChange from '@/modules/drawing/useKmlDataManagement.composable'
import { extractOlFeatureCoordinates } from '@/api/features.api'
import useFeaturesStore from '@/store/modules/features'
import useProfileStore from '@/store/modules/profile'
import useUIStore from '@/store/modules/ui'
import type { ActionDispatcher } from '@/store/types'
import type Map from 'ol/Map'
import type { StyleFunction } from 'ol/style/Style'

type EmitType = {
    (_e: 'feature-selected', _feature: Feature | undefined): void
}
const emits = defineEmits<EmitType>()
const dispatcher: ActionDispatcher = { name: 'DrawingSelectInteraction.vue' }

const drawingLayer = inject<VectorLayer>('drawingLayer')
const olMap = inject<Map>('olMap')

const { debounceSaveDrawing } = useSaveKmlOnChange()
const selectInteraction = new SelectInteraction({
    style: editingFeatureStyleFunction as StyleFunction,
    toggleCondition: () => false,
    layers: drawingLayer ? [drawingLayer] : undefined,
    // As we've seen with the old viewer, some small features were hard
    // to select. We will try to add a bigger hit tolerance to mitigate that.
    hitTolerance: DRAWING_HIT_TOLERANCE,
})
const { removeLastPoint } = useModifyInteraction(selectInteraction.getFeatures())

/** OpenLayers feature currently selected */
const currentlySelectedFeature: Ref<Feature | undefined> = ref()
const featuresStore = useFeaturesStore()
const uiStore = useUIStore()
const profileStore = useProfileStore()
const selectedFeatures = computed(() => featuresStore.selectedFeatures)
const showFeatureInfoInBottomPanel = computed(() => uiStore.showFeatureInfoInBottomPanel)

watch(selectedFeatures, (newSelectedFeatures: StoreFeature[]) => {
    /* If the store doesn't contain any more feature, we clear our local variable on that topic
       This makes it possible for other modules to call clearAllSelectedFeatures()
       Other modules cannot however call setSelectedFeatures() from the store, as we cannot
       infer the OlFeature from the store feature. They instead have to call the exposed
       selectFeature() function from this module. */
    if (!newSelectedFeatures || newSelectedFeatures.length === 0) {
        selectInteraction.getFeatures().clear()
        currentlySelectedFeature.value = undefined
    }
})
watch(currentlySelectedFeature, (newFeature, oldFeature) => {
    if (newFeature && newFeature.get('editableFeature')) {
        const editableFeature = newFeature.get('editableFeature')
        editableFeature.coordinates = extractOlFeatureCoordinates(newFeature)
        // binding store feature change events to our handlers
        // so that we can update the style of the OL features as soon
        // as the store feature is edited
        editableFeature.on('change:style', onFeatureChange)
        featuresStore.setSelectedFeatures([editableFeature], dispatcher)
        if (
            [EditableFeatureTypes.Measure, EditableFeatureTypes.LinePolygon].includes(
                editableFeature.featureType
            ) &&
            // only showing profile if the edit feature is done while floating
            !showFeatureInfoInBottomPanel.value
        ) {
            profileStore.setProfileFeature(editableFeature, dispatcher)
        }
    } else {
        featuresStore.clearAllSelectedFeatures(dispatcher)
    }
    if (oldFeature && oldFeature.get('editableFeature')) {
        // editableFeature was removed from the state just before, so we can edit it directly again.
        oldFeature.get('editableFeature').removeListener('change:style', onFeatureChange)
    }
})

watch(currentlySelectedFeature, (newFeature: Feature | undefined) => {
    emits('feature-selected', newFeature)
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
        currentlySelectedFeature.value = event.selected[0]
    } else {
        currentlySelectedFeature.value = undefined
    }
}

function onFeatureChange(editableFeature: EditableFeature) {
    // The title and description of an editable feature are only set in the editable feature
    // however in the KML standard they should be set in the name and description tags.
    // To do this we need to set them on the ol feature as properties.
    currentlySelectedFeature.value?.set('name', editableFeature.title)
    currentlySelectedFeature.value?.set('description', editableFeature.description)
    if (editableFeature.featureType === EditableFeatureTypes.Marker) {
        currentlySelectedFeature.value?.set('textOffset', editableFeature.textOffset.toString())
        currentlySelectedFeature.value?.set(
            'showDescriptionOnMap',
            editableFeature.showDescriptionOnMap
        )
    }
    currentlySelectedFeature.value?.changed()
    debounceSaveDrawing().catch((error: Error) =>
        log.error(`Error while saving drawing after feature change: ${error}`)
    )
}
function selectFeature(feature: Feature | undefined) {
    selectInteraction.getFeatures().clear()
    if (feature) {
        selectInteraction.getFeatures().push(feature)
    }
    currentlySelectedFeature.value = feature
}
function setActive(active: boolean) {
    selectInteraction.setActive(active)
}

defineExpose({
    selectFeature,
    removeLastPoint,
    setActive,
})
</script>

<template>
    <slot />
</template>
