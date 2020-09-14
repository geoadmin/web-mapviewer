<template>
    <div class="full-screen-map">
      <MapOverlay/>
      <PureOpenlayersMap />
      <Footer />
    </div>
</template>

<style lang="scss">
  @import "node_modules/bootstrap/scss/bootstrap";

  .full-screen-map {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>

<script>
    import PureOpenlayersMap from "./components/OpenlayersMap";
    import Footer from "./components/Footer";
    import MapOverlay from "@/modules/map/components/MapOverlay";

    export default {
        components: {MapOverlay, PureOpenlayersMap, Footer }
    }
</script>
