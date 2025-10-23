import type { SingleCoordinate } from '@swissgeo/coordinates'
import type { Layer } from '@swissgeo/layers'
import type { Map, MapBrowserEvent } from 'ol'

import { LayerType } from '@swissgeo/layers'
import log from '@swissgeo/log'
import { altKeyOnly, platformModifierKeyOnly, primaryAction } from 'ol/events/condition'
import { DragPan, DragRotate, MouseWheelZoom } from 'ol/interaction'
import DoubleClickZoomInteraction from 'ol/interaction/DoubleClickZoom'
import { computed, type MaybeRef, onBeforeUnmount, toValue, watch } from 'vue'

import type { LayerFeature } from '@/api/features.api'
import type { ActionDispatcher } from '@/store/types'

import { DRAWING_HIT_TOLERANCE } from '@/config/map.config'
import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import useDragFileOverlay from '@/modules/map/components/common/useDragFileOverlay.composable'
import { useDragBoxSelect } from '@/modules/map/components/openlayers/utils/useDragBoxSelect.composable'
import useDrawingStore from '@/store/modules/drawing'
import useLayersStore from '@/store/modules/layers'
import useMapStore, { ClickType } from '@/store/modules/map'
import { createLayerFeature } from '@/utils/layerUtils'

const dispatcher: ActionDispatcher = {
    name: 'useMapInteractions.composable',
}
const longPressEvents = [
    'touch',
    'pen',
    '', // This is necessary for IoS support
]

interface ExtendedPointerEvent extends PointerEvent {
    originalEvent?: PointerEvent
    pixel?: number[]
    coordinate?: number[]
    updateLongClickTriggered?: boolean
}

export default function useMapInteractions(map: MaybeRef<Map>): void {
    const drawingStore = useDrawingStore()
    const layersStore = useLayersStore()
    const mapStore = useMapStore()

    const isCurrentlyDrawing = computed(() => drawingStore.drawingOverlay.show)
    const activeVectorLayers = computed(() =>
        layersStore.activeLayers.filter((layer: Layer) =>
            [LayerType.KML, LayerType.GPX, LayerType.GEOJSON].includes(layer.type)
        )
    )

    // NOTE: we cannot use the {constraintResolution: true} as it has zooming issue with some devices and/or os
    const freeMouseWheelInteraction = new MouseWheelZoom()

    // Make it possible to select by dragging the map with ctrl down
    const { dragBoxSelect } = useDragBoxSelect()
    toValue(map).addInteraction(dragBoxSelect)

    // Add interaction to drag the map using the middle mouse button
    toValue(map).addInteraction(
        new DragPan({
            condition: function (
                event: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>
            ) {
                return (event.originalEvent as MouseEvent).buttons === 4
            },
        })
    )

    toValue(map).addInteraction(
        new DragRotate({
            condition: (event) => primaryAction(event) && altKeyOnly(event),
        })
    )

    watch(isCurrentlyDrawing, (newValue) => {
        // We iterate through the map "interaction" classes, to enable/disable the "double click zoom" interaction
        // while a drawing is currently made. Otherwise, when the user double-clicks to finish his/her drawing,
        // the map zooms in.
        toValue(map)
            .getInteractions()
            .forEach((interaction) => {
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
    toValue(map).addInteraction(freeMouseWheelInteraction)

    onBeforeUnmount(() => {
        unregisterPointerEvents()
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
    let longClickTimeout: ReturnType<typeof setTimeout> | undefined = undefined

    function registerPointerEvents(): void {
        log.debug(`Register map pointer events`)
        toValue(map).on('singleclick', onMapLeftClick)
        toValue(map).on('contextmenu' as 'singleclick', onMapRightClick)
        toValue(map).on('pointermove', onMapMove)
        // also registering double click as a map move, so that location popup (right click)
        // isn't triggered when zooming by double-click
        toValue(map).on('dblclick', onMapMove)

        toValue(map).getTargetElement()?.addEventListener('pointerdown', onMapPointerDown)

        if (IS_TESTING_WITH_CYPRESS) {
            window.mapPointerEventReady = true
        }
    }

    function unregisterPointerEvents(): void {
        log.debug(`Unregister map pointer events`)
        if (IS_TESTING_WITH_CYPRESS) {
            window.mapPointerEventReady = false
        }

        toValue(map).getTargetElement()?.removeEventListener('pointerdown', onMapPointerDown)

        toValue(map).un('dblclick', onMapMove)
        toValue(map).un('pointermove', onMapMove)
        toValue(map).un('singleclick', onMapLeftClick)
        toValue(map).un('contextmenu' as 'singleclick', onMapRightClick)
    }

    function onMapLeftClick(
        event: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>
    ): void {
        clearTimeout(longClickTimeout)
        if (longClickTriggered) {
            // click was already processed, ignoring (will otherwise select features at the same time as the right click has been triggered)
            longClickTriggered = false
            return
        }
        const { coordinate, pixel } = event
        const features: ReturnType<typeof createLayerFeature>[] = []
        activeVectorLayers.value.forEach((vectorLayer) => {
            toValue(map)
                .getLayers()
                .forEach((olLayer) => {
                    if (olLayer.get('id') === vectorLayer.id) {
                        const layerFeatures = toValue(map)
                            .getFeaturesAtPixel(pixel, {
                                layerFilter: (layer) => layer.get('id') === olLayer.get('id'),
                                hitTolerance: DRAWING_HIT_TOLERANCE,
                            })
                            .map((olFeature) => createLayerFeature(olFeature, vectorLayer))
                            // unique filter on features (OL sometimes return twice the same features)
                            .filter(
                                (feature, index, self) =>
                                    self.indexOf(
                                        self.find(
                                            (anotherFeature) => anotherFeature?.id === feature?.id
                                        )
                                    ) === index
                            )
                        if (layerFeatures.length > 0) {
                            features.push(...layerFeatures)
                        }
                    }
                })
        })
        let clickType = ClickType.LeftSingleClick
        if (platformModifierKeyOnly(event)) {
            clickType = ClickType.CtrlLeftSingleClick
        }
        mapStore.click(
            {
                coordinate: coordinate as SingleCoordinate,
                pixelCoordinate: pixel as SingleCoordinate,
                features: features.filter((f): f is LayerFeature => f !== undefined),
                clickType: clickType,
            },
            dispatcher
        )
    }

    function onMapRightClick(
        event: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent> | ExtendedPointerEvent
    ): void {
        clearTimeout(longClickTimeout)
        longClickTriggered =
            ('updateLongClickTriggered' in event && event.updateLongClickTriggered) ||
            event.type === 'contextmenu'
        mapStore.click(
            {
                coordinate: event.coordinate! as SingleCoordinate,
                pixelCoordinate: event.pixel! as SingleCoordinate,
                features: [],
                clickType: ClickType.ContextMenu,
            },
            dispatcher
        )
    }

    function onMapMove(): void {
        mapHasMoved = true
        clearTimeout(longClickTimeout)
    }

    function onMapPointerDown(event: Event): void {
        const pointerEvent = event as ExtendedPointerEvent
        const { target } = pointerEvent
        // only reacting to pointer down on the map itself (on canvas, each layer being a canvas)
        // without this check, clicking into the map popover triggers a mousedown event, which will
        // then show the location popup and hide any feature info that was there (impossible to interact
        // with feature info)
        if ((target as HTMLElement).nodeName?.toLowerCase() === 'canvas') {
            clearTimeout(longClickTimeout)
            mapHasMoved = false
            // triggering a long click on the same spot after 500ms, so that mobile cas have access to the
            // LocationPopup by touching the same-ish spot for 500ms
            longClickTimeout = setTimeout(() => {
                // we need to ensure long mouse clicks don't trigger this.
                const originalPointerType =
                    pointerEvent.originalEvent?.pointerType ?? pointerEvent.pointerType
                if (!mapHasMoved && longPressEvents.includes(originalPointerType ?? '')) {
                    // we are outside of OL event handling, on the HTML element, so we do not receive map pixel and coordinate automatically
                    const pixel = toValue(map).getEventPixel(pointerEvent)
                    const coordinate = toValue(map).getCoordinateFromPixel(pixel)
                    onMapRightClick({
                        ...pointerEvent,
                        pixel,
                        coordinate,
                        updateLongClickTriggered: true,
                    })
                }
                mapHasMoved = false
            }, 500)
        }
    }

    useDragFileOverlay(toValue(map).getTargetElement())
}
