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
