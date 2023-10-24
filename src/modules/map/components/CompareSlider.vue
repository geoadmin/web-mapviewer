<template>
    <div class="compare-slider" :style="compareSliderPosition">
        <FontAwesomeIcon class="compare-slider-caret-left" :icon="['fas', 'caret-left']" />
        <div class="compare-slider-line"></div>

        <FontAwesomeIcon class="compare-slider-caret-right" :icon="['fas', 'caret-right']" />
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapActions, mapState } from 'vuex'
export default {
    components: {
        FontAwesomeIcon,
    },
    computed: {
        ...mapState({
            compareRatio: (state) => state.ui.compareRatio,
        }),
        compareSliderPosition() {
            return {
                left: this.compareRatio * 100 + '%',
            }
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
