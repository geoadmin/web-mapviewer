import { noModifierKeys, singleClick } from 'ol/events/condition'
import GeoJSON from 'ol/format/GeoJSON'
import ModifyInteraction from 'ol/interaction/Modify'
import { inject, onBeforeUnmount, onMounted } from 'vue'
import { useStore } from 'vuex'

import {
    extractOlFeatureCoordinates,
    extractOlFeatureGeodesicCoordinates,
} from '@/api/features/features.api'
import { DRAWING_HIT_TOLERANCE } from '@/config/map.config'
import { editingVertexStyleFunction } from '@/modules/drawing/lib/style'
import useSaveKmlOnChange from '@/modules/drawing/useKmlDataManagement.composable'
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

    onMounted(() => {
        modifyInteraction.on('modifystart', onModifyStart)
        modifyInteraction.on('modifyend', onModifyEnd)
        olMap.addInteraction(modifyInteraction)
    })
    onBeforeUnmount(() => {
        olMap.removeInteraction(modifyInteraction)
        modifyInteraction.un('modifyend', onModifyEnd)
        modifyInteraction.un('modifystart', onModifyStart)
    })

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
            store.dispatch('changeFeatureCoordinates', {
                feature: storeFeature,
                coordinates: extractOlFeatureCoordinates(feature),
                geodesicCoordinates: extractOlFeatureGeodesicCoordinates(feature),
                ...dispatcher,
            })
            store.dispatch('changeFeatureGeometry', {
                feature: storeFeature,
                geometry: new GeoJSON().writeGeometryObject(feature.getGeometry()),
            })
            olMap.getTarget().classList.remove(cursorGrabbingClass)
            debounceSaveDrawing()
        }
    }
}
