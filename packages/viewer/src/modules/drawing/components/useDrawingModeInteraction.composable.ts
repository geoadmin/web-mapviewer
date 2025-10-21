import type { SingleCoordinate } from '@swissgeo/coordinates'
import type Feature from 'ol/Feature'
import type { Type as GeometryType } from 'ol/geom/Geometry'
import type VectorLayer from 'ol/layer/Vector'
import type Map from 'ol/Map'
import type { StyleFunction, StyleLike } from 'ol/style/Style'

import { coordinatesUtils } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { primaryAction } from 'ol/events/condition'
import GeoJSON from 'ol/format/GeoJSON'
import { LineString, Polygon, SimpleGeometry } from 'ol/geom'
import DrawInteraction, { DrawEvent } from 'ol/interaction/Draw'
import SnapInteraction from 'ol/interaction/Snap'
import { Style } from 'ol/style'
import { getUid } from 'ol/util'
import { v4 as uuidv4 } from 'uuid'
import { inject, nextTick, onBeforeUnmount, onMounted, ref, toValue } from 'vue'

import type { EditableFeature } from '@/api/features.api'
import type { ActionDispatcher } from '@/store/types'

import { EditableFeatureTypes, extractOlFeatureCoordinates } from '@/api/features.api'
import { updateStoreFeatureCoordinatesGeometry } from '@/modules/drawing/lib/drawingUtils'
import { editingFeatureStyleFunction } from '@/modules/drawing/lib/style'
import useSaveKmlOnChange from '@/modules/drawing/useKmlDataManagement.composable'
import useDrawingStore from '@/store/modules/drawing'
import { EditMode } from '@/store/modules/drawing/types/EditMode.enum'
import usePositionStore from '@/store/modules/position.store'
import {
    DEFAULT_MARKER_TITLE_OFFSET,
    geoadminStyleFunction,
    TextPlacement,
} from '@/utils/featureStyleUtils'
import { GeodesicGeometries } from '@/utils/geodesicManager'

const dispatcher: ActionDispatcher = { name: 'useDrawingModeInteraction.composable' }

interface UseDrawingModeInteractionConfig {
    /** The type of geometry to be drawn. Default is `'Point'` */
    geometryType?: GeometryType
    /** The style to be applied to the feature being edited. Default is `editingFeatureStyleFunction` */
    editingStyle?: StyleFunction
    /** Additional arguments for the editable feature. */
    editableFeatureArgs?: Partial<EditableFeature>
    useGeodesicDrawing?: boolean
    snapping?: boolean
    drawEndCallback?: (feature: Feature<SimpleGeometry>) => void
    startingFeature?: Feature<SimpleGeometry>
}

export default function useDrawingModeInteraction(config?: UseDrawingModeInteractionConfig) {
    const {
        geometryType = 'Point',
        editingStyle = editingFeatureStyleFunction,
        editableFeatureArgs = {},
        useGeodesicDrawing = false,
        snapping = false,
        drawEndCallback,
        startingFeature,
    } = config ?? {}

    const counterLinePolyPoints = ref<number>(0)
    const isSnappingOnFirstPoint = ref<boolean>(false)

    const drawingLayer = inject<VectorLayer>('drawingLayer')
    const olMap = inject<Map>('olMap')

    if (!drawingLayer || !olMap) {
        throw new Error('Drawing layer or OL map not provided')
    }

    const { debounceSaveDrawing } = useSaveKmlOnChange()

    const positionStore = usePositionStore()
    const drawingStore = useDrawingStore()

    const interactionSource = drawingLayer.getSource()
    if (!interactionSource) {
        throw new Error('Drawing layer source not found')
    }
    const interaction = new DrawInteraction({
        style: editingStyle as StyleFunction,
        type: toValue(geometryType),
        source: interactionSource,
        minPoints: 2, // Default polygon geometries require at least 3 points
        stopClick: true,
        // only left-click to draw (primaryAction)
        condition: (e) => primaryAction(e),
        wrapX: true,
    })
    const snapInteraction = new SnapInteraction({
        source: interactionSource,
    })

    const isExtending = !!toValue(startingFeature)
    let previousStyle: StyleLike | undefined = undefined // to store the previous style of the starting feature

    onMounted(() => {
        interaction.setActive(true)

        const overlaySource = interaction.getOverlay().getSource()
        if (!overlaySource) {
            throw new Error('Drawing overlay source not found')
        }

        overlaySource.on('addfeature', onAddFeature)
        interaction.on('drawstart', onDrawStart)
        interaction.on('drawend', onDrawEnd)

        olMap.addInteraction(interaction)
        if (snapping) {
            olMap.addInteraction(snapInteraction)
            // registering events on the interaction created by the other mixin
            interaction.on('drawstart', onDrawStartResetPointCounter)
            overlaySource.on('addfeature', checkIfSnapping)
        }
        if (isExtending && startingFeature) {
            const startingFeatureGeometry = toValue(startingFeature).getGeometry()
            const startingFeatureCoordinates = startingFeatureGeometry?.getCoordinates()
            // There is no 'extend' function for Polygon.
            // We need to start a new drawing with the starting feature's geometry.
            // This new drawing is not saved in the store and will not be added to the layer source
            // we only need the coordinates to extend/update the starting feature.
            if (startingFeatureCoordinates) {
                interaction.appendCoordinates(
                    coordinatesUtils.removeZValues(startingFeatureCoordinates)
                )
            }
        }
    })
    onBeforeUnmount(() => {
        deactivate()
        const overlaySource = interaction.getOverlay().getSource()
        if (snapping) {
            // @ts-expect-error "addfeature" event isn't recognized in this context for some reason... (but is recognized when registering the event)
            overlaySource?.un('addfeature', checkIfSnapping)
            interaction.un('drawstart', onDrawStartResetPointCounter)
            olMap.removeInteraction(snapInteraction)
        }
    })

    function deactivate() {
        const overlaySource = interaction.getOverlay().getSource()

        olMap!.removeInteraction(interaction)

        interaction.un('drawend', onDrawEnd)
        interaction.un('drawstart', onDrawStart)
        // @ts-expect-error "addfeature" event isn't recognized in this context for some reason... (but is recognized when registering the event)
        overlaySource?.un('addfeature', onAddFeature)

        interaction.setActive(false)
    }

    /**
     * As OL believes it is drawing a polygon, it will always add the first point as the last, even
     * if not finished, so we remove it before performing our checks
     */
    function getFeatureCoordinatesWithoutExtraPoint(
        feature: Feature<SimpleGeometry>
    ): SingleCoordinate[] | undefined {
        const geometryCoordinates: SingleCoordinate[] | undefined =
            feature.getGeometry()?.getCoordinates() ?? undefined
        if (
            Array.isArray(geometryCoordinates) &&
            geometryCoordinates.length > 0 &&
            Array.isArray(geometryCoordinates[0])
        ) {
            return geometryCoordinates.slice(0, -1)
        }
        return geometryCoordinates
    }

    function onAddFeature(event: DrawEvent) {
        const feature: Feature<SimpleGeometry> = event.feature as Feature<SimpleGeometry>
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
            const editableFeature: EditableFeature = {
                coordinates: feature.getGeometry()?.getCoordinates() ?? [],
                featureType: drawingStore.mode!,
                isDragged: false,
                isEditable: true,
                showDescriptionOnMap: false,
                textOffset: [0, 0],
                textPlacement: TextPlacement.Center,
                title: '',
                id: uid,
                ...editableFeatureArgs,
            }

            /* applying extra properties that should be stored with that feature. Openlayers will
            automatically redraw the feature if these properties change, but not in a recursive
            manner. This means that if e.g. a property inside of the editableFeature changes, an
            update must be triggered manually.*/
            feature.setProperties({
                editableFeature,
                // For backward compatibility with the legacy mf-geoadmin3 viewer we need to add the
                // feature type as proprietary property
                type: editableFeature.featureType.toLowerCase(),
            })
            if (editableFeature.featureType === EditableFeatureTypes.Marker) {
                feature.setProperties({
                    textOffset: DEFAULT_MARKER_TITLE_OFFSET.toString(),
                    showDescriptionOnMap: false,
                })
            }
            log.debug({
                title: 'useDrawingModeInteraction',
                titleColor: LogPreDefinedColor.Blue,
                messages: [`onAddFeature: feature ${feature.getId()} added`],
            })
        }
    }

    function onDrawStartResetPointCounter() {
        counterLinePolyPoints.value = 0
    }

    // We only need the drawn feature, as the starting feature is already in the store / layer source
    // no need to insert the drawn feature in the layer source
    function updateStartingFeature(drawnFeature: Feature<SimpleGeometry>) {
        const selectedFeature: Feature<SimpleGeometry> | undefined = toValue(startingFeature)

        if (!selectedFeature) {
            return
        }
        drawnFeature.setId(selectedFeature.getId())
        drawnFeature.unset('isDrawing')

        selectedFeature.setGeometry(drawnFeature.getGeometry())
        selectedFeature.setStyle(previousStyle)

        // Update the selected feature with new coordinates
        if (selectedFeature) {
            updateStoreFeatureCoordinatesGeometry(
                selectedFeature,
                dispatcher,
                drawingStore.reverseLineStringExtension
            )
            drawingStore.setEditingMode(
                EditMode.MODIFY,
                drawingStore.reverseLineStringExtension,
                dispatcher
            )
            debounceSaveDrawing().catch((err) => {
                log.error({
                    title: 'useDrawingModeInteraction',
                    titleColor: LogPreDefinedColor.Blue,
                    messages: ['Error while saving drawing', err],
                })
            })
        }

        interaction.abortDrawing()
    }

    function onDrawStart(event: DrawEvent) {
        if (isExtending && startingFeature) {
            // hide the starting feature and store its style to restore it later
            previousStyle = startingFeature.getStyle()
            startingFeature.setStyle(new Style())
        }
        const feature = event.feature
        log.debug({
            title: 'useDrawingModeInteraction',
            titleColor: LogPreDefinedColor.Blue,
            messages: [`onDrawStart feature ${feature.getId()}`],
        })
        if (useGeodesicDrawing) {
            feature.set('geodesic', new GeodesicGeometries(feature, positionStore.projection))
        }
        // we set a flag telling that this feature is currently being drawn (for the first time, not edited)
        feature.set('isDrawing', true)
    }

    function onDrawEnd(event: DrawEvent) {
        const drawnFeature = event.feature as Feature<SimpleGeometry>

        const featureId = drawnFeature.getId() ? `${drawnFeature.getId()}` : uuidv4()

        log.debug({
            title: 'useDrawingModeInteraction',
            titleColor: LogPreDefinedColor.Blue,
            messages: [`Drawing ended ${featureId}`, drawnFeature],
        })

        // We need the coordinates of the drawn feature to update the selected feature
        const coordinates = getFeatureCoordinatesWithoutExtraPoint(drawnFeature)
        if (
            snapping &&
            !isSnappingOnFirstPoint.value &&
            Array.isArray(coordinates) &&
            coordinates.length > 1
        ) {
            // if not the same ending point, it is not a polygon (the user didn't finish drawing by closing it)
            // so we transform the drawn polygon into a linestring
            drawnFeature.setGeometry(new LineString(coordinates))
        }
        /* Normalize the coordinates, as the modify interaction is configured to operate only
        between -180 and 180 deg (so that the features can be modified even if the view is of
        by 360deg) */
        const geometry = drawnFeature.getGeometry()
        if (!geometry || geometry.getType() === 'GeometryCollection') {
            return
        }
        const geometryCoordinates = geometry.getCoordinates()
        if (geometryCoordinates) {
            const normalizedCoords = coordinatesUtils.wrapXCoordinates(
                geometryCoordinates,
                positionStore.projection
            )
            geometry.setCoordinates(normalizedCoords)
        }

        if (isExtending) {
            updateStartingFeature(drawnFeature)
        } else {
            // deactivating the interaction (so that the user doesn't create another feature right after this one)
            // this does not change the state, for that we will bubble the event so that the parent will then
            // dispatch changes to the store
            // deactivate()
            // grabbing the drawn feature so that we send it through the event

            const editableFeature = drawnFeature.get('editableFeature')
            editableFeature.coordinates = extractOlFeatureCoordinates(drawnFeature)
            // setting the geometry too so that the floating popup can be placed correctly on the map
            editableFeature.geometry = new GeoJSON().writeGeometryObject(geometry)

            // removing the flag we've set above in onDrawStart (this feature is now drawn)
            drawnFeature.unset('isDrawing')
            // setting the definitive style function for this feature (thus replacing the editing style from the interaction)
            // This function will be automatically recalled every time the feature object is modified or rerendered.
            // (so there is no need to recall setstyle after modifying an extended property)
            drawnFeature.setStyle(geoadminStyleFunction)
            // see https://openlayers.org/en/latest/apidoc/module-ol_interaction_Draw-Draw.html#finishDrawing
            interaction.finishDrawing()
            // we do not need to share the drawing when the drawing is from the report problem tool
            if (drawingStore.online) {
                drawingStore.setIsDrawingModified(true, dispatcher)
            }
            drawingStore.addDrawingFeature(featureId, dispatcher)
            drawingStore.setDrawingMode(undefined, dispatcher)
            if (drawEndCallback) {
                drawEndCallback(drawnFeature)
            }
            // Here we need to save work in next tick to have the drawingLayer source updated.
            // Otherwise, the source might not yet be updated with the new/updated/deleted feature
            nextTick()
                .then(() => debounceSaveDrawing())
                .catch((err) => {
                    log.error({
                        title: 'useDrawingModeInteraction',
                        titleColor: LogPreDefinedColor.Blue,
                        messages: ['Error while saving drawing after next tick', err],
                    })
                })
        }
    }
    function checkIfSnapping(event: DrawEvent) {
        const feature = event.feature as Feature<SimpleGeometry>
        // only checking if the geom is a polygon (it as more than one point)
        if (feature.getGeometry() instanceof Polygon) {
            const lineCoords = getFeatureCoordinatesWithoutExtraPoint(feature)
            // if the point count is different, we update it
            if (lineCoords && counterLinePolyPoints.value !== lineCoords.length) {
                // A point is added or removed, updating sketch points counter
                counterLinePolyPoints.value = lineCoords.length
            } else if (lineCoords && lineCoords.length > 1) {
                const firstPoint = lineCoords[0]
                const lastPoint = lineCoords[lineCoords.length - 1]
                const sketchPoint = lineCoords[lineCoords.length - 2]

                if (!firstPoint || !lastPoint || !sketchPoint) {
                    return
                }

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
