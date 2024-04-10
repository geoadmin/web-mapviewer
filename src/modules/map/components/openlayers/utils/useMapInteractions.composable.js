import GeoJSON from 'ol/format/GeoJSON'
import { defaults as getDefaultInteractions, DragPan, MouseWheelZoom } from 'ol/interaction'
import DoubleClickZoomInteraction from 'ol/interaction/DoubleClickZoom'
import { computed, onBeforeUnmount, watch } from 'vue'
import { useStore } from 'vuex'

import LayerFeature from '@/api/features/LayerFeature.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { DRAWING_HIT_TOLERANCE, IS_TESTING_WITH_CYPRESS } from '@/config'
import { useMouseOnMap } from '@/modules/map/components/common/mouse-click.composable'
import { useDragBoxSelect } from '@/modules/map/components/openlayers/utils/useDragBoxSelect.composable'
import { normalizeExtent } from '@/utils/coordinates/coordinateUtils.js'
import log from '@/utils/logging'

export default function useMapInteractions(map) {
    const { onLeftClickDown, onLeftClickUp, onRightClick, onMouseMove } = useMouseOnMap()
    const store = useStore()

    const isCurrentlyDrawing = computed(() => store.state.ui.showDrawingOverlay)
    const activeVectorLayers = computed(() =>
        store.state.layers.activeLayers.filter((layer) =>
            [LayerTypes.KML, LayerTypes.GPX, LayerTypes.GEOJSON].includes(layer.type)
        )
    )

    // NOTE: we cannot use the {constraintResolution: true} as it has zooming issue with some devices and/or os
    const freeMouseWheelInteraction = new MouseWheelZoom()

    // Make it possible to select by dragging the map with ctrl down
    const { dragBoxSelect } = useDragBoxSelect()

    const interactions = getDefaultInteractions().extend([
        dragBoxSelect,
        // Add middle mouse button for panning
        new DragPan({
            condition: function (event) {
                return event.originalEvent.buttons === 4
            },
        }),
    ])
    interactions.forEach((interaction) => map.addInteraction(interaction))

    watch(isCurrentlyDrawing, (newValue) => {
        // We iterate through the map "interaction" classes, to enable/disable the "double click zoom" interaction
        // while a drawing is currently made. Otherwise, when the user double-clicks to finish his/her drawing,
        // the map zooms in.
        map.getInteractions().forEach((interaction) => {
            if (interaction instanceof DoubleClickZoomInteraction) {
                interaction.setActive(!newValue)
            }
        })
        // activating/deactivating identification of feature on click, depending on if we are drawing
        // (we do not want identification while drawing)
        if (newValue) {
            unregisterPointerEvents()
        } else {
            registerPointerEvents()
        }
    })

    registerPointerEvents()
    map.addInteraction(freeMouseWheelInteraction)

    onBeforeUnmount(() => {
        unregisterPointerEvents()
    })

    function registerPointerEvents() {
        log.debug(`Register map pointer events`)
        const mapElement = map.getTargetElement()
        if (mapElement) {
            mapElement.addEventListener('pointerdown', onPointerDown)
            mapElement.addEventListener('pointerup', onPointerUp)
            mapElement.addEventListener('pointermove', onMouseMove)
            if (IS_TESTING_WITH_CYPRESS) {
                window.mapPointerEventReady = true
            }
        } else {
            log.error(`Failed to set map pointer events, map element not found`)
        }
    }

    function unregisterPointerEvents() {
        log.debug(`Unregister map pointer events`)
        if (IS_TESTING_WITH_CYPRESS) {
            window.mapPointerEventReady = false
        }
        const mapElement = map.getTargetElement()
        if (mapElement) {
            mapElement.removeEventListener('pointerdown', onPointerDown)
            mapElement.removeEventListener('pointerup', onPointerUp)
            mapElement.removeEventListener('pointermove', onMouseMove)
        }
    }

    function onPointerDown(event) {
        log.debug(`map pointer down event ${event.target?.nodeName}`)
        // Checking that we are dealing with OL canvas here, and not another part of OL elements,
        // such as the floating tooltip. Without this check, clicking on the floating tooltip button
        // will trigger an identification of feature at the position of the button.
        if (event.target?.nodeName?.toLowerCase() === 'canvas') {
            const pixel = [event.x, event.y]
            onLeftClickDown(event.pixel, map.getCoordinateFromPixel(pixel))
        }
    }
    function onPointerUp(event) {
        log.debug(`map pointer up event ${event.target?.nodeName}`)
        // see comment in onPointDown why we check that we deal with the canvas only
        if (event.target?.nodeName?.toLowerCase() === 'canvas') {
            const pixel = [event.x, event.y]
            const coordinate = map.getCoordinateFromPixel(pixel)
            const features = []
            activeVectorLayers.value.forEach((vectorLayer) => {
                map.getLayers().forEach((olLayer) => {
                    if (olLayer.get('id') === vectorLayer.id) {
                        const layerFeatures = map
                            .getFeaturesAtPixel(pixel, {
                                layerFilter: (layer) => layer.get('id') === olLayer.get('id'),
                                hitTolerance: DRAWING_HIT_TOLERANCE,
                            })
                            .map(
                                (olFeature) =>
                                    new LayerFeature({
                                        layer: vectorLayer,
                                        id: olFeature.getId(),
                                        name: olFeature.getId(),
                                        data: {
                                            title: olFeature.get('name'),
                                            description: olFeature.get('description'),
                                        },
                                        coordinates: olFeature.getGeometry().coordinates,
                                        geometry: new GeoJSON().writeGeometryObject(
                                            olFeature.getGeometry()
                                        ),
                                        extent: normalizeExtent(
                                            olFeature.getGeometry().getExtent()
                                        ),
                                    })
                            )
                            // unique filter on features (OL sometimes return twice the same features)
                            .filter(
                                (feature, index, self) =>
                                    self.indexOf(
                                        self.find(
                                            (anotherFeature) => anotherFeature.id === feature.id
                                        )
                                    ) === index
                            )
                        if (layerFeatures.length > 0) {
                            features.push(...layerFeatures)
                        }
                    }
                })
            })
            switch (event.button) {
                case 0:
                    onLeftClickUp(pixel, coordinate, features)
                    break
                case 2:
                    onRightClick(pixel, coordinate)
                    break
            }
        }
    }
}
