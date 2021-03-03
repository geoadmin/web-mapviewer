<template>
    <div id="splashscreen">
        <MenuModule>
            <SearchModule />
        </MenuModule>
    </div>
</template>

<script>
import MenuModule from '@/modules/menu/MenuModule'
import SearchModule from '@/modules/search/SearchModule'
export default {
    components: { SearchModule, MenuModule },
}
</script>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
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
