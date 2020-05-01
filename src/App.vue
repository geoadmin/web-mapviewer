<template>
  <div id="app">
    <MapModule></MapModule>
    <ToolboxModule></ToolboxModule>
  </div>
</template>

<script>
import MapModule from "./modules/map/MapModule";
import ToolboxModule from "./modules/toolbox/ToolboxModule";

export default {
  name: 'App',
  components: {
    MapModule,
    ToolboxModule
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
