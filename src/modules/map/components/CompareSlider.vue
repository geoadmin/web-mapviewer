<template>
    <div class="test-slider">
        <!--<FontAwesomeIcon :icon="['fas', 'square-caret-left']" class="compare-slider-caret-left" /> -->
        <div class="compare-slider-line"></div>
        <!--<FontAwesomeIcon :icon="['fas', 'square-caret-right']" class="compare-slider-caret-right" /> -->
        <FontAwesomeIcon class="compare-slider-caret-left" :icon="['fas', 'arrow-left']" />
        <FontAwesomeIcon
            class="compare-slider-caret-right"
            :icon="['fas', 'arrow-left']"
            :rotation="180"
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

.test-slider {
    position: relative;
    display: inline-block;
    width: 32px;
    height: 100%;
    left: 50%;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    z-index: $zindex-compare-slider;
}
.compare-slider-caret-left {
    position: relative;
    top: 50%;
    margin-right: 4px;
    z-index: $zindex-compare-slider;
    color: red;
}

.compare-slider-caret-right {
    position: relative;
    top: 50%;
    margin-left: -2 px;
    z-index: $zindex-compare-slider;
    color: red;
}
.compare-slider-line {
    position: absolute;
    width: 4px;
    height: 100%;
    left: 50%;
    margin: 2px;
    z-index: $zindex-compare-slider;
    background-color: red;
}
</style>
