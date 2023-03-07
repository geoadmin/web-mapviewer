<template>
    <div class="map-footer" :class="{ 'map-footer-fullscreen': isFullscreenMode }">
        <div class="map-footer-top">
            <MapFooterAttributionList />
            <div>
                <div class="map-background-selector">
                    <MapFooterBackgroundSelector />
                </div>
                <MapFooterScale :current-zoom="zoom" class="scale-line-phone" />
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
import MapFooterAttributionList from '@/modules/map/components/footer/MapFooterAttributionList.vue'
import { mapActions, mapState } from 'vuex'
import MapFooterAppCopyright from './MapFooterAppCopyright.vue'
import MapFooterAppVersion from './MapFooterAppVersion.vue'
import MapFooterBackgroundSelector from './MapFooterBackgroundSelector.vue'
import MapFooterMousePosition from './MapFooterMousePosition.vue'
import MapFooterProjection from './MapFooterProjection.vue'
import MapFooterScale from './MapFooterScale.vue'

export default {
    components: {
        MapFooterAttributionList,
        MapFooterAppCopyright,
        MapFooterAppVersion,
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

<style lang="scss">
@import 'src/scss/webmapviewer-bootstrap-theme';
/* Must be unscoped, as the scaleLine is defined in the child component MapFooterScale.vue */
.scale-line-phone .scale-line-inner {
    /* If in phone mode, we need a background color, as the scale line is directly displayed on the
    map in this case. */
    background-color: rgba($white, 0.7);
}
</style>

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
        @include respond-above(tablet) {
            flex-direction: column-reverse;
        }
        .scale-line-phone {
            font-size: 0.6rem;
            @include respond-above(phone) {
                display: none;
            }
        }
    }

    &-middle {
        position: relative;
        z-index: $zindex-footer-infobox;
        background-color: $white;
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
