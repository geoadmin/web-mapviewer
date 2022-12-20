<template>
    <img
        class="swiss-flag"
        :class="{ 'dev-site': hasDevSiteWarning }"
        :src="swissFlagIcon"
        alt="swiss-flag"
        @click="$emit('click', $event)"
    />
</template>

<script>
import swissFlagIcon from '@/assets/svg/swiss-flag.svg'
import { mapGetters } from 'vuex'

export default {
    emits: ['click'],
    data() {
        return {
            swissFlagIcon,

        }
    },
    computed: {
      ...mapGetters([
        'hasDevSiteWarning',
      ]),
    }
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
@import 'src/scss/media-query.mixin';
.swiss-flag {
    height: 21px;
    &.dev-site {
        filter: hue-rotate(225deg);
    }
}
@include respond-above(tablet) {
    .swiss-flag {
        height: 34px;
    }
}
</style>
