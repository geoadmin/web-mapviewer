<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, defineProps, inject, onMounted, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import { round } from '@/utils/numberUtils'
const props = defineProps({
    clientWidth: {
        type: Number,
        default: window.innerWidth,
    },
})
inject['getMap']

const { clientWidth } = toRefs(props)
const olMap = ref(null)

const compareRatio = ref(-0.5)
const store = useStore()
const storeCompareRatio = computed(() => store.state.ui.compareRatio)
const compareSliderPosition = computed(() => {
    return {
        left: compareRatio.value * 100 + '%',
    }
})
const visibleLayerOnTop = computed(() => store.getters.visibleLayerOnTop)

watch(storeCompareRatio, (newValue) => {
    compareRatio.value = newValue
})

watch(visibleLayerOnTop, () => {
    $nextTick(slice())
})

onMounted(() => {
    compareRatio.value = storeCompareRatio.value
    slice()
})

function slice() {
    if (olMap.value) {
        olMap.value.un('prerender', onPreCompose)
        olMap.value.un('postrender', onPostCompose)
    }
    olMap.value = getMap()
        .getAllLayers()
        .find((layer) => {
            return visibleLayerOnTop.value && layer.get('id') === visibleLayerOnTop.value.getID()
        })
    if (olMap.value) {
        olMap.value.on('prerender', onPreCompose)

        olMap.value.on('postrender', onPostCompose)
    }
}

function onPreCompose(event) {
    const ctx = event.context
    const width = ctx.canvas.width * this.compareRatio + 20
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, width, ctx.canvas.height)
    ctx.clip()
}

function onPostCompose(event) {
    event.context.restore()
}

function grabSlider() {
    window.addEventListener('mousemove', listenToMouseMove, { passive: true })
    window.addEventListener('touchmove', listenToMouseMove, { passive: true })
    window.addEventListener('mouseup', releaseSlider, { passive: true })
    window.addEventListener('touchend', releaseSlider, { passive: true })
}

function listenToMouseMove(event) {
    const currentPosition = event.type === 'touchmove' ? event.touches[0].pageX : event.pageX
    compareRatio.value = round(currentPosition / clientWidth.value, 2)
    this.getMap().render()
}

function releaseSlider() {
    window.removeEventListener('mousemove', listenToMouseMove)
    window.removeEventListener('touchmove', listenToMouseMove)
    window.removeEventListener('mouseup', releaseSlider)
    window.removeEventListener('touchend', releaseSlider)
    store.dispatch('setCompareRatio', compareRatio.value)
}
</script>

<template>
    <div
        class="compare-slider"
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
    position: absolute;
    top: 0;
    display: inline-block;
    width: 40px;
    height: 100%;
    z-index: $zindex-compare-slider;

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
