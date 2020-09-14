<template>
  <div class="header d-flex align-items-center p-1">
    <SwissFlag class="swiss-flag ml-1 mr-2" />
    <SearchBar />
    <MenuTray />
  </div>
</template>

<style lang="scss">
  @import "node_modules/bootstrap/scss/bootstrap";

  .header {
    position: fixed;
    top: 0;
    left: 0;
    height: 3em;
    width: 100%;
    background: $white;
    border-bottom: 4px solid $red;
    // so that the menu is above the map overlay
    z-index: 500;
    .swiss-flag {
      height: 2em;
      width: 2em;
    }
  }
</style>

<script>

import SwissFlag from "./components/SwissFlag";
import SearchBar from "./components/SearchBar";
import MenuTray from "./components/MenuTray";

export default {
  components: {
    SwissFlag,
    SearchBar,
    MenuTray,
  }
}
</script>
