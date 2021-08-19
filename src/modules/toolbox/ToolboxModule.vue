<template>
    <div id="toolbox">
        <div v-if="showZoomGeolocationButtons" id="right-toolbox">
            <ZoomButtons id="toolbox-zoom-buttons" />
            <GeolocButton id="geoloc-button" />
        </div>
        <transition name="slide-left">
            <BackgroundSelectorButton v-if="showBgWheel" id="toolbox-bg-buttons" />
        </transition>
    </div>
</template>

<script>
import ZoomButtons from './components/ZoomButtons'
import BackgroundSelectorButton from './components/BackgroundSelectorButton'
import { mapState } from 'vuex'
import GeolocButton from './components/GeolocButton'

export default {
    components: { GeolocButton, ZoomButtons, BackgroundSelectorButton },
    computed: {
        ...mapState({
            showBgWheel: (state) => state.ui.showBackgroundWheel,
            showZoomGeolocationButtons: (state) => state.ui.showZoomGeolocationButtons,
        }),
    },
}
</script>

<style lang="scss">
@import 'src/scss/media-query.mixin';

#right-toolbox,
#toolbox-bg-buttons {
    position: absolute;
    z-index: $zindex-map + 1;
}
#right-toolbox {
    top: $header-height + $screen-padding-for-ui-elements;
    right: $screen-padding-for-ui-elements;
    #toolbox-zoom-buttons {
        position: relative;
    }
}
#toolbox-bg-buttons {
    left: $screen-padding-for-ui-elements;
    bottom: $footer-height + $screen-padding-for-ui-elements;
}
.slide-left-leave-active,
.slide-left-enter-active {
    transition: 0.2s;
}
.slide-left-enter {
    transform: translate(-100%, 0);
}
.slide-left-leave-to {
    transform: translate(-100%, 0);
}

@include respond-above(sm) {
    #right-toolbox {
        top: 2 * $header-height + $screen-padding-for-ui-elements;
    }
}
</style>
