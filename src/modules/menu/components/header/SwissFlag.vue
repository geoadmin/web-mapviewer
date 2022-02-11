<template>
    <img class="swiss-flag" :src="swissFlagIcon" alt="swiss-flag" @click="$emit('click', $event)" />
</template>

<script>
import swissFlagIcon from '@/assets/svg/swiss-flag.svg'
export default {
    emits: ['click'],
    data() {
        return {
            swissFlagIcon,
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
}
@include media-breakpoint-down(md) {
    .swiss-flag {
        height: 21px;
    }
}
</style>
