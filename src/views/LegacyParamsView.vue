<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

import HeaderWithSearch from '@/modules/menu/components/header/HeaderWithSearch.vue'
import LoadingBar from '@/utils/components/LoadingBar.vue'

const store = useStore()

const embedded = computed(() => store.state.ui.embeddedMode)
const showLoadingBar = computed(() => store.state.ui.showLoadingBar)
</script>

<template>
    <div id="splashscreen">
        <HeaderWithSearch v-if="!embedded" />
        <LoadingBar v-if="showLoadingBar" />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
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
