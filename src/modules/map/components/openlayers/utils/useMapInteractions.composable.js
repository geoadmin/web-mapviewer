import { DragPan, MouseWheelZoom } from 'ol/interaction'
import DoubleClickZoomInteraction from 'ol/interaction/DoubleClickZoom'
import { computed, onBeforeUnmount, watch } from 'vue'
import { useStore } from 'vuex'

import LayerTypes from '@/api/layers/LayerTypes.enum'
import { DRAWING_HIT_TOLERANCE } from '@/config/map.config'
import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import { useDragBoxSelect } from '@/modules/map/components/openlayers/utils/useDragBoxSelect.composable'
import useImportFile from '@/modules/menu/components/advancedTools/ImportFile/useImportFile.composable'
import { ClickInfo, ClickType } from '@/store/modules/map.store'
import { createLayerFeature } from '@/utils/layerUtils'
import log from '@/utils/logging'

const dispatcher = {
    dispatcher: 'useMapInteractions.composable',
}
const longPressEvents = [
    'touch',
    'pen',
    '', // This is necessary for IoS support
]

export default function useMapInteractions(map) {
    const { handleFileSource } = useImportFile()

    const store = useStore()

    const isCurrentlyDrawing = computed(() => store.state.drawing.drawingOverlay.show)
    const activeVectorLayers = computed(() =>
        store.state.layers.activeLayers.filter((layer) =>
            [LayerTypes.KML, LayerTypes.GPX, LayerTypes.GEOJSON].includes(layer.type)
        )
    )

    // NOTE: we cannot use the {constraintResolution: true} as it has zooming issue with some devices and/or os
    const freeMouseWheelInteraction = new MouseWheelZoom()

    // Make it possible to select by dragging the map with ctrl down
    const { dragBoxSelect } = useDragBoxSelect()
    map.addInteraction(dragBoxSelect)

    // Add interaction to drag the map using the middle mouse button
    map.addInteraction(
        new DragPan({
            condition: function (event) {
                return event.originalEvent.buttons === 4
            },
        })
    )

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
    registerDragAndDropEvent()
    map.addInteraction(freeMouseWheelInteraction)

    onBeforeUnmount(() => {
        unregisterPointerEvents()
        unregisterDragAndDropEvent()
    })

    /*
     * Many ways of dealing with click explained as below :
     *
     *  - Mouse down -> less than 500ms -> Mouse up => OL fires a singleclick event, we handle it in onMapLeftClick
     *  - Mouse down -> Mouse move -> Mouse up (time doesn't matter) => We do nothing, the map has moved
     *  - Mouse down -> 500ms (no map move) -> we detect a long press and trigger a right click (singleclick needs then to be muted in this case)
     *
     */
    let mapHasMoved = false
    let longClickTriggered = false
    let longClickTimeout

    function registerPointerEvents() {
        log.debug(`Register map pointer events`)
        map.on('singleclick', onMapLeftClick)
        map.on('contextmenu', onMapRightClick)
        map.on('pointermove', onMapMove)
        // also registering double click as a map move, so that location popup (right click)
        // isn't triggered when zooming by double-click
        map.on('dblclick', onMapMove)

        map.getTargetElement().addEventListener('pointerdown', onMapPointerDown)

        if (IS_TESTING_WITH_CYPRESS) {
            window.mapPointerEventReady = true
        }
    }

    function unregisterPointerEvents() {
        log.debug(`Unregister map pointer events`)
        if (IS_TESTING_WITH_CYPRESS) {
            window.mapPointerEventReady = false
        }

        map.getTargetElement().removeEventListener('pointerdown', onMapPointerDown)

        map.un('dblclick', onMapMove)
        map.un('pointermove', onMapMove)
        map.un('singleclick', onMapLeftClick)
        map.un('contextmenu', onMapRightClick)
    }

    function onMapLeftClick(event) {
        clearTimeout(longClickTimeout)
        if (longClickTriggered) {
            // click was already processed, ignoring (will otherwise select features at the same time as the right click has been triggered)
            longClickTriggered = false
            return
        }
        const { coordinate, pixel } = event
        const features = []
        activeVectorLayers.value.forEach((vectorLayer) => {
            map.getLayers().forEach((olLayer) => {
                if (olLayer.get('id') === vectorLayer.id) {
                    const layerFeatures = map
                        .getFeaturesAtPixel(pixel, {
                            layerFilter: (layer) => layer.get('id') === olLayer.get('id'),
                            hitTolerance: DRAWING_HIT_TOLERANCE,
                        })
                        .map((olFeature) => createLayerFeature(olFeature, vectorLayer))
                        // unique filter on features (OL sometimes return twice the same features)
                        .filter(
                            (feature, index, self) =>
                                self.indexOf(
                                    self.find((anotherFeature) => anotherFeature.id === feature.id)
                                ) === index
                        )
                    if (layerFeatures.length > 0) {
                        features.push(...layerFeatures)
                    }
                }
            })
        })
        store.dispatch('click', {
            clickInfo: new ClickInfo({
                coordinate,
                pixelCoordinate: pixel,
                features,
                clickType: ClickType.LEFT_SINGLECLICK,
            }),
        })
    }

    function onMapRightClick(event) {
        clearTimeout(longClickTimeout)
        longClickTriggered = event.updateLongClickTriggered ?? event.type === 'contextmenu'
        store.dispatch('click', {
            clickInfo: new ClickInfo({
                coordinate: event.coordinate,
                pixelCoordinate: event.pixel,
                features: [],
                clickType: ClickType.CONTEXTMENU,
            }),
        })
    }

    function onMapMove() {
        mapHasMoved = true
        clearTimeout(longClickTimeout)
    }

    function onMapPointerDown(event) {
        const { target } = event
        // only reacting to pointer down on the map itself (on canvas, each layer being a canvas)
        // without this check, clicking into the map popover triggers a mousedown event, which will
        // then show the location popup and hide any feature info that was there (impossible to interact
        // with feature info)
        if (target.nodeName?.toLowerCase() === 'canvas') {
            clearTimeout(longClickTimeout)
            mapHasMoved = false
            // triggering a long click on the same spot after 500ms, so that mobile cas have access to the
            // LocationPopup by touching the same-ish spot for 500ms
            longClickTimeout = setTimeout(() => {
                // we need to ensure long mouse clicks don't trigger this.
                if (
                    !mapHasMoved &&
                    (longPressEvents.includes(event.originalEvent?.pointerType) ||
                        longPressEvents.includes(event.pointerType))
                ) {
                    // we are outside of OL event handling, on the HTML element, so we do not receive map pixel and coordinate automatically
                    const pixel = map.getEventPixel(event)
                    const coordinate = map.getCoordinateFromPixel(pixel)
                    onMapRightClick({
                        ...event,
                        pixel,
                        coordinate,
                        updateLongClickTriggered: true,
                    })
                }
                mapHasMoved = false
            }, 500)
        }
    }

    function registerDragAndDropEvent() {
        log.debug(`Register drag and drop events`)
        const mapElement = map.getTargetElement()
        mapElement.addEventListener('dragover', onDragOver)
        mapElement.addEventListener('drop', onDrop)
        mapElement.addEventListener('dragleave', onDragLeave)
    }

    function unregisterDragAndDropEvent() {
        log.debug(`Unregister drag and drop events`)
        const mapElement = map.getTargetElement()
        mapElement.removeEventListener('dragover', onDragOver)
        mapElement.removeEventListener('drop', onDrop)
        mapElement.removeEventListener('dragleave', onDragLeave)
    }

    function onDragOver(event) {
        event.preventDefault()
        store.dispatch('setShowDragAndDropOverlay', { showDragAndDropOverlay: true, ...dispatcher })
    }

    function onDrop(event) {
        event.preventDefault()
        store.dispatch('setShowDragAndDropOverlay', {
            showDragAndDropOverlay: false,
            ...dispatcher,
        })

        if (event.dataTransfer.items) {
            for (/** @type {DataTransferItem} */ const item of event.dataTransfer.items) {
                // If dropped items aren't files, reject them
                if (item.kind === 'file') {
                    handleFileSource(item.getAsFile())
                }
            }
        } else {
            for (/** @type {File} */ const file of event.dataTransfer.files) {
                handleFileSource(file)
            }
        }
    }

    function onDragLeave() {
        store.dispatch('setShowDragAndDropOverlay', {
            showDragAndDropOverlay: false,
            ...dispatcher,
        })
    }
}
