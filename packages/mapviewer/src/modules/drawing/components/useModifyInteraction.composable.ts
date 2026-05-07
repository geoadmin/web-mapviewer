import type Collection from 'ol/Collection'
import type Feature from 'ol/Feature'
import type { Geometry, SimpleGeometry } from 'ol/geom'
import type { ModifyEvent } from 'ol/interaction/Modify'
import type Map from 'ol/Map'
import type MapBrowserEvent from 'ol/MapBrowserEvent'
import type { StyleFunction } from 'ol/style/Style'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { DRAWING_HIT_TOLERANCE } from '@swissgeo/staging-config/constants'
import { noModifierKeys, primaryAction } from 'ol/events/condition'
import { LineString } from 'ol/geom'
import ModifyInteraction from 'ol/interaction/Modify'
import { inject, onBeforeUnmount, onMounted, watch } from 'vue'

import type { ActionDispatcher } from '@/store/types'

import { updateStoreFeatureCoordinatesGeometry } from '@/modules/drawing/lib/drawingUtils'
import { editingVertexStyleFunction } from '@/modules/drawing/lib/style'
import useDrawingStore from '@/store/modules/drawing'

const dispatcher: ActionDispatcher = { name: 'useModifyInteraction.composable' }
const cursorGrabbingClass = 'cursor-grabbing'

export interface UseModifyInteractionOptions {
    features: Collection<Feature<Geometry>>
}

/**
 * Enable modifying selected features (drag vertices, delete with right click). Assumes `features`
 * is the same collection used by the select interaction.
 */
export default function useModifyInteraction(features: Collection<Feature<Geometry>>) {
    const drawingStore = useDrawingStore()

    // Inject OL Map instance (provided by map module)
    const olMap = inject<Map>('olMap')

    if (!olMap) {
        log.error({
            title: 'useModifyInteraction',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['olMap is undefined'],
        })
        throw new Error('olMap is undefined')
    }

    const modifyInteraction = new ModifyInteraction({
        features,
        // Style for editing vertices
        style: editingVertexStyleFunction as StyleFunction,
        // Allow drag with primary action, and allow vertex selection via right click without modifiers
        condition: (event: MapBrowserEvent<KeyboardEvent | WheelEvent | PointerEvent>) =>
            primaryAction(event) ||
            (event.type === 'pointerdown' &&
                // right-click
                // @ts-expect-error: originalEvent is not fully typed
                event.originalEvent?.button === 2 &&
                noModifierKeys(event)),
        // Delete with contextmenu + no modifiers
        deleteCondition: (event: MapBrowserEvent<KeyboardEvent | WheelEvent | PointerEvent>) =>
            event.type === 'contextmenu' && noModifierKeys(event),
        // Hit tolerance tweak (Modify uses a slightly different computation)
        pixelTolerance: DRAWING_HIT_TOLERANCE + 2,
    })

    watch(
        () => drawingStore.edit.mode,
        (newValue) => {
            if (newValue === 'EXTEND' && features.getLength() > 0) {
                const selectedFeature = features.item(0)
                if (selectedFeature && drawingStore.edit.reverseLineStringExtension) {
                    const geom = selectedFeature.getGeometry()
                    // Only reverse for LineString geometries
                    if (geom && geom instanceof LineString) {
                        const coords = geom.getCoordinates()
                        geom.setCoordinates(coords.slice().reverse())
                    }
                }
                modifyInteraction.setActive(false)
            } else if (newValue === 'MODIFY') {
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
        drawingStore.setEditingMode('OFF', drawingStore.edit.reverseLineStringExtension, dispatcher)

        olMap.removeInteraction(modifyInteraction)

        modifyInteraction.un('modifyend', onModifyEnd)
        modifyInteraction.un('modifystart', onModifyStart)
    })

    function removeLastPoint() {
        if (drawingStore.edit.mode === 'OFF') {
            return
        }

        if (modifyInteraction.getActive() && features.getLength() > 0) {
            const feature = features.item(0)
            const geometry = feature?.getGeometry()
            // @ts-expect-error: geometry coordinate shape not narrowed
            const coordinates = geometry?.getCoordinates?.()
            if (Array.isArray(coordinates) && coordinates.length > 2) {
                coordinates.pop()
                // @ts-expect-error: geometry coordinate shape not narrowed
                geometry?.setCoordinates?.(coordinates)
            }
            if (feature) {
                // Update the store copy of the feature’s geometry
                updateStoreFeatureCoordinatesGeometry(
                    feature as Feature<SimpleGeometry>,
                    dispatcher
                )
            }
        }
    }

    function onModifyStart(evt: ModifyEvent) {
        const feature = evt.features.getLength() > 0 ? evt.features.item(0) : undefined
        if (!feature) {
            return
        }

        const targetEl = olMap.getTargetElement?.() ?? (olMap.getTarget() as HTMLElement | null)
        targetEl?.classList.add(cursorGrabbingClass)
    }

    function onModifyEnd(evt: ModifyEvent) {
        if (!evt.features) {
            return
        }

        const feature = evt.features.getLength() > 0 ? evt.features.item(0) : undefined
        if (!feature) {
            return
        }

        updateStoreFeatureCoordinatesGeometry(feature as Feature<SimpleGeometry>, dispatcher)

        const targetEl = olMap.getTargetElement?.() ?? (olMap.getTarget() as HTMLElement | null)
        targetEl?.classList.remove(cursorGrabbingClass)
    }

    return {
        removeLastPoint,
    }
}
