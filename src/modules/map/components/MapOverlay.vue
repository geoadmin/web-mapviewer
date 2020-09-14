<template>
  <transition name="fade">
    <div v-show="showOverlay" id="map-overlay" @click="toggleMapOverlay"></div>
  </transition>
</template>

<style lang="scss">
  #map-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.5);
    z-index: 499;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>

<script>
  import { mapState, mapActions } from "vuex";

  export default {
    computed: {
      ...mapState({
        showOverlay: state => state.map.overlay.show
      })
    },
    methods: {
      ...mapActions(['toggleMapOverlay']),
    }
  };
</script>
