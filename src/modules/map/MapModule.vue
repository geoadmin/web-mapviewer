<template>
    <div class="full-screen-map" data-cy="map">
      <PureOpenlayersMap />
      <Footer v-show="showFooter" />
    </div>
</template>

<style lang="scss">
  @import "node_modules/bootstrap/scss/bootstrap";

  .full-screen-map {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: $white url('./assets/grid.png');
  }
</style>

<script>
import { mapState } from "vuex";
import PureOpenlayersMap from "./components/OpenlayersMap";
import Footer from "./components/Footer";

export default {
  computed: {
    ...mapState({
      showFooter: state => state.map.showFooter,
    })
  },
  components: { PureOpenlayersMap, Footer }
}
</script>
