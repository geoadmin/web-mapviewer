<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import HeaderWithSearch from '@/modules/menu/components/header/HeaderWithSearch.vue'
import LoadingBar from '@/utils/components/LoadingBar.vue'

const store = useStore()

const { embed } = defineProps({
    embed: {
        type: Boolean,
        default: false,
    },
})

const showLoadingBar = computed(() => store.getters.showLoadingBar)
</script>

<template>
    <div id="splashscreen">
        <HeaderWithSearch v-if="!embed" />
        <LoadingBar v-if="showLoadingBar" />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

#splashscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: $white url('../assets/grid.png');
}
</style>
