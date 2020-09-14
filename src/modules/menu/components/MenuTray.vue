<template>
  <transition name="slide">
    <div v-show="showMenuTray"
         id="menu-tray"
         data-cy="menu-tray"
         class="p-2">
      <h2>Menu</h2>
      <div><h6>Menu item</h6></div>
      <div><h6>Menu item</h6></div>
      <div><h6>Menu item</h6></div>
      <div><h6>Menu item</h6></div>
      <div><h6>Menu item</h6></div>
    </div>
  </transition>
</template>

<style lang="scss">
  @import "node_modules/bootstrap/scss/bootstrap";

  .slide-leave-active,
  .slide-enter-active {
    transition: 0.2s;
  }
  .slide-enter {
    transform: translate(-100%, 0);
  }
  .slide-leave-to {
    transform: translate(-100%, 0);
  }
  #menu-tray {
    position: fixed;
    top: 3em;
    left: 0;
    background: $white;
  }
</style>

<script>
  import { mapState } from "vuex";

  export default {
    computed: {
      ...mapState({
        showMenuTray: state => state.menu.showMenuTray
      })
    }
  };
</script>
