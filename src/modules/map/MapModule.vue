<template>
    <div class="full-screen-map" data-cy="map">
        <CesiumMap v-if="is3DActive">
            <!-- So that external modules can have access to the map instance through the provided 'getMap' -->
            <slot />
        </CesiumMap>
        <OpenLayersMap v-else>
            <!-- So that external modules can have access to the map instance through the provided 'getMap' -->
            <slot />
            <LocationPopup />
        </OpenLayersMap>
        <WarningRibbon />
    </div>
</template>

<script>
import LocationPopup from './components/LocationPopup.vue'
import WarningRibbon from './components/WarningRibbon.vue'
import { mapState } from 'vuex'
import { defineAsyncComponent } from 'vue'

export default {
    components: {
        LocationPopup,
        WarningRibbon,
        OpenLayersMap: defineAsyncComponent(() =>
            import('./components/openlayers/OpenLayersMap.vue')
        ),
        CesiumMap: defineAsyncComponent(() => import('./components/cesium/CesiumMap.vue')),
    },
    computed: {
        ...mapState({
            is3DActive: (state) => state.ui.showIn3d,
        }),
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.full-screen-map {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: $white url('../../assets/grid.png');
}
.slide-down-leave-active,
.slide-down-enter-active {
    transition: 0.2s;
}
.slide-down-enter {
    transform: translate(0, 100%);
}
.slide-down-leave-to {
    transform: translate(0, 100%);
}
</style>
