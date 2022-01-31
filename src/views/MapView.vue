<template>
    <div id="map-view">
        <OverlayModule />
        <MapModule>
            <!-- we place the drawing module here so that it can receive the OpenLayers map instance through provide/inject -->
            <DrawingModule />
        </MapModule>
        <MenuModule>
            <!-- the only way to merge this two module while having different folder was to add the search bar (or search module)-->
            <!-- right into the slot of the menu, so that the menu can place it according to the screen size-->
            <SearchModule />
        </MenuModule>
        <InfoboxModule />
        <I18nModule />
    </div>
</template>

<script>
import OverlayModule from '@/modules/overlay/OverlayModule.vue'
import MapModule from '@/modules/map/MapModule.vue'
import MenuModule from '@/modules/menu/MenuModule.vue'
import SearchModule from '@/modules/search/SearchModule.vue'
import I18nModule from '@/modules/i18n/I18nModule.vue'
import InfoboxModule from '@/modules/infobox/InfoboxModule.vue'
import DrawingModule from '@/modules/drawing/DrawingModule.vue'

export default {
    components: {
        DrawingModule,
        InfoboxModule,
        SearchModule,
        MenuModule,
        MapModule,
        OverlayModule,
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
