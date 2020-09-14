<template>
  <div id="search-bar" class="input-group">
    <div class="input-group-prepend">
      <button type="button"
              data-cy="menu-button"
              class="btn-menu btn border-right-0"
              @click="toggleMenuTrayAndOverlay">
        <i class="fa fa-bars"></i>
      </button>
    </div>
    <input type="text"
           class="form-control border-left-0"
           :placeholder="$t('search_placeholder')"
           aria-label="Search"
           aria-describedby="search-icon">
  </div>
</template>

<style lang="scss">
  @import "node_modules/bootstrap/scss/bootstrap";
  .btn-menu {
    border-color: $input-border-color !important;
  }
</style>

<script>
  import { mapActions, mapState } from "vuex";

  export default {
    computed: {
      ...mapState({
        overlayIsVisible: state => state.map.overlay.show
      })
    },
    methods: {
      ...mapActions(['toggleMapOverlay', 'toggleMenuTray', 'clearOverlayCallbacks']),
      toggleMenuTrayAndOverlay() {
        if (this.overlayIsVisible) {
          this.clearOverlayCallbacks();
          this.toggleMapOverlay();
        } else {
          this.toggleMapOverlay(!this.overlayIsVisible ? this.toggleMenuTray : null);
        }
        this.toggleMenuTray();
      }
    }
  };
</script>
