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

<style>
#map-view {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>

<script>
import OverlayModule from '@/modules/overlay/OverlayModule'
import MapModule from '@/modules/map/MapModule'
import MenuModule from '@/modules/menu/MenuModule'
import SearchModule from '@/modules/search/SearchModule'
import ToolboxModule from '@/modules/toolbox/ToolboxModule'
import I18nModule from '@/modules/i18n/I18nModule'
import TooltipModule from '@/modules/tooltip/TooltipModule'
import DrawingModule from '@/modules/drawing/DrawingModule'

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
