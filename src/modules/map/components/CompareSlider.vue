<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { unByKey } from 'ol/Observable'
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { round } from '@/utils/numberUtils'
const olMap = inject('olMap')

const preRenderKey = ref(null)
const postRenderKey = ref(null)
const compareSliderOffset = ref(0)

const compareRatio = ref(-0.5)
const store = useStore()
const storeCompareRatio = computed(() => store.state.ui.compareRatio)
const isCompareSliderActive = computed(() => store.state.ui.isCompareSliderActive)
const clientWidth = computed(() => store.state.ui.width)
const compareSliderPosition = computed(() => {
    return {
        left: compareRatio.value * 100 + '%',
    }
})
const visibleLayerOnTop = computed(() => store.getters.visibleLayerOnTop)

watch(storeCompareRatio, (newValue) => {
    compareRatio.value = newValue
    slice()
})

watch(visibleLayerOnTop, () => {
    nextTick(slice)
})

onMounted(() => {
    compareRatio.value = storeCompareRatio.value
    nextTick(slice)
})

onUnmounted(() => {
    compareRatio.value = storeCompareRatio.value

    slice()
})

function slice() {
    if (preRenderKey.value != null && postRenderKey.value != null) {
        unByKey(preRenderKey.value)
        unByKey(postRenderKey.value)
        preRenderKey.value = null
        postRenderKey.value = null
    }
    const topVisibleLayer = olMap?.getAllLayers().find((layer) => {
        return visibleLayerOnTop.value && layer.get('id') === visibleLayerOnTop.value.getID()
    })
    if (topVisibleLayer && isCompareSliderActive.value) {
        preRenderKey.value = topVisibleLayer.on('prerender', onPreRender)
        postRenderKey.value = topVisibleLayer.on('postrender', onPostRender)
    }
    olMap.render()
}

function onPreRender(event) {
    const ctx = event.context
    // the offset is there to ensure we get to the slider line, and not the border of the element
    let width = ctx.canvas.width
    if (compareRatio.value < 1.0 && compareRatio.value > 0.0) {
        width = ctx.canvas.width * compareRatio.value
    }

    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, width, ctx.canvas.height)
    ctx.clip()
}

function onPostRender(event) {
    event.context.restore()
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
        value: compareRatio.value,
        dispatcher: 'CompareSlider.vue',
    })
}
</script>

<template>
    <div
        class="compare-slider position-absolute top-0 translate-middle-x h-100 d-inline-block"
        data-cy="compare_slider"
        :style="compareSliderPosition"
        @touchstart.passive="grabSlider"
        @mousedown.passive="grabSlider"
    >
        <FontAwesomeIcon class="compare-slider-caret-left" :icon="['fas', 'caret-left']" />
        <div class="compare-slider-line"></div>

        <FontAwesomeIcon class="compare-slider-caret-right" :icon="['fas', 'caret-right']" />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.compare-slider {
    width: 40px;
    z-index: $zindex-compare-slider;
    cursor: ew-resize;
    &-caret-left,
    &-caret-right {
        position: inherit;
        top: 50%;
        width: 14px;
        height: 14px;
        color: $white;
        background: $primary;
        z-index: inherit;
    }

    &-caret-left {
        translate: 4px;
    }
    &-caret-right {
        translate: 22px;
    }
    &-line {
        position: relative;
        margin: auto;
        width: 4px;
        height: 100%;
        background: $primary;
        z-index: inherit;
    }
}
</style>
