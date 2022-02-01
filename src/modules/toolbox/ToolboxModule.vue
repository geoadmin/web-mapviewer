<template>
    <teleport to="#toolbox">
        <transition name="slide-right">
            <div
                v-if="showToolbox"
                class="right-toolbox"
                :class="{ 'currently-drawing': isCurrentlyDrawing }"
            >
                <GeolocButton class="geoloc-button mb-1" />
                <ZoomButtons class="toolbox-zoom-buttons" />
            </div>
        </transition>
        <transition name="slide-left">
            <BackgroundSelectorButton v-if="showToolbox" class="toolbox-bg-buttons" />
        </transition>
    </teleport>
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

.right-toolbox {
    float: right;
    position: relative;
    margin: $screen-padding-for-ui-elements;
}
.toolbox-bg-buttons {
    position: absolute;
    left: $screen-padding-for-ui-elements;
    bottom: $footer-height + $screen-padding-for-ui-elements;
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
