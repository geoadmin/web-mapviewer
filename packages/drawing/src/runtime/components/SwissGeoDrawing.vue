<script setup lang="ts">
import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { KMLLayer } from '@swissgeo/layers'
import type { Staging } from '@swissgeo/staging-config'
import type { ActionDispatcher } from '~/types/drawingStore'
import type { Map as OLMap } from 'ol'
import type { Raw } from 'vue'

import { LV95 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import { addKmlFeaturesToDrawingLayer, logConfig, useDrawingStore } from '#imports'
import { watch, computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

const dispatcher: ActionDispatcher = {
    name: 'SwissGeoDrawing.vue',
}

const emits = defineEmits<{
    close: [layer?: KMLLayer]
}>()

const {
    olMap,
    projection = LV95,
    online = false,
    description,
    debug,
} = defineProps<{
    olMap: Raw<OLMap>
    projection?: CoordinateSystem
    online?: boolean
    description?: string
    debug?: {
        staging?: Staging
        testMode?: boolean
    }
}>()

const { staging = 'production', testMode = false } = debug ?? {}

const drawingHasBeenInitialized = ref<boolean>(false)

const drawingInteractions = useTemplateRef('drawingInteractions')

const { t } = useI18n()

const drawingStore = useDrawingStore()
const hasLoaded = computed<boolean>(() => {
    return drawingStore.layer.config?.isLoading === false && !!drawingStore.layer.config?.kmlData
})

onMounted(() => {
    if (!olMap) {
        const message = 'This modules requires the olMap to be provided'
        log.error({
            ...logConfig(),
            messages: [message],
        })
        throw new Error(message)
    }
    if (projection.epsg !== LV95.epsg) {
        drawingStore.setDrawingProjection(projection, dispatcher)
    }
    if (staging !== 'production' || testMode) {
        drawingStore.setDrawingDebugConfig(
            {
                staging,
                retryOnError: !testMode,
                quickDebounce: testMode,
            },
            dispatcher
        )
    }
    drawingStore
        .initiateDrawing(
            {
                olMap,
                online,
                description,
            },
            dispatcher
        )
        .then(() => {
            drawingHasBeenInitialized.value = true
            log.debug({
                ...logConfig(),
                messages: ['Drawing module was initialized successfully'],
            })
        })
        .catch((error) => {
            log.error({
                ...logConfig(),
                messages: ['Error while initializing the drawing module', error],
            })
        })
    // If a KML was previously created with the drawing module, add it back for further editing
    if (drawingStore.layer.config) {
        if (hasLoaded.value) {
            addKmlFeaturesToDrawingLayer(drawingStore.layer.config, { retryOnError: true })
        }
    } else {
        drawingStore.setDrawingName(t('@swissgeo/drawing.draw_layer_label'), dispatcher)
    }

    // Listening for "Delete" keystroke and right-click to remove last point
    document.addEventListener('keyup', removeLastPointOnDeleteKeyUp, { passive: true })
    document.addEventListener('contextmenu', removeLastPointOnRightClick, { passive: true })
    window.addEventListener('beforeunload', beforeUnloadHandler)
})
onBeforeUnmount(() => {
    document.removeEventListener('contextmenu', removeLastPointOnRightClick)
    document.removeEventListener('keyup', removeLastPointOnDeleteKeyUp)
    window.removeEventListener('beforeunload', beforeUnloadHandler)
})

watch(
    () => drawingStore.state,
    (newState) => {
        if (newState === 'CLOSED') {
            emits('close', drawingStore.layer.config)
        }
    }
)

const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (drawingStore.showWarningAdminLinkNotCopied) {
        drawingStore.closeDrawing(dispatcher).catch((error) =>
            log.error({
                ...logConfig(),
                messages: [`Failed to close drawing: `, error],
            })
        )
        event.preventDefault()
    }
}

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
</script>

<template>
    <SwissGeoDrawingInteractions
        v-if="drawingHasBeenInitialized"
        ref="drawingInteractions"
    />
    <slot />
</template>
