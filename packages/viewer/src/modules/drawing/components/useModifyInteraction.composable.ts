import { computed, inject, onBeforeUnmount, onMounted, watch } from 'vue'
import type Map from 'ol/Map'
import type Feature from 'ol/Feature'
import type Collection from 'ol/Collection'
import { LineString, type Geometry, type SimpleGeometry } from 'ol/geom'
import ModifyInteraction, { type ModifyEvent } from 'ol/interaction/Modify'
import { noModifierKeys, primaryAction } from 'ol/events/condition'
import type MapBrowserEvent from 'ol/MapBrowserEvent'

import { DRAWING_HIT_TOLERANCE } from '@/config/map.config'
import { updateStoreFeatureCoordinatesGeometry } from '@/modules/drawing/lib/drawingUtils'
import { editingVertexStyleFunction } from '@/modules/drawing/lib/style'
import useSaveKmlOnChange from '@/modules/drawing/useKmlDataManagement.composable'
import useDrawingStore, { EditMode } from '@/store/modules/drawing.store'
import useFeaturesStore from '@/store/modules/features.store'
import type { ActionDispatcher } from '@/store/types'
import log from '@swissgeo/log'
import type { StyleFunction } from 'ol/style/Style'
import type { EditableFeature } from '@/api/features.api'

const dispatcher: ActionDispatcher = { name: 'useModifyInteraction.composable' }
const cursorGrabbingClass = 'cursor-grabbing'

export interface UseModifyInteractionOptions {
    features: Collection<Feature<Geometry>>
}

/**
 * Enable modifying selected features (drag vertices, delete with right click).
 * Assumes `features` is the same collection used by the select interaction.
 */
export default function useModifyInteraction(features: Collection<Feature<Geometry>>) {
    const featuresStore = useFeaturesStore()
    const drawingStore = useDrawingStore()

    const editMode = computed(() => drawingStore.editingMode)
    const reverseLineStringExtension = computed(() => drawingStore.reverseLineStringExtension)

    // Inject OL Map instance (provided by map module)
    const olMap = inject<Map>('olMap')!

    const { willModify, debounceSaveDrawing } = useSaveKmlOnChange()

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
        // Provide proper geodesic segment math
        // TODO: see if those functions are still needed
        // segmentExtentFunction: segmentExtent as any,
        // subsegmentsFunction: subsegments as any,
        // Handle world wrapping properly
        // pointerWrapX: true,
        wrapX: true,
    })

    watch(
        editMode,
        (newValue) => {
            if (newValue === EditMode.EXTEND && features.getLength() > 0) {
                const selectedFeature = features.item(0)
                if (selectedFeature && reverseLineStringExtension.value) {
                    const geom = selectedFeature.getGeometry()
                    // Only reverse for LineString geometries
                    if (geom && geom instanceof LineString) {
                        const coords = geom.getCoordinates()
                        geom.setCoordinates(coords.slice().reverse())
                    }
                }
                modifyInteraction.setActive(false)
            } else if (newValue === EditMode.MODIFY) {
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
        drawingStore.setEditingMode(EditMode.OFF, reverseLineStringExtension.value, dispatcher)

        olMap.removeInteraction(modifyInteraction)

        modifyInteraction.un('modifyend', onModifyEnd)
        modifyInteraction.un('modifystart', onModifyStart)
    })

    function removeLastPoint() {
        if (editMode.value === EditMode.OFF) {
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
                updateStoreFeatureCoordinatesGeometry(feature as Feature<SimpleGeometry>, dispatcher)
            }
        }
    }

    function onModifyStart(evt: ModifyEvent) {
        const feature = evt.features.getLength() > 0 ? evt.features.item(0) : undefined
        if (!feature) {
            return
        }

        featuresStore.changeFeatureIsDragged(
            {
                feature: feature.get('editableFeature'),
                isDragged: true,
            },
            dispatcher
        )

        const targetEl = olMap.getTargetElement?.() ?? (olMap.getTarget() as HTMLElement | null)
        targetEl?.classList.add(cursorGrabbingClass)

        willModify()
    }

    function onModifyEnd(evt: ModifyEvent) {
        if (!evt.features) {
            return
        }

        const feature = evt.features.getLength() > 0 ? evt.features.item(0) : undefined
        if (!feature) {
            return
        }

        const storeFeature: EditableFeature = feature.get('editableFeature')

        featuresStore.changeFeatureIsDragged(
            {
                feature: storeFeature,
                isDragged: false,
            },
            dispatcher
        )

        updateStoreFeatureCoordinatesGeometry(feature as Feature<SimpleGeometry>, dispatcher)

        const targetEl = olMap.getTargetElement?.() ?? (olMap.getTarget() as HTMLElement | null)
        targetEl?.classList.remove(cursorGrabbingClass)

        debounceSaveDrawing().catch((error: Error) => {
            log.error(
                `Error while saving drawing after modification of feature ${storeFeature.id}: ${error}`
            )
        })
    }

    return {
        removeLastPoint,
    }
}