<template>
    <div
        class="map-footer"
        :class="{ 'map-footer-fullscreen': isFullscreenMode }"
        data-cy="app-footer"
    >
        <div class="map-footer-top">
            <MapFooterAttributionList />
            <div>
                <div class="map-background-selector">
                    <BackgroundSelector />
                </div>
                <div id="map-footer-mobile-scale-line" />
            </div>
        </div>
        <div id="map-footer-middle-0" class="map-footer-middle">
            <!-- teleport for: Infobox, Profile, ... -->
        </div>
        <div class="map-footer-bottom">
            <div id="map-footer-scale-line" />
            <div id="map-footer-mouse-tracker" class="d-flex gap-1 align-items-center" />
            <span class="map-footer-bottom-spacer" />
            <MapFooterAppVersion />
            <MapFooterAppCopyright />
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

import BackgroundSelector from '@/modules/map/components/footer/backgroundSelector/BackgroundSelector.vue'
import MapFooterAttributionList from '@/modules/map/components/footer/MapFooterAttributionList.vue'

import MapFooterAppCopyright from './MapFooterAppCopyright.vue'
import MapFooterAppVersion from './MapFooterAppVersion.vue'

export default {
    components: {
        BackgroundSelector,
        MapFooterAttributionList,
        MapFooterAppCopyright,
        MapFooterAppVersion,
    },
    computed: {
        ...mapState({
            isFullscreenMode: (state) => state.ui.fullscreenMode,
        }),
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/scss/webmapviewer-bootstrap-theme';

$transition-duration: 0.2s;
$flex-gap: 1em;

// Full screen and media query adjustments are at the end.

.map-footer {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    transition: transform $transition-duration;
    pointer-events: none;

    &-top > *,
    &-middle,
    &-bottom {
        pointer-events: all;
    }

    &-top {
        position: relative;
        z-index: $zindex-footer;
        display: flex;
        align-items: flex-end;
        flex-direction: row-reverse;
        justify-content: space-between;
        .map-background-selector {
            padding: $screen-padding-for-ui-elements;
        }
        @include respond-above(phone) {
            flex-direction: column-reverse;
        }
    }

    &-middle {
        position: relative;
        z-index: $zindex-footer;
        background-color: $white;
        @include respond-above(phone) {
            z-index: $zindex-desktop-footer-infobox;
        }
    }

    &-bottom {
        position: relative;
        z-index: $zindex-footer;
        width: 100%;
        padding: 0.6em;
        background-color: rgba($white, 0.9);
        font-size: 0.6rem;

        display: none;
        align-items: center;
        gap: 0 $flex-gap;
        flex-wrap: wrap;

        &-spacer {
            flex-grow: 1;
        }

        @include respond-above(phone) {
            display: flex;
        }
    }
}

.map-footer-fullscreen {
    transform: translateY(100%);

    .map-footer-top-left {
        // Translation is needed if the background selection wheel is open.
        transform: translateX(-100%);
    }
}
</style>
