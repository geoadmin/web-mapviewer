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

$slider-position: 50%;

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
