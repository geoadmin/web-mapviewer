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
import { ENVIRONMENT } from '@/config'
export default {
    emits: ['click'],
    data() {
        return {
            swissFlagIcon,
            devSiteWarning: ENVIRONMENT !== 'production',
        }
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.swiss-flag {
    height: 34px;
    :first-child {
        fill: $red;
    }
    :last-child {
        fill: $white;
    }
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
