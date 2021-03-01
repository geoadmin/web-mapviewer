<template>
    <img class="swiss-flag" :src="swissFlagIcon" alt="swiss-flag" />
</template>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
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
