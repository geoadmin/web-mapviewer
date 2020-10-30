<template>
  <div id="toolbox">
    <ZoomButtons id="toolbox-zoom-buttons" />
    <BackgroundSelectorButton id="toolbox-bg-buttons" />
  </div>
</template>

<style lang="scss">
#toolbox-zoom-buttons,
#toolbox-bg-buttons {
  position: absolute;
  // footer is at 1.5rem, adding another 1.5rem of padding
  bottom: 3rem;
  z-index: 250;
}
#toolbox-zoom-buttons {
  right: 1.5rem;
}
#toolbox-bg-buttons {
  left: 1.5rem;
}
</style>

<script>
    import ZoomButtons from "./components/ZoomButtons"
    import BackgroundSelectorButton from "./components/BackgroundSelectorButton";

    export default {
        components: { ZoomButtons, BackgroundSelectorButton }
    }
</script>
