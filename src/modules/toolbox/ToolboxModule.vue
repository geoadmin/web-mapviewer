<template>
    <div id="toolbox">
        <transition name="slide-right">
            <div v-if="showZoomGeolocationButtons" class="right-toolbox">
                <ZoomButtons v-if="isCurrentUiModeDesktop" class="toolbox-zoom-buttons" />
                <GeolocButton class="geoloc-button" />
            </div>
        </transition>
        <transition name="slide-left">
            <BackgroundSelectorButton v-if="showBgWheel" class="toolbox-bg-buttons" />
        </transition>
    </div>
</template>

<script>
import ZoomButtons from './components/ZoomButtons.vue'
import BackgroundSelectorButton from './components/BackgroundSelectorButton.vue'
import { mapState } from 'vuex'
import GeolocButton from './components/GeolocButton.vue'
import { UIModes } from '@/modules/store/modules/ui.store'

export default {
    components: { GeolocButton, ZoomButtons, BackgroundSelectorButton },
    computed: {
        ...mapState({
            showBgWheel: (state) => state.ui.showBackgroundWheel,
            showZoomGeolocationButtons: (state) => state.ui.showZoomGeolocationButtons,
            uiMode: (state) => state.ui.mode,
        }),
        isCurrentUiModeDesktop: function () {
            return this.uiMode === UIModes.DESKTOP
        },
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
        .toolbox-zoom-buttons {
            position: relative;
        }
    }
    .toolbox-bg-buttons {
        left: $screen-padding-for-ui-elements;
        bottom: $footer-height + $screen-padding-for-ui-elements;
    }
}
@include respond-above(md) {
    #toolbox {
        .right-toolbox {
            top: 2 * $header-height + $screen-padding-for-ui-elements;
        }
    }
}
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
