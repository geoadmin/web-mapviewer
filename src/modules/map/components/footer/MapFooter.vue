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
            <MapFooterScale :current-zoom="zoom" />
            <MapFooterProjection
                :displayed-projection-id="displayedProjectionId"
                @projection-change="setDisplayedProjectionWithId"
            />
            <MapFooterMousePosition :displayed-projection-id="displayedProjectionId" />
            <span class="map-footer-bottom-spacer" />
            <MapFooterAppVersion />
            <MapFooterAppCopyright />
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
        align-items: flex-end;
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
            align-items: flex-end;
        }
    }

    &-middle {
        background-color: $white;
    }

    &-bottom {
        width: 100%;
        padding: 0.6em;
        background-color: rgba($white, 0.9);
        font-size: 0.6rem;

        display: flex;
        align-items: center;
        gap: 0 $flex-gap;
        flex-wrap: wrap;

        &-spacer {
            flex-grow: 1;
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
