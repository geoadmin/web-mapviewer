<script setup>
import { computed, toRefs } from 'vue'
import { useStore } from 'vuex'

import HeaderWithSearch from '@/modules/menu/components/header/HeaderWithSearch.vue'
import LoadingBar from '@/utils/components/LoadingBar.vue'

const store = useStore()

const props = defineProps({
    embed: {
        type: Boolean,
        default: false,
    },
})
const { embed } = toRefs(props)

const showLoadingBar = computed(() => store.state.ui.showLoadingBar)
</script>

<template>
    <div id="splashscreen">
        <HeaderWithSearch v-if="!embed" />
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
