<template>
  <transition name="slide-up">
    <div class="header align-items-center p-1" v-show="!mapIsBeingDragged">
      <SwissFlag class="swiss-flag ml-1 mr-2" />
      <SearchBar />
      <MenuTray />
    </div>
  </transition>
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
    display: flex;
    .swiss-flag {
      height: 2em;
      width: 2em;
    }
  }
  .slide-up-leave-active,
  .slide-up-enter-active {
    transition: 0.2s;
  }
  .slide-up-enter {
    transform: translate(0, -100%);
  }
  .slide-up-leave-to {
    transform: translate(0, -100%);
  }
</style>

<script>

import { mapState } from "vuex";

import SwissFlag from "./components/SwissFlag";
import SearchBar from "./components/SearchBar";
import MenuTray from "./components/MenuTray";

export default {
  computed: {
    ...mapState({
      mapIsBeingDragged: state => state.map.isBeingDragged
    })
  },
  components: {
    SwissFlag,
    SearchBar,
    MenuTray,
  }
}
</script>
