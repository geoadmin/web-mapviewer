<template>
  <div id="app">
    <OverlayModule />
    <MapModule />
    <MenuModule />
    <ToolboxModule />
    <I18nModule />
  </div>
</template>

<script>
  import { mapActions } from "vuex";
  import MapModule from "./modules/map/";
  import ToolboxModule from "./modules/toolbox/";
  import I18nModule from "./modules/i18n/I18nModule";
  import MenuModule from "@/modules/menu/MenuModule";
  import OverlayModule from "@/modules/overlay/OverlayModule";

  export default {
    name: 'App',
    components: {
      OverlayModule,
      MenuModule,
      MapModule,
      ToolboxModule,
      I18nModule,
    },
    methods: {
      ...mapActions(['setSize']),
      setScreenSizeFromWindowSize: function () {
        this.setSize({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }
    },
    mounted() {
      // reading size
      this.setScreenSizeFromWindowSize();
      window.onresize = () => {
        this.setScreenSizeFromWindowSize();
      }
    }
  }
</script>

<style lang="scss">
  @import "node_modules/bootstrap/scss/bootstrap";

  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    position: absolute;
    width: 100vw;
    height: 100vh;
  }
</style>
