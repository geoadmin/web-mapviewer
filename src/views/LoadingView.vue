<template>
    <div id="splashscreen">
        <HeaderWithSearch v-if="!embedded" />
        <LoadingBar v-if="embedded && showLoadingBar" />
    </div>
</template>

<script>
import { mapState } from 'vuex'

import HeaderWithSearch from '@/modules/menu/components/header/HeaderWithSearch.vue'
import LoadingBar from '@/utils/LoadingBar.vue'

export default {
    components: { LoadingBar, HeaderWithSearch },
    computed: {
        ...mapState({
            embedded: (state) => state.ui.embeddedMode,
            showLoadingBar: (state) => state.ui.showLoadingBar,
        }),
    },
}
</script>

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
