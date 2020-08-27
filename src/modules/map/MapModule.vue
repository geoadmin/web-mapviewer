<template>
    <div class="full-screen-map">
      <PureOpenlayersMap></PureOpenlayersMap>
      <Footer></Footer>
    </div>
</template>

<style>
    .full-screen-map {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>

<script>
    import PureOpenlayersMap from "./components/OpenlayersMap";
    import Footer from "./components/Footer";

    export default {
        components: { PureOpenlayersMap, Footer }
    }
</script>
