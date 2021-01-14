<template>
  <transition name="slide-up">
    <div v-show="showHeader" class="header align-items-center p-1 flex-fill">
      <SwissFlag class="swiss-flag ml-1 mr-2" />
      <MenuSwissConfederationText class="d-none d-sm-block" />
      <slot />
      <MenuButton />
      <MenuTray class="menu-tray" />
    </div>
  </transition>
</template>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
@import 'src/scss/media-query.mixin';

$headerHeight: 3rem;

.header {
  position: fixed;
  top: 0;
  left: 0;
  height: $headerHeight;
  width: 100%;
  background: $white;
  border-bottom: 4px solid $red;
  display: flex;
  // so that the menu is above the map overlay
  z-index: 500;
  .swiss-flag {
    height: 2rem;
    width: 2rem;
    min-height: 2rem;
    min-width: 2rem;
  }
  .menu-tray {
    position: fixed;
    top: $headerHeight;
    right: 0;
    background: $white;
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
@include respond-above(sm) {
  .header {
    height: 2 * $headerHeight;
    .swiss-flag {
      margin-top: 0.4rem;
      align-self: flex-start;
    }
    .menu-tray {
      top: 2 * $headerHeight;
    }
  }
}
</style>

<script>
import { mapState } from 'vuex'

import SwissFlag from './components/SwissFlag'
import MenuTray from './components/MenuTray'
import MenuButton from './components/MenuButton'
import MenuSwissConfederationText from './components/MenuSwissConfederationText'

export default {
  components: {
    MenuSwissConfederationText,
    MenuButton,
    SwissFlag,
    MenuTray,
  },
  computed: {
    ...mapState({
      showHeader: (state) => state.ui.showHeader,
    }),
  },
}
</script>
