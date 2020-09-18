<template>
  <div id="search-bar" class="d-flex flex-fill">
    <input type="text"
           class="form-control"
           :placeholder="$t('search_placeholder')"
           aria-label="Search"
           aria-describedby="search-icon">
    <button type="button"
            data-cy="menu-button"
            class="btn btn-default"
            @click="toggleMenuTrayAndOverlay">
      <strong>{{ $t('menu') }}</strong>
    </button>
  </div>
</template>

<style lang="scss">
  @import "node_modules/bootstrap/scss/bootstrap";
</style>

<script>
  import { mapActions, mapState } from "vuex";

  export default {
    computed: {
      ...mapState({
        menuTrayIsVisible: state => state.menu.showMenuTray
      })
    },
    methods: {
      ...mapActions(['showOverlay', 'hideOverlay', 'showMenuTray', 'hideMenuTray']),
      toggleMenuTrayAndOverlay() {
        if (this.menuTrayIsVisible) {
          this.hideOverlay();
          this.hideMenuTray();
        } else {
          this.showOverlay(this.hideMenuTray);
          this.showMenuTray();
        }
      },
    }
  };
</script>
