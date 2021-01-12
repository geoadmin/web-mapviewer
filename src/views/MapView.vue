<template>
  <div id="map-view">
    <OverlayModule />
    <MapModule />
    <MenuModule>
      <SearchModule />
    </MenuModule>
    <ToolboxModule />
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
import OverlayModule from "@/modules/overlay/OverlayModule";
import MapModule from "@/modules/map/MapModule";
import MenuModule from "@/modules/menu/MenuModule";
import SearchModule from "@/modules/search/SearchModule";
import ToolboxModule from "@/modules/toolbox/ToolboxModule";
import I18nModule from "@/modules/i18n/I18nModule";

export default {
  components: {ToolboxModule, SearchModule, MenuModule, MapModule, OverlayModule, I18nModule}
}
</script>
