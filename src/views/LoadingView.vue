<template>
    <div id="splashscreen">
        <HeaderWithSearch />
    </div>
</template>

<script>
import HeaderWithSearch from '@/modules/menu/components/header/HeaderWithSearch.vue'

export default {
    components: { HeaderWithSearch },
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
