<template>
    <div id="splashscreen">
        <MenuModule />
    </div>
</template>

<script>
import MenuModule from '@/modules/menu/MenuModule.vue'
export default {
    components: { MenuModule },
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
