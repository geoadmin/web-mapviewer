<template>
    <div class="map-footer" :class="{ 'map-footer-fullscreen': isFullscreenMode }">
        <div class="map-footer-top">
            <div class="map-footer-top-left">
                <MapFooterBackgroundSelector />
            </div>
            <div class="map-footer-top-right">
                <MapFooterAttribution />
            </div>
        </div>
        <div id="map-footer-middle" class="map-footer-middle">
            <!-- Infobox, Profile, ... -->
        </div>
        <div class="map-footer-bottom">
            <div class="map-footer-bottom-left">
                <MapFooterScale :current-zoom="zoom" />
                <MapFooterProjection
                    :displayed-projection-id="displayedProjectionId"
                    @projection-change="setDisplayedProjectionWithId"
                />
            </div>
            <div class="map-footer-bottom-right">
                <MapFooterMousePosition :displayed-projection-id="displayedProjectionId" />
                <MapFooterAppVersion />
                <MapFooterAppCopyright />
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import MapFooterAppCopyright from './MapFooterAppCopyright.vue'
import MapFooterAppVersion from './MapFooterAppVersion.vue'
import MapFooterAttribution from './MapFooterAttribution.vue'
import MapFooterBackgroundSelector from './MapFooterBackgroundSelector.vue'
import MapFooterMousePosition from './MapFooterMousePosition.vue'
import MapFooterProjection from './MapFooterProjection.vue'
import MapFooterScale from './MapFooterScale.vue'

export default {
    components: {
        MapFooterAppCopyright,
        MapFooterAppVersion,
        MapFooterAttribution,
        MapFooterBackgroundSelector,
        MapFooterMousePosition,
        MapFooterProjection,
        MapFooterScale,
    },
    computed: {
        ...mapState({
            zoom: (state) => state.position.zoom,
            isFullscreenMode: (state) => state.ui.fullscreenMode,
            displayedProjectionId: (state) => state.map.displayedProjection.id,
        }),
    },
    methods: {
        ...mapActions(['setDisplayedProjectionWithId']),
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
    z-index: $zindex-menu + 1;

    transition: transform $transition-duration;
    pointer-events: none;

    &-top-left,
    &-top-right,
    &-middle,
    &-bottom {
        pointer-events: all;
    }

    &-top {
        display: flex;
        align-items: end;
        flex-direction: row;
        justify-content: space-between;

        &-left {
            // Elements are stacked horizontally, left to right.
            display: flex;
            gap: $flex-gap;
            padding: $screen-padding-for-ui-elements;

            transition: transform $transition-duration;
        }

        &-right {
            // Elements are stacked vertically, bottom to top.
            display: flex;
            flex-direction: column-reverse;
            align-items: end;
        }
    }

    &-middle {
        background-color: $white;
    }

    &-bottom {
        height: $footer-height * 2;
        padding: 0 0.6em;
        background-color: rgba($white, 0.9);
        font-size: 0.6rem;

        display: flex;
        justify-content: space-around;
        flex-direction: column;

        &-left,
        &-right {
            display: flex;
            align-items: center;
            gap: $flex-gap;
        }
    }
}

.map-footer-fullscreen {
    transform: translateY($footer-height * 2);

    .map-footer-top-left {
        transform: translateX(-100%);
    }
}

@include respond-above(sm) {
    .map-footer {
        &-fullscreen {
            transform: translateY($footer-height);
        }

        &-top,
        &-bottom {
            display: flex;
            justify-content: space-between;
        }

        &-bottom {
            height: $footer-height;
            flex-direction: row;
            gap: $flex-gap;

            &-right {
                flex-grow: 1;
            }
        }
    }
}
</style>
