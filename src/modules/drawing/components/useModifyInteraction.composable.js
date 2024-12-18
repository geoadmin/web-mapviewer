import { noModifierKeys, primaryAction, singleClick } from 'ol/events/condition'
import GeoJSON from 'ol/format/GeoJSON'
import { LineString, Polygon } from 'ol/geom'
import DrawInteraction from 'ol/interaction/Draw'
import ModifyInteraction from 'ol/interaction/Modify'
import SnapInteraction from 'ol/interaction/Snap'
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import {
    extractOlFeatureCoordinates,
    extractOlFeatureGeodesicCoordinates,
} from '@/api/features/features.api'
import { DRAWING_HIT_TOLERANCE } from '@/config/map.config'
import { drawLineStyle, editingVertexStyleFunction } from '@/modules/drawing/lib/style'
import useSaveKmlOnChange from '@/modules/drawing/useKmlDataManagement.composable'
import { EditMode } from '@/store/modules/drawing.store'
import { wrapXCoordinates } from '@/utils/coordinates/coordinateUtils'
import { GeodesicGeometries, segmentExtent, subsegments } from '@/utils/geodesicManager'

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
    const counterLinePolyPoints = ref(0)
    const isSnappingOnFirstPoint = ref(false)
    const store = useStore()

    const editMode = computed(() => store.state.drawing.editingMode)
    const projection = computed(() => store.state.position.projection)
    const reverseLineStringExtension = computed(
        () => store.state.drawing.reverseLineStringExtension
    )

    const drawingLayer = inject('drawingLayer')
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

    const continueDrawingInteraction = new DrawInteraction({
        style: drawLineStyle,
        type: 'Polygon',
        minPoints: 2,
        stopClick: true,
        // only left-click to draw (primaryAction)
        condition: (e) => primaryAction(e),
        wrapX: true,
    })
    const snapInteraction = new SnapInteraction({
        source: drawingLayer.getSource(),
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
                // continueDrawingInteraction.extend(selectedFeature)
                continueDrawingInteraction.appendCoordinates(
                    selectedFeature.getGeometry().getCoordinates()
                )
                continueDrawingInteraction.setActive(true)
                modifyInteraction.setActive(false)
            } else if (newValue === EditMode.MODIFY) {
                modifyInteraction.setActive(true)
                continueDrawingInteraction.setActive(false)
            } else {
                modifyInteraction.setActive(true)
                continueDrawingInteraction.setActive(false)
            }
        },
        { immediate: true }
    )

    onMounted(() => {
        modifyInteraction.on('modifystart', onModifyStart)
        modifyInteraction.on('modifyend', onModifyEnd)

        olMap.addInteraction(modifyInteraction)
        olMap.addInteraction(continueDrawingInteraction)

        continueDrawingInteraction.on('drawstart', onExtendStart)
        continueDrawingInteraction.on('drawstart', onDrawStartResetPointCounter)
        continueDrawingInteraction.on('drawend', onExtendEnd)
        continueDrawingInteraction.getOverlay().getSource().on('addfeature', checkIfSnapping)

        continueDrawingInteraction.setActive(false)

        olMap.addInteraction(snapInteraction)
    })
    onBeforeUnmount(() => {
        store.dispatch('setEditingMode', { mode: EditMode.OFF, ...dispatcher })

        olMap.removeInteraction(modifyInteraction)
        olMap.removeInteraction(continueDrawingInteraction)

        modifyInteraction.un('modifyend', onModifyEnd)
        modifyInteraction.un('modifystart', onModifyStart)

        continueDrawingInteraction.un('drawstart', onExtendStart)
        continueDrawingInteraction.un('drawstart', onDrawStartResetPointCounter)
        continueDrawingInteraction.un('drawend', onExtendEnd)
        continueDrawingInteraction.getOverlay().getSource().un('addfeature', checkIfSnapping)

        olMap.removeInteraction(snapInteraction)
    })

    function onDrawStartResetPointCounter() {
        counterLinePolyPoints.value = 0
    }

    function removeLastPoint() {
        if (editMode.value === EditMode.OFF) {
            return
        }
        if (continueDrawingInteraction.getActive()) {
            continueDrawingInteraction.removeLastPoint()
        } else if (modifyInteraction.getActive() && features.getArray().length > 0) {
            const feature = features.getArray()[0]
            const geometry = feature.getGeometry()
            const coordinates = geometry.getCoordinates()
            if (coordinates.length > 2) {
                // Keep at least 2 points
                coordinates.pop()
                geometry.setCoordinates(coordinates)
            }
            // Updating the store feature
            updateStoreFeatureCoordinatesGeometry(feature)
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
            updateStoreFeatureCoordinatesGeometry(feature)
            olMap.getTarget().classList.remove(cursorGrabbingClass)
            debounceSaveDrawing()
        }
    }

    function onExtendStart(event) {
        // TODO(IS): copied from useDrawingModeInteraction.composable.js
        const feature = event.feature
        feature.set('geodesic', new GeodesicGeometries(feature, projection.value))
        // we set a flag telling that this feature is currently being drawn (for the first time, not edited)
        feature.set('isDrawing', true)
    }

    /**
     * As OL thinks it is drawing a polygon, it will always add the first point as the last, even if
     * not finished, so we remove it before performing our checks
     */
    function getFeatureCoordinatesWithoutExtraPoint(feature) {
        if (Array.isArray(feature.getGeometry().getCoordinates()[0])) {
            return feature.getGeometry().getCoordinates()[0].slice(0, -1)
        }
        return feature.getGeometry().getCoordinates()
    }

    function onExtendEnd(event) {
        const drawnFeature = event.feature

        drawnFeature.setId(features.getArray()[0].getId())
        drawnFeature.set('isDrawing', false)

        const [selectedFeature] = features.getArray()

        // Update the selected feature with the new geometry
        // TODO(IS): taken from useDrawingModeInteraction.composable.js
        const coordinates = getFeatureCoordinatesWithoutExtraPoint(drawnFeature)
        if (!isSnappingOnFirstPoint.value && coordinates.length > 1) {
            // if not the same ending point, it is not a polygon (the user didn't finish drawing by closing it)
            // so we transform the drawn polygon into a linestring
            drawnFeature.setGeometry(new LineString(coordinates))
        }
        /* Normalize the coordinates, as the modify interaction is configured to operate only
        between -180 and 180 deg (so that the features can be modified even if the view is of
        by 360deg) */
        const geometry = drawnFeature.getGeometry()
        const normalizedCoords = wrapXCoordinates(geometry.getCoordinates(), projection.value, true)
        geometry.setCoordinates(normalizedCoords)

        selectedFeature.setGeometry(drawnFeature.getGeometry())

        // Update the selected feature with new coordinates
        if (selectedFeature) {
            updateStoreFeatureCoordinatesGeometry(selectedFeature, reverseLineStringExtension.value)
            store.dispatch('setEditingMode', { mode: EditMode.MODIFY, ...dispatcher })
            debounceSaveDrawing()
        }
    }

    // Update the store feature with the new coordinates and geometry
    function updateStoreFeatureCoordinatesGeometry(feature, reverse = false) {
        const storeFeature = feature.get('editableFeature')
        if (reverse) {
            feature.getGeometry().setCoordinates(feature.getGeometry().getCoordinates().reverse())
        }
        store.dispatch('changeFeatureCoordinates', {
            feature: storeFeature,
            coordinates: extractOlFeatureCoordinates(feature),
            geodesicCoordinates: extractOlFeatureGeodesicCoordinates(feature),
            ...dispatcher,
        })
        store.dispatch('changeFeatureGeometry', {
            feature: storeFeature,
            geometry: new GeoJSON().writeGeometryObject(feature.getGeometry()),
            ...dispatcher,
        })
    }

    // TODO(IS): copied from useDrawingModeInteraction.composable.js
    function checkIfSnapping(event) {
        const feature = event.feature
        // only checking if the geom is a polygon (it as more than one point)
        if (feature.getGeometry() instanceof Polygon) {
            const lineCoords = getFeatureCoordinatesWithoutExtraPoint(feature)
            // if point count isn't the same, we update it
            if (counterLinePolyPoints.value !== lineCoords.length) {
                // A point is added or removed, updating sketch points counter
                counterLinePolyPoints.value = lineCoords.length
            } else if (lineCoords.length > 1) {
                const firstPoint = lineCoords[0]
                const lastPoint = lineCoords[lineCoords.length - 1]
                const sketchPoint = lineCoords[lineCoords.length - 2]

                // Checks is snapped to first point of geom
                const isSnapOnFirstPoint =
                    lastPoint[0] === firstPoint[0] && lastPoint[1] === firstPoint[1]

                // Checks is snapped to last point of geom
                const isSnapOnLastPoint =
                    lastPoint[0] === sketchPoint[0] && lastPoint[1] === sketchPoint[1]

                isSnappingOnFirstPoint.value = !isSnapOnLastPoint && isSnapOnFirstPoint
            }
        }
    }

    return {
        removeLastPoint,
    }
}
