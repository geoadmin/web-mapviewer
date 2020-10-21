<template>
  <button type="button"
          data-cy="menu-button"
          class="btn btn-default"
          @click="toggleMenuTrayAndOverlay">
    <strong>{{ $t('menu') }}</strong>
  </button>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  computed: {
    ...mapState({
      menuTrayIsVisible: state => state.menu.showMenuTray,
    })
  },
  methods: {
    ...mapActions(['showOverlay', 'hideOverlay', 'showMenuTray', 'hideMenuTray', 'hideSearchResults']),
    toggleMenuTrayAndOverlay() {
      if (this.menuTrayIsVisible) {
        this.hideOverlay();
        this.hideMenuTray();
      } else {
        this.showOverlay(this.hideMenuTray);
        this.showMenuTray();
        this.hideSearchResults();
      }
    },
  }
};
</script>
