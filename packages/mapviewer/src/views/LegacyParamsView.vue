<script lang="ts" setup>
import { computed } from 'vue'

import HeaderWithSearch from '@/modules/menu/components/header/HeaderWithSearch.vue'
import useUIStore from '@/store/modules/ui.store'
import LoadingBar from '@/utils/components/LoadingBar.vue'

const { embed = false } = defineProps<{
    embed?: boolean
}>()

const uiStore = useUIStore()

const showLoadingBar = computed<boolean>(() => uiStore.showLoadingBar)
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
