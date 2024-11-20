import { primaryAction } from 'ol/events/condition'
import GeoJSON from 'ol/format/GeoJSON'
import { LineString, Polygon } from 'ol/geom'
import DrawInteraction from 'ol/interaction/Draw'
import SnapInteraction from 'ol/interaction/Snap'
import { getUid } from 'ol/util'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

import EditableFeature from '@/api/features/EditableFeature.class'
import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { DEFAULT_MARKER_TITLE_OFFSET } from '@/api/icon.api'
import { editingFeatureStyleFunction } from '@/modules/drawing/lib/style'
import useSaveKmlOnChange from '@/modules/drawing/useKmlDataManagement.composable'
import { getEditableFeatureWithId } from '@/store/modules/features.store'
import { wrapXCoordinates } from '@/utils/coordinates/coordinateUtils'
import { geoadminStyleFunction } from '@/utils/featureStyleUtils'
import { GeodesicGeometries } from '@/utils/geodesicManager'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'useDrawingModeIntercation.composable' }

export default function useDrawingModeInteraction({
    geometryType = 'Point',
    editingStyle = editingFeatureStyleFunction,
    editableFeatureArgs = {},
    useGeodesicDrawing = false,
    snapping = false,
    drawEndCallback = null,
}) {
    const counterLinePolyPoints = ref(0)
    const isSnappingOnFirstPoint = ref(false)

    const drawingLayer = inject('drawingLayer')
    const olMap = inject('olMap')

    const { debounceSaveDrawing } = useSaveKmlOnChange()

    const store = useStore()
    const projection = computed(() => store.state.position.projection)

    const drawFromScratchInteraction = new DrawInteraction({
        style: editingStyle,
        type: geometryType,
        source: drawingLayer.getSource(),
        minPoints: 2, // As by default polygon geometries require at least 3 points
        stopClick: true,
        // only left-click to draw (primaryAction)
        condition: (e) => primaryAction(e),
        wrapX: true,
    })

    const continueDrawingInteraction = new DrawInteraction({
        style: editingStyle,
        type: 'LineString', // Only works for LineString
        source: drawingLayer.getSource(),
        minPoints: 2,
        stopClick: true,
        // only left-click to draw (primaryAction)
        condition: (e) => primaryAction(e),
        wrapX: true,
    })

    let interaction = drawFromScratchInteraction

    const snapInteraction = new SnapInteraction({
        source: drawingLayer.getSource(),
    })
    let selectedFeatureId = null
    let selectedFeature = null

    onMounted(() => {
        selectedFeatureId = store.state.features.selectedEditableFeatures[0]?.id
        if (selectedFeatureId) {
            selectedFeature = getEditableFeatureWithId(store.state.features, selectedFeatureId)
            if (selectedFeature) {
                interaction = continueDrawingInteraction
                const reverse = store.state.drawing.reverseLineStringExtension
                const lineFeature = selectedFeature.toOlFeature(reverse)
                interaction.extend(lineFeature)
            }
        }

        interaction.setActive(true)

        interaction.getOverlay().getSource().on('addfeature', onAddFeature)
        interaction.on('drawstart', onDrawStart)
        interaction.on('drawend', onDrawEnd)

        olMap.addInteraction(interaction)
        if (snapping) {
            olMap.addInteraction(snapInteraction)
            // registering events on the interaction created by the other mixin
            interaction.on('drawstart', onDrawStartResetPointCounter)
            interaction.getOverlay().getSource().on('addfeature', checkIfSnapping)
        }
    })
    onBeforeUnmount(() => {
        deactivate()
        if (snapping) {
            interaction.getOverlay().getSource().un('addfeature', checkIfSnapping)
            interaction.un('drawstart', onDrawStartResetPointCounter)
            olMap.removeInteraction(snapInteraction)
        }
    })

    function deactivate() {
        olMap.removeInteraction(interaction)

        interaction.un('drawend', onDrawEnd)
        interaction.un('drawstart', onDrawStart)
        interaction.getOverlay().getSource().un('addfeature', onAddFeature)

        interaction.setActive(false)
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

    function onAddFeature(event) {
        const feature = event.feature
        if (!feature.getId()) {
            /* setting a unique ID for each feature. getUid() is unique as long as the app
            isn't reloaded. The first part is a time stamp to guarante uniqueness even after
            reloading the app. Ps: We can not fully rely on the time stamp as some browsers may
            make the timestamp less precise to increase privacy. */
            const uid =
                'drawing_feature_' +
                Math.trunc(Date.now() / 1000) +
                ('000' + getUid(feature)).slice(-3)
            feature.setId(uid)
            const args = { ...editableFeatureArgs }
            args.id = uid

            /* applying extra properties that should be stored with that feature. Openlayers will
            automatically redraw the feature if these properties change, but not in a recursive
            manner. This means that if e.g. a property inside of the editableFeature changes, an
            update must be triggered manually.*/
            feature.setProperties({
                editableFeature: new EditableFeature(args),
                // For backward compatibility with the legacy mf-geoadmin3 viewer we need to add the
                // feature type as proprietary property
                type: args.featureType.toLowerCase(),
            })
            if (args.featureType === EditableFeatureTypes.MARKER) {
                feature.setProperties({
                    textOffset: DEFAULT_MARKER_TITLE_OFFSET.toString(),
                })
            }
            log.debug(`onAddFeature: feature ${feature.getId()} added`)
        }
    }

    function onDrawStartResetPointCounter() {
        counterLinePolyPoints.value = 0
    }

    function onDrawStart(event) {
        const feature = event.feature
        log.debug(`onDrawStart feature ${feature.getId()}`)
        if (useGeodesicDrawing) {
            feature.set('geodesic', new GeodesicGeometries(feature, projection.value))
        }
        // we set a flag telling that this feature is currently being drawn (for the first time, not edited)
        feature.set('isDrawing', true)
    }

    function onDrawEnd(event) {
        // deactivating the interaction (so that the user doesn't create another feature right after this one)
        // this does not change the state, for that we will bubble the event so that the parent will then
        // dispatch changes to the store
        // deactivate()
        // grabbing the drawn feature so that we send it through the event
        const feature = event.feature
        log.debug(`Drawing ended ${feature.getId()}`, feature)
        // checking if drawing was finished while linking the first point with the last
        // (if snapping occurred while placing the last point)
        const coordinates = getFeatureCoordinatesWithoutExtraPoint(feature)
        if (snapping && !isSnappingOnFirstPoint.value && coordinates.length > 1) {
            // if not the same ending point, it is not a polygon (the user didn't finish drawing by closing it)
            // so we transform the drawn polygon into a linestring
            feature.setGeometry(new LineString(coordinates))
        }
        /* Normalize the coordinates, as the modify interaction is configured to operate only
        between -180 and 180 deg (so that the features can be modified even if the view is of
        by 360deg) */
        const geometry = feature.getGeometry()
        const normalizedCoords = wrapXCoordinates(geometry.getCoordinates(), projection.value, true)
        geometry.setCoordinates(normalizedCoords)

        const editableFeature = feature.get('editableFeature')
        editableFeature.setCoordinatesFromFeature(feature)
        // setting the geometry too so that the floating popup can be placed correctly on the map
        editableFeature.geometry = new GeoJSON().writeGeometryObject(geometry)

        // removing the flag we've set above in onDrawStart (this feature is now drawn)
        feature.unset('isDrawing')
        // setting the definitive style function for this feature (thus replacing the editing style from the interaction)
        // This function will be automatically recalled every time the feature object is modified or rerendered.
        // (so there is no need to recall setstyle after modifying an extended property)
        feature.setStyle(geoadminStyleFunction)
        // see https://openlayers.org/en/latest/apidoc/module-ol_interaction_Draw-Draw.html#finishDrawing
        interaction.finishDrawing()
        store.dispatch('addDrawingFeature', { featureId: feature.getId(), ...dispatcher })
        store.dispatch('setDrawingMode', { mode: null, ...dispatcher })
        store.dispatch('setReverseLineStringExtension', {
            reverseLineStringExtension: null,
            ...dispatcher,
        })
        if (drawEndCallback) {
            drawEndCallback(feature)
        }
        // Here we need to save work in next tick to have the drawingLayer source updated.
        // Otherwise, the source might not yet be updated with the new/updated/deleted feature
        nextTick().then(debounceSaveDrawing)
    }
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

    function removeLastPoint() {
        interaction.removeLastPoint()
    }

    return {
        removeLastPoint,
    }
}
