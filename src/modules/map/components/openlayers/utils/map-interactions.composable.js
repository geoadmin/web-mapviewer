import { useMouseOnMap } from '@/modules/map/components/common/mouse-click.composable'
import { LV95 } from '@/utils/coordinates/coordinateSystems'
import { platformModifierKeyOnly } from 'ol/events/condition'
import { defaults as getDefaultInteractions, MouseWheelZoom } from 'ol/interaction'
import DoubleClickZoomInteraction from 'ol/interaction/DoubleClickZoom'
import DragRotateInteraction from 'ol/interaction/DragRotate'
import { computed, onBeforeUnmount, watch } from 'vue'
import { useStore } from 'vuex'

export default function useMapInteractions(map) {
    const store = useStore()
    const isCurrentlyDrawing = computed(() => store.getters.isCurrentlyDrawing)
    const projection = computed(() => store.state.position.projection)

    const freeMouseWheelInteraction = new MouseWheelZoom()
    const constrainedMouseWheelInteraction = new MouseWheelZoom({
        constrainResolution: true,
    })
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
    })
    watch(projection, setInteractionAccordingToProjection)

    function setInteractionAccordingToProjection() {
        const projectionIsLV95 = projection.value.epsg === LV95.epsg
        if (projectionIsLV95) {
            map.removeInteraction(freeMouseWheelInteraction)
            map.addInteraction(constrainedMouseWheelInteraction)
        } else {
            map.removeInteraction(constrainedMouseWheelInteraction)
            map.addInteraction(freeMouseWheelInteraction)
        }
    }

    setInteractionAccordingToProjection()

    const { onLeftClickDown, onLeftClickUp, onRightClick, onMouseMove } = useMouseOnMap()

    function onPointerDown(event) {
        onLeftClickDown(event.pixel, event.coordinate)
    }
    function onPointerUp(event) {
        switch (event.originalEvent.button) {
            case 0:
                onLeftClickUp(event.pixel, event.coordinate)
                break
            case 2:
                onRightClick(event.pixel, event.coordinate)
                break
        }
    }

    map.on('pointerdown', onPointerDown)
    map.on('pointerup', onPointerUp)
    map.on('movestart', onMouseMove)

    onBeforeUnmount(() => {
        map.un('pointerdown', onPointerDown)
        map.un('pointerup', onPointerUp)
        map.un('movestart', onMouseMove)
    })
}
