<template>
    <img
        class="swiss-flag"
        :class="{ 'dev-site': hasDevSiteWarning, sm }"
        :src="swissFlagIcon"
        alt="swiss-flag"
        @click="$emit('click', $event)"
    />
</template>

<script>
import swissFlagIcon from '@/assets/svg/swiss-flag.svg'
import { mapGetters } from 'vuex'

export default {
    props: {
        sm: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['click'],
    data() {
        return {
            swissFlagIcon,
        }
    },
    computed: {
        ...mapGetters(['hasDevSiteWarning']),
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/media-query.mixin';

// WARNING: We cannot use bootstrap img-fluid to automatically set the height of the swiss-flag
// as it totally breaks the header and menu on Iphone !
.swiss-flag {
    height: 24px;
    &.sm {
        height: 16px;
    }
    &.dev-site {
        filter: hue-rotate(225deg);
    }
}
@include respond-above(lg) {
    .swiss-flag {
        height: 34px;
        &.sm {
            height: 16px;
        }
    }
}
</style>
