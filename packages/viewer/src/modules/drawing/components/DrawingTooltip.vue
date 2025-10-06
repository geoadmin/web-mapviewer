<script setup lang="ts">
import Overlay from 'ol/Overlay'
import { computed, inject, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type Map from 'ol/Map'
import type MapBrowserEvent from 'ol/MapBrowserEvent'
import type VectorLayer from 'ol/layer/Vector'

import { EditableFeatureTypes } from '@/api/features.api'
import { DRAWING_HIT_TOLERANCE } from '@/config/map.config'
import { getVertexCoordinates, pointWithinTolerance } from '@/modules/drawing/lib/drawingUtils'
import useFeaturesStore from '@/store/modules/features.store'
import useDrawingStore from '@/store/modules/drawing.store'
import type { SingleCoordinate } from '@swissgeo/coordinates'
import type Feature from 'ol/Feature'
import type { SimpleGeometry } from 'ol/geom'
import type { FeatureLike } from 'ol/Feature'

const cssPointer = 'cursor-pointer'
const cssGrab = 'cursor-grab'
const cssGrabbing = 'cursor-grabbing'

const olMap = inject<Map>('olMap')
const drawingLayer = inject<VectorLayer>('drawingLayer')
const { t } = useI18n()
const featuresStore = useFeaturesStore()
const drawingStore = useDrawingStore()
const tooltipText = ref('')
const drawingTooltip = useTemplateRef('drawingTooltip')

let lastPointerEvent: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent> | undefined
const selectedFeatures = computed(() => featuresStore.selectedFeatures)
const drawingMode = computed(() => drawingStore.mode)
const currentlySketchedFeature = computed(() => {
    // there can only be one drawing feature edited at the same time
    if (selectedFeatures.value.length === 1) {
        return selectedFeatures.value[0] as unknown as Feature<SimpleGeometry>
    }
    return undefined
})

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
watch(selectedFeatures, updateTooltip)

function onPointerMove(event: MapBrowserEvent<PointerEvent | KeyboardEvent | WheelEvent>) {
    // TODO: check if tooltipOverlay.setPosition(event.coordinate) can be used to set the position

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

    const hasFeatureSelected = selectedFeatures.value.length > 0
    // we only keep track of the first feature's info (the one on top of the stack)
    const selectedFeatureId = hasFeatureSelected ? selectedFeatures.value[0]?.id : undefined
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
            layerFilter: (layer) => layer === drawingLayer,
            hitTolerance: DRAWING_HIT_TOLERANCE,
        }
    )

    const pointFeatureTypes = [EditableFeatureTypes.Marker, EditableFeatureTypes.Annotation]
    const nonPointFeatureTypes = [EditableFeatureTypes.LinePolygon, EditableFeatureTypes.Measure]
    const featureDrawingMode = featureUnderCursor?.get('type').toUpperCase()

    const translations = []

    if (drawingMode.value) {
        if (currentlySketchedFeature.value && !pointFeatureTypes.includes(drawingMode.value)) {
            let hoveringFirstVertex = false
            let hoveringLastVertex = false
            // The last two coordinates seem to be some OL internal points we don't need.
            const coordinates = getVertexCoordinates(currentlySketchedFeature.value).slice(0, -2)

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
                    key: `draw_snap_first_point_${drawingMode.value}`,
                })
            } else if (hoveringLastVertex && coordinates.length > 1) {
                translations.push({ key: `draw_snap_last_point_${drawingMode.value}` })
            } else {
                translations.push({ key: `draw_next_${drawingMode.value}` })
            }

            if (coordinates.length > 1) {
                translations.push({ key: 'draw_delete_last_point' })
            }
        } else {
            translations.push({ key: `draw_start_${drawingMode.value}` })
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
                    const selectedFeature = selectedFeatures.value[0]
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
