<script setup>
import Overlay from 'ol/Overlay'
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { DRAWING_HIT_TOLERANCE } from '@/config'
import { getVertexCoordinates, pointWithinTolerance } from '@/modules/drawing/lib/drawingUtils'

const cssPointer = 'cursor-pointer'
const cssGrab = 'cursor-grab'
const cssGrabbing = 'cursor-grabbing'

const olMap = inject('olMap')
const drawingLayer = inject('drawingLayer')
const i18n = useI18n()
const store = useStore()

const tooltipText = ref('')
const drawingTooltip = ref(null)

const selectedFeatures = computed(() => store.state.features.selectedFeatures)
const drawingMode = computed(() => store.state.drawing.mode)

const tooltipOverlay = new Overlay({
    offset: [15, 15],
    positioning: 'top-left',
    // so that the tooltip is not on top of the style popup (and its children popup)
    stopEvent: false,
    insertFirst: true,
})

onMounted(() => {
    tooltipOverlay.setElement(drawingTooltip.value)
    olMap.addOverlay(tooltipOverlay)
    olMap.on('pointermove', onPointerMove)
})
onBeforeUnmount(() => {
    tooltipOverlay.setElement(null)
    olMap.removeOverlay(tooltipOverlay)
    olMap.un('pointermove', onPointerMove)
})

function onPointerMove(event) {
    // moving the tooltip with the mouse cursor
    tooltipOverlay.setPosition(event.coordinate)

    const mapElement = olMap.getTarget()

    if (mapElement.classList.contains(cssGrabbing)) {
        mapElement.classList.remove(cssGrab)
        return
    }

    // detecting features under the mouse cursor
    let hoveringSelectableFeature = false
    let hoveringSelectedFeature = false

    const hasFeatureSelected = selectedFeatures.value.length > 0
    // we only keep track of the first feature's info (the one on top of the stack)
    const selectedFeatureId = hasFeatureSelected ? selectedFeatures.value[0]?.id : null
    let featureUnderCursor

    olMap.forEachFeatureAtPixel(
        event.pixel,
        (feature) => {
            // Keeping track that features are being hovered (even if not selected)
            hoveringSelectableFeature = true

            const isSelectedFeature = hasFeatureSelected && selectedFeatureId === feature.getId()

            hoveringSelectedFeature = hoveringSelectedFeature || isSelectedFeature
            // subsequent features will be ignored as featureUnderCursor will already be set
            if (!featureUnderCursor || isSelectedFeature) {
                featureUnderCursor = feature
            }
        },
        {
            layerFilter: (layer) => layer === drawingLayer,
            hitTolerance: DRAWING_HIT_TOLERANCE,
        }
    )

    const pointFeatureTypes = [EditableFeatureTypes.MARKER, EditableFeatureTypes.ANNOTATION]
    let featureDrawingMode = featureUnderCursor?.get('type').toUpperCase()
    let translationKeys

    if (hoveringSelectedFeature) {
        mapElement.classList.add(cssGrab)
        mapElement.classList.remove(cssPointer)

        let hoveringVertex = getVertexCoordinates(featureUnderCursor).some((coordinate) => {
            let pixel = olMap.getPixelFromCoordinate(coordinate)
            return pointWithinTolerance(pixel, event.pixel, DRAWING_HIT_TOLERANCE)
        })

        // Display a help tooltip when modifying
        if (hoveringVertex || pointFeatureTypes.includes(featureDrawingMode)) {
            translationKeys = `modify_existing_vertex_${featureDrawingMode}`
        } else {
            translationKeys = `modify_new_vertex_${featureDrawingMode}`
        }
    } else if (hoveringSelectableFeature) {
        mapElement.classList.add(cssPointer)
        mapElement.classList.remove(cssGrab)

        // Display a help tooltip when selecting
        if (drawingMode.value) {
            translationKeys = `select_feature_${drawingMode.value}`
        } else {
            translationKeys = 'select_no_feature'
        }
    } else {
        mapElement.classList.remove(cssPointer)
        mapElement.classList.remove(cssGrab)

        // Display a help tooltip when drawing
        if (drawingMode.value) {
            if (this.currentlySketchedFeature && !pointFeatureTypes.includes(drawingMode.value)) {
                let hoveringFirstVertex = false
                let hoveringLastVertex = false
                // The last two coordinates seem to be some OL internal points we don't need.
                let coordinates = getVertexCoordinates(this.currentlySketchedFeature).slice(0, -2)

                coordinates.some((coordinate, index) => {
                    let pixel = olMap.getPixelFromCoordinate(coordinate)
                    if (pointWithinTolerance(pixel, event.pixel, DRAWING_HIT_TOLERANCE)) {
                        hoveringFirstVertex = index === 0
                        hoveringLastVertex = index === coordinates.length - 1
                        // Abort loop. We have what we need.
                        return true
                    }
                })

                if (hoveringFirstVertex && coordinates.length > 2) {
                    translationKeys = `draw_snap_first_point_${drawingMode.value}`
                } else if (hoveringLastVertex && coordinates.length > 1) {
                    translationKeys = `draw_snap_last_point_${drawingMode.value}`
                } else {
                    translationKeys = `draw_next_${drawingMode.value}`
                }

                if (coordinates.length > 1) {
                    translationKeys = [translationKeys, 'draw_delete_last_point']
                }
            } else {
                translationKeys = `draw_start_${drawingMode.value}`
            }
        } else {
            translationKeys = 'select_no_feature'
        }
    }

    updateTooltipText(translationKeys)
}
function updateTooltipText(translationKeys) {
    let keys = []
    if (Array.isArray(translationKeys)) {
        keys.push(...translationKeys)
    } else {
        keys.push(translationKeys)
    }

    tooltipText.value = keys
        .map((key) => key.toLowerCase())
        .map((key) => i18n.t(key))
        .join('<br>')
}
</script>

<template>
    <!-- eslint-disable vue/no-v-html-->
    <div ref="drawingTooltip" class="drawing-tooltip" v-html="tooltipText" />
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
