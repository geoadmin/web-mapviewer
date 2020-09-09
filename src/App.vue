<template>
    <div id="app">
        <MapModule />
        <HeaderModule />
        <ToolboxModule />
        <I18nModule />
    </div>
</template>

<script>
  import MapModule from "./modules/map/";
    import ToolboxModule from "./modules/toolbox/";
    import I18nModule from "./modules/i18n/I18nModule";
    import HeaderModule from "@/modules/header/HeaderModule";
  export default {
    name: 'App',
    components: {
      HeaderModule,
      MapModule,
      ToolboxModule,
      I18nModule
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
      overflow: hidden;
  }
</style>
