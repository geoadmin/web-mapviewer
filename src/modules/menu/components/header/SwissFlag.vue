<template>
    <img
        class="swiss-flag"
        :class="{ 'dev-site': devSiteWarning }"
        :src="swissFlagIcon"
        alt="swiss-flag"
        @click="$emit('click', $event)"
    />
</template>

<script>
import swissFlagIcon from '@/assets/svg/swiss-flag.svg'
import { DEV_SITE_WARNING } from '@/config'
export default {
    emits: ['click'],
    data() {
        return {
            swissFlagIcon,
            devSiteWarning: DEV_SITE_WARNING,
        }
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.swiss-flag {
    height: 34px;
    &.dev-site {
        filter: hue-rotate(225deg);
    }
}
@include media-breakpoint-down(md) {
    .swiss-flag {
        height: 21px;
    }
}
</style>
