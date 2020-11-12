<template>
  <transition name="slide">
    <div v-show="showMenuTray"
         data-cy="menu-tray"
         class="p-2">
      <MenuLangSelector class="menu-section" />
      <MenuBackgroundSelector class="menu-section" />
      <MenuLayerList class="menu-section" />
    </div>
  </transition>
</template>

<style lang="scss">
  .slide-leave-active,
  .slide-enter-active {
    transition: 0.2s;
  }
  .slide-enter {
    transform: translate(100%, 0);
  }
  .slide-leave-to {
    transform: translate(100%, 0);
  }
</style>

<script>
  import { mapState } from "vuex";
  import MenuLangSelector from "./MenuLangSelector";
  import MenuLayerList from "./MenuLayerList";
  import MenuBackgroundSelector from "./MenuBackgroundSelector";

  export default {
    components: {MenuBackgroundSelector, MenuLayerList, MenuLangSelector },
    computed: {
      ...mapState({
        showMenuTray: state => state.menu.showMenuTray
      })
    }
  };
</script>
