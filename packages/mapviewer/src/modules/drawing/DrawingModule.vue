<script setup lang="ts">
import type { EditableFeature } from '@swissgeo/api'
import type { LineString } from 'geojson'
import type Map from 'ol/Map'
import type { ComponentPublicInstance } from 'vue'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { kmlUtils } from '@swissgeo/api/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { WarningMessage } from '@swissgeo/log/Message'
import { computed, inject, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { DrawingInteractionExposed } from '@/modules/drawing/types/interaction'
import type { ActionDispatcher } from '@/store/types'

import AddVertexButtonOverlay from '@/modules/drawing/components/AddVertexButtonOverlay.vue'
import DrawingInteractions from '@/modules/drawing/components/DrawingInteractions.vue'
import DrawingToolbox from '@/modules/drawing/components/DrawingToolbox.vue'
import DrawingTooltip from '@/modules/drawing/components/DrawingTooltip.vue'
import useDrawingStore from '@/store/modules/drawing'
import addKmlFeaturesToDrawingLayer from '@/store/modules/drawing/utils/addKmlFeaturesToDrawingLayer'
import useLayersStore from '@/store/modules/layers'

const dispatcher: ActionDispatcher = { name: 'DrawingModule.vue' }

// OL map instance provided by the map module
const olMap = inject<Map>('olMap')

if (!olMap) {
    log.error({
        title: 'DrawingModule',
        titleColor: LogPreDefinedColor.Lime,
        messages: [
            'DrawingModule requires the olMap to be provided',
            'Please make sure the map module is loaded before the drawing module',
        ],
    })
    throw new Error('DrawingModule requires the olMap to be provided')
}

const drawingStore = useDrawingStore()
const layersStore = useLayersStore()

const drawingInteractions =
    useTemplateRef<ComponentPublicInstance<DrawingInteractionExposed>>('drawingInteractions')

const { t } = useI18n()

const selectedLineFeature = computed<EditableFeature | undefined>(() => {
    if (
        drawingStore.feature.current &&
        drawingStore.feature.current.geometry?.type === 'LineString' &&
        (drawingStore.feature.current.featureType === 'LINEPOLYGON' ||
            drawingStore.feature.current.featureType === 'MEASURE')
    ) {
        return drawingStore.feature.current
    }
    return undefined
})
const lineStringGeometry = computed<LineString | undefined>(() => {
    if (selectedLineFeature.value) {
        return selectedLineFeature.value.geometry as LineString
    }
    return undefined
})
const hasLoaded = computed<boolean>(() => {
    return (
        !layersStore.activeKmlLayer ||
        (!layersStore.activeKmlLayer.isLoading && !!layersStore.activeKmlLayer.kmlData)
    )
})

// Workaround for legacy drawings and icon set mapping
watch(
    () => drawingStore.iconSets,
    () => {
        const source = drawingStore.layer.ol?.getSource()
        if (!source) {
            return
        }
        log.debug({
            title: 'DrawingModule',
            titleColor: LogPreDefinedColor.Lime,
            messages: [
                'New icon sets available, updating all drawing features',
                source.getFeatures(),
            ],
        })

        drawingStore.feature.all.forEach((feature) => {
            if (feature.icon) {
                const iconArgs = kmlUtils.parseIconUrl(feature.icon.imageURL)
                const icon = kmlUtils.getIcon(
                    iconArgs,
                    undefined /*iconStyle*/,
                    drawingStore.iconSets,
                    () => {
                        // Fallback warning handler (Pinia app store could be used if available)
                        log.warn(
                            new WarningMessage('kml_icon_set_not_found', {
                                iconSetName: iconArgs.set,
                            })
                        )
                    }
                )
                if (icon) {
                    feature.icon = icon
                }
            }
        })
    }
)
watch(hasLoaded, (newState) => {
    if (newState) {
        addKmlFeaturesToDrawingLayer(layersStore.activeKmlLayer, {
            retryOnError: true,
        })
    }
})

onMounted(() => {
    if (drawingStore.layer.ol) {
        olMap.addLayer(drawingStore.layer.ol)
    } else {
        log.error({
            title: 'DrawingModule',
            titleColor: LogPreDefinedColor.Lime,
            messages: ['Drawing layer not found/not created'],
        })
    }

    // If a KML was previously created with the drawing module, add it back for further editing
    if (layersStore.activeKmlLayer) {
        if (hasLoaded.value) {
            addKmlFeaturesToDrawingLayer(layersStore.activeKmlLayer, {
                retryOnError: true,
            })
        }
    } else {
        drawingStore.setDrawingName(t('draw_layer_label'), dispatcher)
        drawingStore.setDrawingHasLoaded(true, dispatcher)
    }

    // Listening for "Delete" keystroke and right-click to remove last point
    document.addEventListener('keyup', removeLastPointOnDeleteKeyUp, { passive: true })
    document.addEventListener('contextmenu', removeLastPointOnRightClick, { passive: true })
})

onBeforeUnmount(() => {
    document.removeEventListener('contextmenu', removeLastPointOnRightClick)
    document.removeEventListener('keyup', removeLastPointOnDeleteKeyUp)
})

function removeLastPoint() {
    // Only delete the last point when we are drawing a feature (or editing it)
    if (!!drawingStore.edit.featureType || drawingStore.edit.mode === 'EXTEND') {
        drawingInteractions.value?.removeLastPoint()
    }
}

function removeLastPointOnRightClick(_event: MouseEvent) {
    removeLastPoint()
}

function removeLastPointOnDeleteKeyUp(event: KeyboardEvent) {
    if (event.key === 'Delete') {
        // Drawing modes will be checked by the function itself (no need to double-check)
        removeLastPoint()
    }
}

function closeDrawing() {
    drawingStore
        .closeDrawing(dispatcher)
        .then(() => {
            if (drawingStore.layer.ol) {
                olMap.removeLayer(drawingStore.layer.ol)
            }
        })
        .catch((error) => {
            log.error({
                title: 'DrawingModule',
                titleColor: LogPreDefinedColor.Lime,
                messages: ['Error while closing drawing', error],
            })
        })
}
</script>

<template>
    <div v-if="drawingStore.layer.hasLoaded">
        <DrawingToolbox
            @remove-last-point="removeLastPoint"
            @close-drawing="closeDrawing"
        />
        <DrawingTooltip />
        <DrawingInteractions ref="drawingInteractions" />
        <AddVertexButtonOverlay
            v-if="drawingStore.edit.mode === 'MODIFY' && lineStringGeometry"
            :coordinates="lineStringGeometry.coordinates"
        />
    </div>
    <div v-else>
        <FontAwesomeIcon
            icon="spinner"
            spin
        />
    </div>
</template>
