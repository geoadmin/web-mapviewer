<template>
  <div id="toolbox">
    <ZoomButtons id="toolbox-zoom-buttons" />
    <transition name="slide-left">
      <BackgroundSelectorButton id="toolbox-bg-buttons" v-show="showBgWheel" />
    </transition>
  </div>
</template>

<style lang="scss">
#toolbox-zoom-buttons,
#toolbox-bg-buttons {
  position: absolute;
  // footer is at 1.5rem, adding another 1.5rem of padding
  bottom: 2.5rem;
  z-index: 250;
}
#toolbox-zoom-buttons {
  right: 1rem;
}
#toolbox-bg-buttons {
  left: 1rem;
}
.slide-left-leave-active,
.slide-left-enter-active {
  transition: 0.2s;
}
.slide-left-enter {
  transform: translate(-100%, 0);
}
.slide-left-leave-to {
  transform: translate(-100%, 0);
}
</style>

<script>
import ZoomButtons from "./components/ZoomButtons"
import BackgroundSelectorButton from "./components/BackgroundSelectorButton";
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState({
      showBgWheel: state => state.ui.showBackgroundWheel,
    })
  },
  components: { ZoomButtons, BackgroundSelectorButton }
}
</script>
