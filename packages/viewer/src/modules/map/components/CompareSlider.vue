<script setup lang="ts">
import type RenderEvent from 'ol/render/Event'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { LayerType } from '@swissgeo/layers'
import { round } from '@swissgeo/numbers'
import Map from 'ol/Map'
import { getRenderPixel } from 'ol/render'
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { ActionDispatcher } from '@/store/types'

import useLayersStore from '@/store/modules/layers'
import useUIStore from '@/store/modules/ui'

const dispatcher: ActionDispatcher = { name: 'CompareSlider.vue' }

const olMap = inject<Map>('olMap')

const compareSliderOffset = ref(0)
const showLayerName = ref(false)
const compareRatio = ref(-0.5)
const uiStore = useUIStore()
const layersStore = useLayersStore()

const storeCompareRatio = computed(() => uiStore.compareRatio)
const clientWidth = computed(() => uiStore.width)
const compareSliderPosition = computed(() => {
    return {
        left: compareRatio.value * 100 + '%',
    }
})
const visibleLayerOnTop = computed(() => layersStore.visibleLayerOnTop)
const shouldUseWebGlContext = computed(() => visibleLayerOnTop.value?.type === LayerType.COG)

watch(storeCompareRatio, (newValue) => {
    if (newValue) {
        compareRatio.value = newValue
        olMap?.render()
    }
})

watch(
    visibleLayerOnTop,
    (newLayerOnTop, oldLayerOnTop) => {
        if (!newLayerOnTop) {
            return
        }

        if (oldLayerOnTop) {
            unRegisterRenderingEvents(oldLayerOnTop.id, oldLayerOnTop.uuid)
        }
        if (getLayerFromMapById(newLayerOnTop.id, newLayerOnTop.uuid)) {
            registerRenderingEvents(newLayerOnTop.id, newLayerOnTop.uuid)
            olMap?.render()
        } else {
            // There are cases where the layer config and layer store are
            // modified and updated before the map. This means we need to delay
            // the event which bind the rendering event to the layer. This
            // happens in general at startup, especially if the layer itself is
            // quite big.

            // To mitigate the issue, we ask the map add the rendering functions
            // either when the 'precompose' event is fired (for WebGL layers) or
            // a 'rendercomplete' event is fired (for canvas layers).
            // This ensure we link the rendering function to the layer as soon
            // as possible.git
            olMap?.once(shouldUseWebGlContext.value ? 'precompose' : 'rendercomplete', () => {
                registerRenderingEvents(newLayerOnTop.id, newLayerOnTop.uuid)
                olMap.render()
            })
        }
    },
    // Neccessary for the compare slider to work for external layers, because if the layer takes longer to load on the map,
    // the registerRenderingEvents function called in the onMounted hook can not find the layer from the map and therefore the compare slider does not work.
    // This makes it necessary to wait for the precompose event of the map to call the registerRenderingEvents function.
    { immediate: true }
)

onMounted(() => {
    if (storeCompareRatio.value) {
        compareRatio.value = storeCompareRatio.value
        olMap?.render()
    }
})

onBeforeUnmount(() => {
    if (storeCompareRatio.value) {
        compareRatio.value = storeCompareRatio.value
        if (visibleLayerOnTop.value) {
            unRegisterRenderingEvents(visibleLayerOnTop.value.id, visibleLayerOnTop.value.uuid)
        }
        olMap?.render()
    }
})

function registerRenderingEvents(layerId: string, layerUuid: string) {
    const layer = getLayerFromMapById(layerId, layerUuid)

    // When loading a layer for the first time, we might need to clean the
    // context to ensure it is also cut correctly upon activating the compare slider
    // or loading a new COG layer on top.
    layer?.once('prerender', (event) => {
        if (event.context && useWebGLContext(event.context)) {
            event.context.clear(
                // sorry
                event.context.COLOR_BUFFER_BIT
            )
        }
    })
    layer?.on('prerender', onPreRender)
    layer?.on('postrender', onPostRender)
}

function unRegisterRenderingEvents(layerId: string, layerUuid: string) {
    const layer = getLayerFromMapById(layerId, layerUuid)
    layer?.un('prerender', onPreRender)
    layer?.un('postrender', onPostRender)
}

function getLayerFromMapById(layerId: string, layerUuid: string) {
    return olMap
        ?.getAllLayers()
        .toSorted((a, b) => b.get('zIndex') - a.get('zIndex'))
        .find((layer) => layer.get('id') === layerId && layer.get('uuid') === layerUuid)
}

function onPreRenderWebGL(event: RenderEvent, context: WebGLRenderingContext) {
    context.enable(context.SCISSOR_TEST)
    const mapSize = olMap?.getSize()

    if (!mapSize) {
        return
    }

    // get render coordinates and dimensions given CSS coordinates
    const bottomLeft = getRenderPixel(event, [0, mapSize[1]!])
    const topRight = getRenderPixel(event, [mapSize[0]!, 0])

    let width = topRight[0]! - bottomLeft[0]!
    const height = topRight[1]! - bottomLeft[1]!

    if (compareRatio.value < 1.0 && compareRatio.value > 0.0) {
        width = Math.round(width * compareRatio.value)
    }
    // We need to clear the color of the context. If we don't, the slider
    // will leave the right side of the slider drawn on startup or when
    // moving the slider.
    context.clear(context.COLOR_BUFFER_BIT)

    context.scissor(bottomLeft[0]!, bottomLeft[1]!, width, height)
}

function onPreRender2d(_event: RenderEvent, context: CanvasRenderingContext2D) {
    const width =
        compareRatio.value > 0 && compareRatio.value < 1.0
            ? compareRatio.value * context.canvas.width
            : context.canvas.width
    context.save()
    context.beginPath()
    context.rect(0, 0, width, context.canvas.height)
    context.clip()
}

function useWebGLContext(
    _context: WebGLRenderingContext | CanvasRenderingContext2D
): _context is WebGLRenderingContext {
    return shouldUseWebGlContext.value
}

function onPreRender(event: RenderEvent) {
    const context = event.context

    if (!context) {
        return
    }

    if (useWebGLContext(context)) {
        onPreRenderWebGL(event, context)
    } else {
        onPreRender2d(event, context)
    }
}

function onPostRender(event: RenderEvent) {
    const context = event.context

    if (!context) {
        return
    }

    if (useWebGLContext(context)) {
        context.disable(context.SCISSOR_TEST)
    } else {
        context.restore()
    }
}

function grabSlider(event: TouchEvent | MouseEvent) {
    window.addEventListener('mousemove', listenToMouseMove, { passive: true })
    window.addEventListener('touchmove', listenToTouchEvent, { passive: true })

    window.addEventListener('mouseup', releaseSlider, { passive: true })
    window.addEventListener('touchend', releaseSlider, { passive: true })

    if (event.type === 'touchstart') {
        const _event = event as TouchEvent
        compareSliderOffset.value =
            _event.touches[0]?.clientX || 0 - compareRatio.value * clientWidth.value
    } else {
        const _event = event as MouseEvent
        compareSliderOffset.value = _event.clientX - compareRatio.value * clientWidth.value
    }
}

function updateSliderPosition(currentPosition: number) {
    // we ensure the slider can't get off the screen
    if (currentPosition < 14) {
        currentPosition = 14
    }
    // same on the other side, but with also the idea of keeping the cartes completely in the screen
    if (currentPosition > clientWidth.value - 14) {
        currentPosition = clientWidth.value - 14
    }

    compareRatio.value = round(currentPosition / clientWidth.value, 3)
    olMap?.render()
}

function listenToMouseMove(event: MouseEvent) {
    const currentPosition = event.clientX - compareSliderOffset.value

    updateSliderPosition(currentPosition)
}

function listenToTouchEvent(event: TouchEvent) {
    const currentPosition = event.touches[0]?.clientX || 0 - compareSliderOffset.value
    updateSliderPosition(currentPosition)
}

function releaseSlider() {
    window.removeEventListener('mousemove', listenToMouseMove)
    window.removeEventListener('touchmove', listenToTouchEvent)
    window.removeEventListener('mouseup', releaseSlider)
    window.removeEventListener('touchend', releaseSlider)
    compareSliderOffset.value = 0
    uiStore.setCompareRatio(compareRatio.value, dispatcher)
}
</script>

<template>
    <div
        class="compare-slider position-absolute translate-middle-x d-inline-block top-0 h-100"
        data-cy="compareSlider"
        :style="compareSliderPosition"
        @touchstart.passive="grabSlider"
        @mousedown.passive="grabSlider"
        @mouseenter="showLayerName = true"
        @mouseleave="showLayerName = false"
    >
        <FontAwesomeIcon
            class="compare-slider-caret-left bg-primary rounded-start text-white"
            :icon="['fas', 'caret-left']"
        />
        <div class="compare-slider-line" />
        <FontAwesomeIcon
            class="compare-slider-caret-right bg-primary rounded-end text-white"
            :icon="['fas', 'caret-right']"
        />
        <div
            v-if="showLayerName"
            class="compare-slider-layer-name text-break"
        >
            <FontAwesomeIcon
                icon="arrow-left"
                class="me-1"
            />
            <strong data-cy="comparedLayerName">{{ visibleLayerOnTop?.name }}</strong>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
@import '@/scss/media-query.mixin';

.compare-slider {
    width: 40px;
    z-index: $zindex-compare-slider;
    cursor: ew-resize;
    &-caret-left,
    &-caret-right {
        position: inherit;
        top: 50%;
        z-index: inherit;
        padding: 2px 6px;
    }
    &-caret-right {
        translate: 20px;
    }
    &-line {
        position: relative;
        margin: auto;
        width: 4px;
        height: 100%;
        background: $primary;
        z-index: inherit;
    }
    &-layer-name {
        position: absolute;
        width: 120px;
        z-index: $zindex-compare-slider;
        bottom: $screen-padding-for-ui-elements;
        background: $white;
        right: 30px;
        padding: 0.2rem 0.4rem;
        font-size: 0.8rem;
    }
}

@include respond-above(phone) {
    .compare-slider {
        &-layer-name {
            bottom: calc($screen-padding-for-ui-elements + $footer-height);
        }
    }
}
</style>
