<template>
    <img class="swiss-flag" :src="swissFlagIcon" alt="swiss-flag" />
</template>

<script>
import swissFlagIcon from '@/assets/svg/swiss-flag.svg'
export default {
    data() {
        return {
            swissFlagIcon,
        }
    },
}
</script>

<style lang="scss">
@import 'src/scss/bootstrap-theme';
.swiss-flag {
    height: 2em;
    width: 2em;
    :first-child {
        fill: $red;
    }
    :last-child {
        fill: $white;
    }
}
</style>
