<template>
    <div class="full-screen-map" data-cy="map">
        <OpenLayersMap />
        <transition name="slide-down">
            <Footer v-show="showFooter" />
        </transition>
    </div>
</template>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';

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

<script>
import { mapState } from 'vuex'
import OpenLayersMap from './components/openlayers/OpenLayersMap'
import Footer from './components/Footer'

export default {
    components: { OpenLayersMap, Footer },
    computed: {
        ...mapState({
            showFooter: (state) => state.ui.showFooter,
        }),
    },
}
</script>
