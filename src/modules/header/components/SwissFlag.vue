<script setup>
import { computed, toRefs } from 'vue'
import { useStore } from 'vuex'

import swissFlagIcon from '@/assets/svg/swiss-flag.svg'

const props = defineProps({
    sm: {
        type: Boolean,
        default: false,
    },
})

const { sm } = toRefs(props)

const emits = defineEmits(['click'])

const store = useStore()
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
</script>

<template>
    <img
        class="swiss-flag"
        :class="{ 'dev-site': hasDevSiteWarning, sm }"
        :src="swissFlagIcon"
        alt="swiss-flag"
        @click="(e) => emits('click', e)"
    />
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';

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
