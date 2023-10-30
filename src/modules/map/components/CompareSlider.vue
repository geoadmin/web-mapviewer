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

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import debounce from '@/utils/debounce'
export default {
    data() {
        return {
            compareSliderIsGrabbed: false,
            clientWidth: window.innerWidth,
            compareRatio: -0.5,
        }
    },
    inject: ['getMap'],
    components: {
        FontAwesomeIcon,
    },
    computed: {
        ...mapState({
            storeCompareRatio: (state) => state.ui.compareRatio,
        }),
        ...mapGetters(['visibleLayers']),
        compareSliderPosition() {
            return {
                left: this.compareRatio * 100 + '%',
            }
        },
    },
    mounted() {
        this.compareRatio = this.storeCompareRatio
    },
    methods: {
        ...mapActions(['setCompareRatio']),
        grabSlider(event) {
            this.compareSliderIsGrabbed = true
            if (event.type === 'touchstart') {
                // for touch events we have to select which touch we want to get the screen position
                // (there can be multiple fingers gestures)
                this.cursorX = event.touches[0].screenX
            } else {
                this.cursorX = event.screenX
            }
            window.addEventListener('mousemove', this.listenToMouseMove, { passive: true })
            window.addEventListener('touchmove', this.listenToMouseMove, { passive: true })
            window.addEventListener('mouseup', this.releaseSlider, { passive: true })
            window.addEventListener('touchend', this.releaseSlider, { passive: true })
        },
        listenToMouseMove(event) {
            const currentPosition =
                event.type === 'touchmove' ? event.touches[0].screenX : event.screenX
            const deltaX = this.cursorX - currentPosition
            // COMMIT to compareRatio
            console.log(deltaX)
            console.log((currentPosition + deltaX) / this.clientWidth)
            this.compareRatio = (currentPosition + deltaX) / this.clientWidth
        },
        releaseSlider() {
            this.compareSliderIsGrabbed = false
            window.removeEventListener('mousemove', this.listenToMouseMove)
            window.removeEventListener('touchmove', this.listenToMouseMove)
            window.removeEventListener('mouseup', this.releaseSlider)
            window.removeEventListener('touchend', this.releaseSlider)
            this.setCompareRatio(this.compareRatio)
        },
    },
    watch: {
        storeCompareRatio() {
            this.compareRatio = this.storeCompareRatio
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.compare-slider {
    position: absolute;
    top: 0;
    display: inline-block;
    width: 40px;
    height: 100%;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    z-index: $zindex-compare-slider;
}
.compare-slider-caret-left {
    position: absolute;
    translate: 4px;
    top: 50%;
    z-index: $zindex-compare-slider;
    width: 14px;
    height: 14px;
    color: white;
    background: red;
}

.compare-slider-caret-right {
    position: absolute;
    top: 50%;
    translate: 22px;
    z-index: $zindex-compare-slider;
    width: 14px;
    height: 14px;
    color: white;
    background: red;
}
.compare-slider-line {
    position: relative;
    width: 4px;
    height: 100%;
    margin: auto;
    z-index: $zindex-compare-slider;
    background-color: red;
}
</style>
