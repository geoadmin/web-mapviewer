<script setup>
import { computed, defineProps, inject, onMounted, toRefs } from 'vue'
import { useStore } from 'vuex'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useStore } from 'vuex'

olMap = inject('olMap')

const props = defineProps({
    clientWidth: {
        type: Numeric,
        default: window.innerWidth,
    },
})

const { clientWidth } = toRefs(props)

const compareRatio = ref(-0.5)

const store = useStore()
const storeCompareRatio = computed(() => store.state.ui.compareRatio)
const compareSliderPosition = computed(() => compareRatio * 100 + '%')
const visibleLayers = computed(() => store.getters.visibleLayers)

watch(storeCompareRatio, (newValue) => {
    compareRatio.value = newValue
})

onMounted(() => {
    compareRatio.value = storeCompareRatio
})

function grabSlider(event) {
    window.addEventListener('mousemove', listenToMouseMove, { passive: true })
    window.addEventListener('touchmove', listenToMouseMove, { passive: true })
    window.addEventListener('mouseup', releaseSlider, { passive: true })
    window.addEventListener('touchend', releaseSlider, { passive: true })
}
function listenToMouseMove(event) {
    const currentPosition = event.type === 'touchmove' ? event.touches[0].pageX : event.pageX
    compareRatio = currentPosition / clientWidth
}
function releaseSlider() {
    window.removeEventListener('mousemove', listenToMouseMove)
    window.removeEventListener('touchmove', listenToMouseMove)
    window.removeEventListener('mouseup', releaseSlider)
    window.removeEventListener('touchend', releaseSlider)
    store.dispatch('setCompareRatio', compareRatio)
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
