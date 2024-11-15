<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { getRenderPixel } from 'ol/render'
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import LayerTypes from '@/api/layers/LayerTypes.enum'
import { round } from '@/utils/numberUtils'

const dispatcher = { dispatcher: 'CompareSlider.vue' }

const olMap = inject('olMap')

const compareSliderOffset = ref(0)
const showLayerName = ref(false)
const compareRatio = ref(-0.5)
const store = useStore()
const storeCompareRatio = computed(() => store.state.ui.compareRatio)
const clientWidth = computed(() => store.state.ui.width)
const compareSliderPosition = computed(() => {
    return {
        left: compareRatio.value * 100 + '%',
    }
})
const visibleLayerOnTop = computed(() => store.getters.visibleLayerOnTop)
const shouldUseWebGlContext = computed(
    () => store.getters.visibleLayerOnTop.type === LayerTypes.COG
)

watch(storeCompareRatio, (newValue) => {
    compareRatio.value = newValue
    olMap.render()
})

watch(visibleLayerOnTop, (newLayerOnTop, oldLayerOnTop) => {
    unRegisterRenderingEvents(oldLayerOnTop.id)
    registerRenderingEvents(newLayerOnTop.id)
})

onMounted(() => {
    compareRatio.value = storeCompareRatio.value
    registerRenderingEvents(visibleLayerOnTop.value.id)
    olMap.render()
})

onBeforeUnmount(() => {
    compareRatio.value = storeCompareRatio.value
    unRegisterRenderingEvents(visibleLayerOnTop.value.id)

    olMap.render()
})

function registerRenderingEvents(layerId) {
    const layer = getLayerFromMapById(layerId)
    // When loading a layer for the first time, we might need to clean the
    // context to ensure it is also cut correctly upon activating the compare slider
    // or loading a new COG layer on top.
    layer?.once('prerender', (event) => {
        if (shouldUseWebGlContext.value) {
            event.context.clear(event.context.COLOR_BUFFER_BIT)
        }
    })

    layer?.on('prerender', onPreRender)
    layer?.on('postrender', onPostRender)
}

function unRegisterRenderingEvents(layerId) {
    const layer = getLayerFromMapById(layerId)
    layer?.un('prerender', onPreRender)
    layer?.un('postrender', onPostRender)
}

function getLayerFromMapById(layerId) {
    return olMap
        ?.getAllLayers()
        .toSorted((a, b) => b.get('zIndex') - a.get('zIndex'))
        .find((layer) => layer.get('id') === layerId)
}

function onPreRender(event) {
    const context = event.context

    if (shouldUseWebGlContext.value) {
        context.enable(context.SCISSOR_TEST)
        const mapSize = olMap.getSize()
        // get render coordinates and dimensions given CSS coordinates
        const bottomLeft = getRenderPixel(event, [0, mapSize[1]])
        const topRight = getRenderPixel(event, [mapSize[0], 0])

        let width = topRight[0] - bottomLeft[0]
        const height = topRight[1] - bottomLeft[1]
        if (compareRatio.value < 1.0 && compareRatio.value > 0.0) {
            width = Math.round(width * compareRatio.value)
        }
        // We need to clear the color of the context. If we don't, the slider
        // will leave the right side of the slider drawn on startup or when
        // moving the slider.
        context.clear(context.COLOR_BUFFER_BIT)

        context.scissor(bottomLeft[0], bottomLeft[1], width, height)
    } else {
        const width =
            compareRatio.value > 0 && compareRatio.value < 1.0
                ? compareRatio.value * context.canvas.width
                : context.canvas.width
        context.save()
        context.beginPath()
        context.rect(0, 0, width, context.canvas.height)
        context.clip()
    }
}

function onPostRender(event) {
    const context = event.context
    if (shouldUseWebGlContext.value) {
        context.disable(context.SCISSOR_TEST)
    } else {
        context.restore()
    }
}

function grabSlider(event) {
    window.addEventListener('mousemove', listenToMouseMove, { passive: true })
    window.addEventListener('touchmove', listenToMouseMove, { passive: true })
    window.addEventListener('mouseup', releaseSlider, { passive: true })
    window.addEventListener('touchend', releaseSlider, { passive: true })
    if (event.type === 'touchstart') {
        compareSliderOffset.value =
            event.touches[0].clientX - compareRatio.value * clientWidth.value
    } else {
        compareSliderOffset.value = event.clientX - compareRatio.value * clientWidth.value
    }
}

function listenToMouseMove(event) {
    let currentPosition
    if (event.type === 'touchmove') {
        currentPosition = event.touches[0].clientX - compareSliderOffset.value
    } else {
        currentPosition = event.clientX - compareSliderOffset.value
    }
    // we ensure the slider can't get off the screen
    if (currentPosition < 14) {
        currentPosition = 14
    }
    // same on the other side, but with also the idea of keeping the cartes completely in the screen
    if (currentPosition > clientWidth.value - 14) {
        currentPosition = clientWidth.value - 14
    }

    compareRatio.value = round(currentPosition / clientWidth.value, 3)
    olMap.render()
}

function releaseSlider() {
    window.removeEventListener('mousemove', listenToMouseMove)
    window.removeEventListener('touchmove', listenToMouseMove)
    window.removeEventListener('mouseup', releaseSlider)
    window.removeEventListener('touchend', releaseSlider)
    compareSliderOffset.value = 0
    store.dispatch('setCompareRatio', {
        compareRatio: compareRatio.value,
        ...dispatcher,
    })
}
</script>

<template>
    <div
        class="compare-slider position-absolute top-0 translate-middle-x h-100 d-inline-block"
        data-cy="compareSlider"
        :style="compareSliderPosition"
        @touchstart.passive="grabSlider"
        @mousedown.passive="grabSlider"
        @mouseenter="showLayerName = true"
        @mouseleave="showLayerName = false"
    >
        <FontAwesomeIcon
            class="compare-slider-caret-left bg-primary text-white rounded-start"
            :icon="['fas', 'caret-left']"
        />
        <div class="compare-slider-line"></div>
        <FontAwesomeIcon
            class="compare-slider-caret-right bg-primary text-white rounded-end"
            :icon="['fas', 'caret-right']"
        />
        <div v-if="showLayerName" class="compare-slider-layer-name text-break">
            <FontAwesomeIcon icon="arrow-left" class="me-1" />
            <strong>{{ visibleLayerOnTop.name }}</strong>
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
