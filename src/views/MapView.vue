<template>
    <div id="map-view">
        <OpenFullAppLink v-if="embedded" />
        <MapModule>
            <!-- we place the drawing module here so that it can receive the OpenLayers map instance through provide/inject -->
            <DrawingModule v-show="!embedded" />
            <!-- The footer also need to receive the map (for mouse position) -->
            <MapFooter v-show="!embedded" />
            <!-- Needed to be able to set an overlay when hovering over the profile with the mouse -->
            <InfoboxModule />
            <!-- needed to e.g. set register an event to set the compass position -->
            <MenuModule v-show="!embedded" />
        </MapModule>
        <I18nModule />
    </div>
</template>

<script>
import DrawingModule from '@/modules/drawing/DrawingModule.vue'
import I18nModule from '@/modules/i18n/I18nModule.vue'
import InfoboxModule from '@/modules/infobox/InfoboxModule.vue'
import MapFooter from '@/modules/map/components/footer/MapFooter.vue'
import MapModule from '@/modules/map/MapModule.vue'
import MenuModule from '@/modules/menu/MenuModule.vue'
import OpenFullAppLink from '@/utils/OpenFullAppLink.vue'
import { mapState } from 'vuex'

export default {
    components: {
        OpenFullAppLink,
        DrawingModule,
        InfoboxModule,
        MenuModule,
        MapModule,
        MapFooter,
        I18nModule,
    },
    computed: {
        ...mapState({
            embedded: (state) => state.ui.embeddedMode,
        }),
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/variables.scss';
#map-view {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>
