<template>
    <div id="map-view">
        <MapModule>
            <!-- we place the drawing module here so that it can receive the OpenLayers map instance through provide/inject -->
            <DrawingModule />
            <!-- The footer also need to receive the map (for mouse position) -->
            <MapFooter />
        </MapModule>
        <MenuModule />
        <InfoboxModule />
        <I18nModule />
    </div>
</template>

<script>
import MapModule from '@/modules/map/MapModule.vue'
import MenuModule from '@/modules/menu/MenuModule.vue'
import I18nModule from '@/modules/i18n/I18nModule.vue'
import InfoboxModule from '@/modules/infobox/InfoboxModule.vue'
import DrawingModule from '@/modules/drawing/DrawingModule.vue'
import MapFooter from '@/modules/map/components/footer/MapFooter.vue'

export default {
    components: {
        DrawingModule,
        InfoboxModule,
        MenuModule,
        MapModule,
        MapFooter,
        I18nModule,
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/variables.scss';
#map-view {
    position: absolute;
    z-index: $zindex-map;
    width: 100%;
    height: 100%;
}
</style>
