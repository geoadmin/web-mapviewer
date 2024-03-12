import { platformModifierKeyOnly } from 'ol/events/condition'
import { defaults as getDefaultInteractions, MouseWheelZoom } from 'ol/interaction'
import DoubleClickZoomInteraction from 'ol/interaction/DoubleClickZoom'
import DragRotateInteraction from 'ol/interaction/DragRotate'
import { computed, onBeforeUnmount, watch } from 'vue'
import { useStore } from 'vuex'

import { IS_TESTING_WITH_CYPRESS } from '@/config'
import { useMouseOnMap } from '@/modules/map/components/common/mouse-click.composable'
import log from '@/utils/logging'

export default function useMapInteractions(map) {
    const { onLeftClickDown, onLeftClickUp, onRightClick, onMouseMove } = useMouseOnMap()
    const store = useStore()

    const isCurrentlyDrawing = computed(() => store.state.ui.showDrawingOverlay)

    // NOTE: we cannot use the {constraintResolution: true} as it has zooming issue with some devices and/or os
    const freeMouseWheelInteraction = new MouseWheelZoom()

    // Make it possible to rotate the map with ctrl+drag (in addition to OpenLayers default Alt+Shift+Drag).
    // This is probably more intuitive. Also, Windows and some Linux distros use alt+shift to switch the
    // keyboard layout, so using alt+shift may have unintended side effects or not work at all.
    const interactions = getDefaultInteractions().extend([
        new DragRotateInteraction({
            condition: platformModifierKeyOnly,
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
            onLeftClickDown(event.pixel, map.getCoordinateFromPixel([event.x, event.y]))
        }
    }
    function onPointerUp(event) {
        log.debug(`map pointer up event ${event.target?.nodeName}`)
        // see comment in onPointDown why we check that we deal with the canvas only
        if (event.target?.nodeName?.toLowerCase() === 'canvas') {
            const coordinate = map.getCoordinateFromPixel([event.x, event.y])
            switch (event.button) {
                case 0:
                    onLeftClickUp(event.pixel, coordinate)
                    break
                case 2:
                    onRightClick(event.pixel, coordinate)
                    break
            }
        }
    }
}
