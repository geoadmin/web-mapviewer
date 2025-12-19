<script setup lang="ts">
import type { EditableFeatureTypes } from '@swissgeo/api'
import type { SingleCoordinate } from '@swissgeo/coordinates'
import type Feature from 'ol/Feature'
import type { FeatureLike } from 'ol/Feature'
import type { SimpleGeometry } from 'ol/geom'
import type Map from 'ol/Map'
import type MapBrowserEvent from 'ol/MapBrowserEvent'

import { DRAWING_HIT_TOLERANCE } from '@swissgeo/staging-config/constants'
import Overlay from 'ol/Overlay'
import { inject, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { getVertexCoordinates, pointWithinTolerance } from '@/modules/drawing/lib/drawingUtils'
import useDrawingStore from '@/store/modules/drawing'

const cssPointer = 'cursor-pointer'
const cssGrab = 'cursor-grab'
const cssGrabbing = 'cursor-grabbing'

const olMap = inject<Map>('olMap')
const { t } = useI18n()
const drawingStore = useDrawingStore()
const tooltipText = ref('')
const drawingTooltip = useTemplateRef('drawingTooltip')

let lastPointerEvent: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent> | undefined

const tooltipOverlay = new Overlay({
    offset: [15, 15],
    positioning: 'top-left',
    // so that the tooltip is not on top of the style popup (and its children popup)
    stopEvent: false,
    insertFirst: true,
})

onMounted(() => {
    tooltipOverlay.setElement(drawingTooltip.value ?? undefined)
    olMap?.addOverlay(tooltipOverlay)
    olMap?.on('pointermove', onPointerMove)
})

onBeforeUnmount(() => {
    tooltipOverlay.setElement(undefined)
    olMap?.removeOverlay(tooltipOverlay)
    olMap?.un('pointermove', onPointerMove)
})
watch(() => drawingStore.feature.current, updateTooltip)

function onPointerMove(event: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>) {
    tooltipOverlay.setPosition(event.coordinate)
    lastPointerEvent = event
    updateTooltip()
}

function updateTooltip() {
    if (!lastPointerEvent) {
        return
    }

    const mapElement = olMap!.getTarget()
    if (!mapElement || !(mapElement instanceof HTMLElement)) {
        return
    }
    if (mapElement.classList.contains(cssGrabbing)) {
        mapElement.classList.remove(cssGrab)
        return
    }

    // detecting features under the mouse cursor
    let hoveringSelectableFeature = false
    let hoveringSelectedFeature = false

    const hasFeatureSelected = !!drawingStore.feature.current
    // we only keep track of the first feature's info (the one on top of the stack)
    const selectedFeatureId = drawingStore.feature.current?.id
    let featureUnderCursor: Feature<SimpleGeometry> | undefined

    olMap?.forEachFeatureAtPixel(
        lastPointerEvent.pixel,
        (feature: FeatureLike) => {
            // Keeping track that features are being hovered (even if not selected)
            hoveringSelectableFeature = true

            const isSelectedFeature = hasFeatureSelected && selectedFeatureId === feature.getId()

            hoveringSelectedFeature = hoveringSelectedFeature || isSelectedFeature
            // subsequent features will be ignored as featureUnderCursor will already be set
            if (!featureUnderCursor || isSelectedFeature) {
                featureUnderCursor = feature as Feature<SimpleGeometry>
            }
        },
        {
            layerFilter: (layer) => layer === drawingStore.layer.ol,
            hitTolerance: DRAWING_HIT_TOLERANCE,
        }
    )

    const pointFeatureTypes: EditableFeatureTypes[] = ['MARKER', 'ANNOTATION']
    const nonPointFeatureTypes: EditableFeatureTypes[] = ['LINEPOLYGON', 'MEASURE']
    const featureDrawingMode = featureUnderCursor?.get('type').toUpperCase()

    const translations = []

    if (drawingStore.edit.featureType) {
        if (
            featureUnderCursor &&
            drawingStore.feature.current &&
            drawingStore.feature.current.geometry &&
            !pointFeatureTypes.includes(drawingStore.edit.featureType)
        ) {
            let hoveringFirstVertex = false
            let hoveringLastVertex = false
            // The last two coordinates seem to be some OL internal points we don't need.
            const coordinates = getVertexCoordinates(featureUnderCursor).slice(0, -2)

            coordinates.some((coordinate, index) => {
                const pixel = olMap!.getPixelFromCoordinate(coordinate)
                if (
                    pointWithinTolerance(
                        pixel as SingleCoordinate,
                        lastPointerEvent?.pixel as SingleCoordinate,
                        DRAWING_HIT_TOLERANCE
                    )
                ) {
                    hoveringFirstVertex = index === 0
                    hoveringLastVertex = index === coordinates.length - 1
                    // Abort loop. We have what we need.
                    return true
                }
            })

            if (hoveringFirstVertex && coordinates.length > 2) {
                translations.push({
                    key: `draw_snap_first_point_${drawingStore.edit.featureType}`,
                })
            } else if (hoveringLastVertex && coordinates.length > 1) {
                translations.push({ key: `draw_snap_last_point_${drawingStore.edit.featureType}` })
            } else {
                translations.push({ key: `draw_next_${drawingStore.edit.featureType}` })
            }

            if (coordinates.length > 1) {
                translations.push({ key: 'draw_delete_last_point' })
            }
        } else {
            translations.push({ key: `draw_start_${drawingStore.edit.featureType}` })
        }
    } else {
        if (hoveringSelectedFeature && olMap) {
            const hoveringVertex = getVertexCoordinates(featureUnderCursor!).some((coordinate) => {
                const pixel = olMap.getPixelFromCoordinate(coordinate)
                return pointWithinTolerance(
                    pixel as SingleCoordinate,
                    lastPointerEvent?.pixel as SingleCoordinate,
                    DRAWING_HIT_TOLERANCE
                )
            })
            if (hoveringVertex) {
                if (nonPointFeatureTypes.includes(featureDrawingMode)) {
                    const selectedFeature = drawingStore.feature.current
                    const geometryType = selectedFeature!.geometry!.type.toLowerCase()
                    translations.push({
                        key: `modify_existing_vertex_line`,
                        params: {
                            minAmount: geometryType === 'polygon' ? 3 : 2,
                        },
                    })
                    translations.push({ key: 'modify_move_vertex_line' })
                } else {
                    translations.push({ key: `modify_existing_vertex_${featureDrawingMode}` })
                }
                mapElement.classList.remove(cssPointer)
                mapElement.classList.add(cssGrab)
            } else {
                if (nonPointFeatureTypes.includes(featureDrawingMode)) {
                    translations.push({ key: `modify_new_vertex_line` })
                    translations.push({ key: `modify_existing_vertex_line_2` })
                } else {
                    translations.push({ key: `select_feature_${featureDrawingMode}` })
                }

                mapElement.classList.add(cssPointer)
                mapElement.classList.remove(cssGrab)
            }
        } else if (hoveringSelectableFeature) {
            mapElement.classList.add(cssPointer)
            mapElement.classList.remove(cssGrab)

            // Display a help tooltip when selecting
            if (featureDrawingMode) {
                translations.push({ key: `select_feature_${featureDrawingMode}` })
            } else {
                translations.push({ key: 'select_no_feature' })
            }
        } else {
            translations.push({ key: 'select_no_feature' })
        }
    }

    tooltipText.value = translations
        .map((translation) => t(translation.key.toLowerCase(), translation.params!))
        .join('<br>')
}
</script>

<template>
    <!-- eslint-disable vue/no-v-html-->
    <div
        ref="drawingTooltip"
        class="drawing-tooltip"
        v-html="tooltipText"
    />
    <!-- eslint-enable vue/no-v-html-->
</template>

<style lang="scss" scoped>
.drawing-tooltip {
    background-color: rgba(140, 140, 140, 0.9);
    border-radius: 4px;
    color: white;
    padding: 2px 8px;
    font-size: 12px;
    pointer-events: none;
}
</style>
