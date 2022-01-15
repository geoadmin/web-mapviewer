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
        <ToolboxModule />
        <TooltipModule />
        <I18nModule />
    </div>
</template>

<script>
import OverlayModule from '@/modules/overlay/OverlayModule.vue'
import MapModule from '@/modules/map/MapModule.vue'
import MenuModule from '@/modules/menu/MenuModule.vue'
import SearchModule from '@/modules/search/SearchModule.vue'
import ToolboxModule from '@/modules/toolbox/ToolboxModule.vue'
import I18nModule from '@/modules/i18n/I18nModule.vue'
import TooltipModule from '@/modules/tooltip/TooltipModule.vue'
import DrawingModule from '@/modules/drawing/DrawingModule.vue'

export default {
    components: {
        DrawingModule,
        TooltipModule,
        ToolboxModule,
        SearchModule,
        MenuModule,
        MapModule,
        OverlayModule,
        I18nModule,
    },
}
</script>

<style scoped>
#map-view {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>
