<template>
  <div class="bg-selector-container">
    <div class="bg-selector"
         :class="`bg-${currentBackgroundLayerWithVoid.id.replaceAll('.', '-')}`"
         @click="toggleBackgroundWheel">
    </div>
    <div class="bg-selector-wheel">
      <transition-group name="bg-slide-up">
        <div v-show="showBgWheel"
             class="bg-selector"
             v-for="(background) in backgroundLayersWithVoid"
             :key="background.id"
             :class="[`bg-${background.id.replaceAll('.', '-')}`, `bg-index-${background.index}`, { 'active': background.index === currentBackgroundLayerIndex }]"
             @click="selectBackgroundWithIndex(background.index)">
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style lang="scss">
@import "node_modules/bootstrap/scss/bootstrap";

$bg-button-size: 2rem;
$bg-button-shadow-size: 1rem;
$bg-button-size-in-wheel: $bg-button-size + 0.5rem;

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
  &.bg-void {
    background: $white;
  }
}
.bg-selector-wheel {
  position: absolute;
  bottom: 3.2rem;
  .bg-selector {
    height: $bg-button-size-in-wheel;
    width: $bg-button-size-in-wheel;
    border-radius: $bg-button-size-in-wheel / 2;
    margin-top: 1.2rem;
    margin-left: -0.25rem;
    &.bg-ch-swisstopo-pixelkarte-farbe {
      background-position: -140px 0;
    }
    &.bg-ch-swisstopo-pixelkarte-grau {
      background-position: -75px 0;
    }
    &.active:after {
      background: $red;
    }
    &:after {
      left: -0.25rem;
      top: -0.25rem;
    }
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
import { mapGetters, mapActions, mapState } from 'vuex'

const voidLayer = {
  id: 'void',
  index: -1
}

export default {
  data() {
    return {
      showBgWheel: false,
    }
  },
  computed: {
    ...mapGetters(['backgroundLayers', 'currentBackgroundLayer']),
    ...mapState({
      currentBackgroundLayerIndex: state => state.layers.backgroundIndex,
    }),
    currentBackgroundLayerWithVoid: function () {
      const currentBg = this.currentBackgroundLayer;
      if (!currentBg) {
        return voidLayer;
      }
      return currentBg;
    },
    backgroundLayersWithVoid: function () {
      const bgLayers = [];
      this.backgroundLayers.forEach((bg, index) => {
        bgLayers.push({...bg, index: index})
      });
      bgLayers.push(voidLayer)
      return bgLayers;
    },
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
