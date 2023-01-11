<template>
    <div v-if="hasWarningRibbon" class="corner-ribbon" data-cy="warning-ribbon">TEST -
    <a :href="mailTo"><FontAwesomeIcon :icon="['fas', 'comments']" />{{ $t('app_feedback') }}</a> </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
    components: { FontAwesomeIcon },
    data() {
      return {
        mailTo: "mailto:webgis@swisstopo.ch?subject=" +
          encodeURIComponent("Feedback to new viewer"),
      }
  },
    computed: {
        ...mapGetters(['hasWarningRibbon']),
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';
@import 'src/scss/variables-admin';
@import 'src/scss/variables';

/* Corner ribbons, from http://codepen.io/eode9/pen/twkKm
* mobile: ribbon top left, desktop: bottom left
*/


.corner-ribbon > a {
  color: inherit;
  text-decoration: inherit;
}
.fa-comments {
    margin: 5px;
}
.corner-ribbon {
    position: absolute;
    /* top-left */
    top: 100px;
    bottom: auto;
    left: -70px;
    width: 300px;
    transform: rotate(-45deg);
    z-index: $zindex-warning;
    background: $danger;
    color: white;
    text-align: center;
    line-height: 50px;
    letter-spacing: 1px;
    font-weight: bold;
    cursor: pointer;
}

@include respond-above(phone) {
    .corner-ribbon {
        /* bottom-left */
        top: auto;
        bottom: 70px; /* Under cesium inspectors */
        left: -70px;
        width: 300px;
        transform: rotate(45deg);
    }
}
</style>
