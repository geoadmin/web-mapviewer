<template>
  <div id="map-scale">
    {{ resolution }} m/px
  </div>
</template>

<style lang="scss">
#map-scale {
  position: fixed;
  z-index: 20;
  bottom: 3rem;
  left: 1rem;
  width: 10rem;
  height: 1.5rem;
  background-color: white;
}
</style>

<script>
import { mapGetters } from 'vuex';
export default {
  computed: {
    ...mapGetters(['resolution'])
  }
}
</script>