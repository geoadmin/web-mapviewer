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
    ...mapActions(['showMenuTray', 'hideMenuTray']),
    toggleMenuTrayAndOverlay() {
      if (this.menuTrayIsVisible) {
        this.hideMenuTray();
      } else {
        this.showMenuTray();
      }
    },
  }
};
</script>
