<template>
    <div class="full-screen-map" data-cy="map">
        <OpenLayersMap>
            <!-- So that external modules can have access to the map instance through the provided 'getMap' -->
            <slot />
            <LocationPopup />
        </OpenLayersMap>
        <MapFooter />
    </div>
</template>

<script>
import OpenLayersMap from './components/openlayers/OpenLayersMap.vue'
import LocationPopup from './components/LocationPopup.vue'
import MapFooter from './components/footer/MapFooter.vue'

export default {
    components: { OpenLayersMap, LocationPopup, MapFooter },
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
