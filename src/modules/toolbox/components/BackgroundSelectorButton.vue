<template>
  <div class="bg-selector-container">
    <div v-if="currentBackgroundLayer"
         class="bg-selector"
         :class="`bg-${currentBackgroundLayer.id.replaceAll('.', '-')}`"
         @click="toggleBackgroundWheel">
    </div>
    <div class="bg-selector-wheel">
      <transition-group name="bg-slide-up">
        <div v-show="showBgWheel"
             class="bg-selector"
             v-for="(background, index) in backgroundLayers"
             :key="background.id"
             :class="`bg-${background.id.replaceAll('.', '-')} bg-index-${index}`"
             @click="selectBackgroundWithIndex(index)">
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style lang="scss">
@import "node_modules/bootstrap/scss/bootstrap";

$bg-button-size: 2rem;
$bg-button-shadow-size: 1rem;

.bg-selector-container {
  position: relative;
}
.bg-selector {
  height: $bg-button-size;
  width: $bg-button-size;
  background-image: url("../assets/backgrounds.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: $bg-button-size / 2;
  position: relative;
  &:after {
    content: '';
    background: $gray-700;
    width: $bg-button-size + $bg-button-shadow-size;
    height: $bg-button-size + $bg-button-shadow-size;
    position: absolute;
    left: -$bg-button-shadow-size / 2;
    top: -$bg-button-shadow-size / 2;
    border-radius: ($bg-button-size + $bg-button-shadow-size) / 2;
    z-index: -1;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.4);
  }
  &.bg-ch-swisstopo-pixelkarte-farbe {
    background-position: -110px 0;
  }
  &.bg-ch-swisstopo-pixelkarte-grau {
    background-position: -60px 0;
  }
  &.bg-ch-swisstopo-swissimage {
    background-position: -16px 0;
  }
}
.bg-selector-wheel {
  position: absolute;
  bottom: 3.2rem;
  .bg-selector {
    margin-top: 1.2rem;
  }
}
.bg-slide-up-leave-active,
.bg-slide-up-enter-active {
  transition: 0.3s;
}
.bg-slide-up-enter, .bg-slide-up-leave-to {
  opacity: 0;
  &.bg-index-0 {
    transform: translate(0, 300%);
  }
  &.bg-index-1 {
    transform: translate(0, 200%);
  }
  &.bg-index-2 {
    transform: translate(0, 100%);
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  data() {
    return {
      showBgWheel: false,
    }
  },
  computed: {
    ...mapGetters(['backgroundLayers', 'currentBackgroundLayer']),
  },
  methods: {
    ...mapActions(['setBackgroundIndex']),
    selectBackgroundWithIndex: function (index) {
      this.setBackgroundIndex(index);
      this.toggleBackgroundWheel();
    },
    toggleBackgroundWheel: function () {
      this.showBgWheel = !this.showBgWheel;
    }
  }
}
</script>
