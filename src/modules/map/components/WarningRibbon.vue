<template>
    <div v-if="hasWarningRibbon" class="corner-ribbon" data-cy="warning-ribbon">TEST</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
      ...mapGetters([
            'hasWarningRibbon',
      ]),

    }

}
</script>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/scss/variables-admin';
@import 'src/scss/variables';

/* Corner ribbons, from http://codepen.io/eode9/pen/twkKm
* mobile: ribbon top left, desktop: bottom left
*/

.corner-ribbon {
  position: absolute;
  /* top-left */
  top: 78px;
  bottom: auto;
  left: -50px;
  width: 200px;
  transform: rotate(-45deg);
  z-index: $zindex-warning;
  background: $red;
  color: white;
  text-align: center;
  line-height: 50px;
  letter-spacing: 1px;
  font-weight: bold;
}


@include respond-above(phone) {
  .corner-ribbon {
    /* bottom-left */
    top: auto;
    bottom: 50px; /* Under cesium inspectors */
    left: -100px;
    width: 300px;
    transform: rotate(45deg);
  }
}
</style>
