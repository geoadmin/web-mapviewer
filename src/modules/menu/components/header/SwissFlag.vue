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
        ...mapGetters(['hasDevSiteWarning']),
    },
}
</script>
