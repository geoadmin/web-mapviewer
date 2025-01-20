import { noModifierKeys, singleClick } from 'ol/events/condition'
import ModifyInteraction from 'ol/interaction/Modify'
import { computed, inject, onBeforeUnmount, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

import { DRAWING_HIT_TOLERANCE } from '@/config/map.config'
import { updateStoreFeatureCoordinatesGeometry } from '@/modules/drawing/lib/drawingUtils'
import { editingVertexStyleFunction } from '@/modules/drawing/lib/style'
import useSaveKmlOnChange from '@/modules/drawing/useKmlDataManagement.composable'
import { EditMode } from '@/store/modules/drawing.store'
import { segmentExtent, subsegments } from '@/utils/geodesicManager'

const dispatcher = { dispatcher: 'useModifyInteraction.composable' }
const cursorGrabbingClass = 'cursor-grabbing'

/**
 * Will enable the user to edit selected features by drag and dropping part of it on the map. Will
 * also enable point deletion with a right click.
 *
 * This component needs to have access to the selected features from the select interaction (it gets
 * them through a prop coupling)
 */
export default function useModifyInteraction(features) {
    const store = useStore()

    const editMode = computed(() => store.state.drawing.editingMode)
    const reverseLineStringExtension = computed(
        () => store.state.drawing.reverseLineStringExtension
    )

    const olMap = inject('olMap')
    const { willModify, debounceSaveDrawing } = useSaveKmlOnChange()

    const modifyInteraction = new ModifyInteraction({
        features,
        style: editingVertexStyleFunction,
        deleteCondition: (event) => noModifierKeys(event) && singleClick(event),
        // This seems to be calculated differently than the hitTolerance properties of
        // SelectInteraction and forEachFeatureAtPixel. That's why we have to manually correct the
        // value here.
        pixelTolerance: DRAWING_HIT_TOLERANCE + 2,
        // Pass these callbacks to inform the modifyInteraction about the correct geometry of each
        // line segment. By default, the modifyInteraction assumes straight segments, but our
        // segments are curved as they follow the geodesic.
        segmentExtentFunction: segmentExtent,
        subsegmentsFunction: subsegments,
        // "pointerWrapX" tells OpenLayers if, e.g., the user clicks or hovers a point at 370deg,
        // it should be considered as if the user hovered or clicked at 10deg.
        pointerWrapX: true,
        // OpenLayers has no limit on the longitude, so if you are at 10deg and turn one time around
        // the earth, you will land at 370deg etc...
        // "wrapX" tells OpenLayers to use a normalized view extent to decide which features to
        // display. So if, e.g., your view is [370, 380] of longitude, objects drawn at [370,380]
        // will not be shown. Instead, objects drawn at [10,20] will be shown.
        wrapX: true,
    })

    watch(
        editMode,
        (newValue) => {
            if (newValue === EditMode.EXTEND && features.getArray().length > 0) {
                const selectedFeature = features.getArray()[0]
                if (reverseLineStringExtension.value) {
                    selectedFeature
                        .getGeometry()
                        .setCoordinates(selectedFeature.getGeometry().getCoordinates().reverse())
                }

                modifyInteraction.setActive(false)
            } else if (newValue === EditMode.MODIFY) {
                modifyInteraction.setActive(true)
            } else {
                modifyInteraction.setActive(true)
            }
        },
        { immediate: true }
    )

    onMounted(() => {
        modifyInteraction.on('modifystart', onModifyStart)
        modifyInteraction.on('modifyend', onModifyEnd)

        olMap.addInteraction(modifyInteraction)
    })
    onBeforeUnmount(() => {
        store.dispatch('setEditingMode', { mode: EditMode.OFF, ...dispatcher })

        olMap.removeInteraction(modifyInteraction)

        modifyInteraction.un('modifyend', onModifyEnd)
        modifyInteraction.un('modifystart', onModifyStart)
    })

    function removeLastPoint() {
        if (editMode.value === EditMode.OFF) {
            return
        }

        if (modifyInteraction.getActive() && features.getArray().length > 0) {
            const feature = features.getArray()[0]
            const geometry = feature.getGeometry()
            const coordinates = geometry.getCoordinates()
            if (coordinates.length > 2) {
                // Keep at least 2 points
                coordinates.pop()
                geometry.setCoordinates(coordinates)
            }
            // Updating the store feature
            updateStoreFeatureCoordinatesGeometry(store, feature, dispatcher)
        }
    }

    function onModifyStart(event) {
        const [feature] = event.features.getArray()

        if (feature) {
            store.dispatch('changeFeatureIsDragged', {
                feature: feature.get('editableFeature'),
                isDragged: true,
                ...dispatcher,
            })
            olMap.getTarget().classList.add(cursorGrabbingClass)
            willModify()
        }
    }
    function onModifyEnd(event) {
        if (!event.features) {
            return
        }

        const [feature] = event.features.getArray()

        if (feature) {
            const storeFeature = feature.get('editableFeature')
            store.dispatch('changeFeatureIsDragged', {
                feature: storeFeature,
                isDragged: false,
                ...dispatcher,
            })
            updateStoreFeatureCoordinatesGeometry(store, feature, dispatcher)
            olMap.getTarget().classList.remove(cursorGrabbingClass)
            debounceSaveDrawing()
        }
    }

    return {
        removeLastPoint,
    }
}
