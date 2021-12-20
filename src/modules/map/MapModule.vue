<template>
    <div class="full-screen-map" data-cy="map">
        <OpenLayersMap>
            <!-- So that external modules can have access to the map instance through the provided 'getMap' -->
            <slot />
        </OpenLayersMap>
        <transition name="slide-down">
            <MapFooter v-show="showFooter" />
        </transition>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import OpenLayersMap from './components/openlayers/OpenLayersMap'
import MapFooter from './components/MapFooter'

export default {
    components: { OpenLayersMap, MapFooter },
    computed: {
        ...mapState({
            showFooter: (state) => state.ui.showFooter,
        }),
    },
}
</script>

<style lang="scss">
@import 'src/scss/bootstrap-theme';

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
