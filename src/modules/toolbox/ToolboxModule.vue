<template>
    <div id="toolbox">
        <transition name="slide-right">
            <div
                v-if="showToolbox"
                class="right-toolbox"
                :class="{ 'currently-drawing': isCurrentlyDrawing }"
            >
                <ZoomButtons class="toolbox-zoom-buttons" />
                <GeolocButton class="geoloc-button" />
            </div>
        </transition>
        <transition name="slide-left">
            <BackgroundSelectorButton v-if="showToolbox" class="toolbox-bg-buttons" />
        </transition>
    </div>
</template>

<script>
import ZoomButtons from './components/ZoomButtons.vue'
import BackgroundSelectorButton from './components/BackgroundSelectorButton.vue'
import { mapState } from 'vuex'
import GeolocButton from './components/GeolocButton.vue'

export default {
    components: { GeolocButton, ZoomButtons, BackgroundSelectorButton },
    computed: {
        ...mapState({
            showToolbox: (state) => !state.ui.fullscreenMode,
            isCurrentlyDrawing: (state) => state.ui.showDrawingOverlay,
        }),
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/scss/variables';

#toolbox {
    .right-toolbox,
    .toolbox-bg-buttons {
        position: absolute;
        z-index: $zindex-footer;
    }
    .right-toolbox {
        top: $header-height + $screen-padding-for-ui-elements;
        right: $screen-padding-for-ui-elements;
        &.currently-drawing {
            top: calc(124px + #{$screen-padding-for-ui-elements});
        }
        .toolbox-zoom-buttons {
            position: relative;
        }
    }
    .toolbox-bg-buttons {
        left: $screen-padding-for-ui-elements;
        bottom: $footer-height + $screen-padding-for-ui-elements;
    }
}
@include respond-above(lg) {
    #toolbox {
        .right-toolbox {
            top: 2 * $header-height + $screen-padding-for-ui-elements;
            &.currently-drawing {
                top: calc(124px + #{$screen-padding-for-ui-elements});
            }
        }
    }
}
// transition definition
.slide-left-leave-active,
.slide-left-enter-active,
.slide-right-leave-active,
.slide-right-enter-active {
    transition: 0.2s;
}
.slide-left-enter {
    transform: translate(-100%, 0);
}
.slide-left-leave-to {
    transform: translate(-100%, 0);
}
.slide-right-enter {
    transform: translate(100%, 0);
}
.slide-right-leave-to {
    transform: translate(100%, 0);
}
</style>
