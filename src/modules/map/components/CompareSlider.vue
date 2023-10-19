<template>
    <div class="test-slider">
        <font-awesome-icon
            class="compare-slider-caret-left"
            :icon="['fas', 'caret-up']"
            :rotation="270"
        />
        <div class="compare-slider-line"></div>

        <font-awesome-icon
            class="compare-slider-caret-right"
            :icon="['fas', 'caret-up']"
            :rotation="90"
        />
    </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
    components: {
        FontAwesomeIcon,
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

$slider-position: 50%;

.test-slider {
    position: absolute;
    top: 0;
    display: inline-block;
    width: 40px;
    height: 100%;
    left: $slider-position;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    z-index: $zindex-compare-slider;
}
.compare-slider-caret-left {
    position: relative;
    margin: 2px;
    top: 50%;
    z-index: $zindex-compare-slider;
    width: 14px;
    height: 14px;
    color: white;
    background: red;
}

.compare-slider-caret-right {
    position: relative;
    top: 50%;
    margin: 2px;
    z-index: $zindex-compare-slider;
    width: 14px;
    height: 14px;
    color: white;
    background: red;
}
.compare-slider-line {
    position: absolute;
    width: 4px;
    height: 100%;
    left: $slider-position;
    margin: 2px;
    z-index: $zindex-compare-slider;
    background-color: red;
}
</style>
