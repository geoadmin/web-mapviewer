<template>
  <div>
    <h4>Background</h4>
    <div class="btn-group">
      <button class="btn bg-selector"
              v-for="(background, index) in backgroundLayers"
              :key="background.id"
              :class="`bg-${background.id.replaceAll('.', '-')}`"
              @click="selectBackgroundWithIndex(index)">
        <img src="../assets/backgrounds.jpg" alt="background-selector" />
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.bg-selector {

  max-height: 3rem;
  max-width: 3rem;
  overflow: hidden;
  img {
    height: 3rem;
    margin-top: -6px;
  }

  &.bg-ch-swisstopo-pixelkarte-farbe img {
    margin-left: -180px;
  }
  &.bg-ch-swisstopo-pixelkarte-grau img {
    margin-left: -106px;
  }
  &.bg-ch-swisstopo-swissimage img {
    margin-left: -16px;
  }
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  computed: {
    ...mapGetters(['backgroundLayers']),
  },
  methods: {
    ...mapActions(['setBackgroundIndex']),
    selectBackgroundWithIndex: function (index) {
      this.setBackgroundIndex(index);
    },
  }
}
</script>
