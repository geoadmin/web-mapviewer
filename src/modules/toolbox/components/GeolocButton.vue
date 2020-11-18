<template>
  <div class="geoloc-button" @click="toggleGeolocation" :class="{ 'active': isActive }">
    <svg xmlns="http://www.w3.org/2000/svg" y="0" x="0">
      <ellipse class="geoloc-button-inner-circle" rx="8" ry="8" stroke-width="9" />
    </svg>
  </div>
</template>

<style lang="scss">
  @import "node_modules/bootstrap/scss/bootstrap";
  @import "src/scss/variables";
  .geoloc-button {
    height: $map-button-diameter;
    width: $map-button-diameter;
    border-radius: $map-button-diameter / 2;
    background-color: $gray-800;
    svg {
      overflow: initial;
      position: relative;
      top: 50%;
      left: 50%;
    }
    .geoloc-button-inner-circle {
      stroke: $white;
      fill: $gray-800;
    }
    &.active {
      background-color: $red;
      .geoloc-button-inner-circle {
        fill: $red;
      }
    }
  }
</style>

<script>
import { mapState, mapActions } from "vuex";
export default {
  computed: {
    ...mapState({
      isActive: state => state.geolocation.active
    })
  },
  methods: {
    ...mapActions(['toggleGeolocation']),
  }
}
</script>
