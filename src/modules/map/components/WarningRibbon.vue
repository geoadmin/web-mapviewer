<template>
    <div v-if="hasWarningRibbon" class="corner-ribbon" data-cy="warning-ribbon">TEST</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
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
$ribbon-halfwidth: 180px;
$ribbon-halfheight: 25px;
$dist-from-border: 50px; // Distance of the text's center from the border

.corner-ribbon {
    position: absolute;
    /* top-left */
    top: calc(#{-$ribbon-halfheight + $dist-from-border} + #{$header_height});
    bottom: auto;
    left: -$ribbon-halfwidth + $dist-from-border;
    width: 2 * $ribbon-halfwidth;
    transform: rotate(-45deg);
    z-index: $zindex-warning;
    background: $danger;
    color: white;
    text-align: center;
    line-height: 2 * $ribbon-halfheight;
    letter-spacing: 1px;
    font-weight: bold;
}

@include respond-above(phone) {
    .corner-ribbon {
        /* bottom-left */
        top: auto;
        // 25px is ca. the height of the footer
        bottom: -$ribbon-halfheight + $dist-from-border + 25px; /* Under cesium inspectors */
        transform: rotate(45deg);
    }
}
</style>
