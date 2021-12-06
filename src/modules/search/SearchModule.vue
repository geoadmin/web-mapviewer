<template>
    <div id="search" class="mx-2 flex-grow-1">
        <span class="float-start d-none d-lg-block">{{ $t('search_title') }}</span>
        <SearchBar class="search-bar" />
        <SearchResultList />
    </div>
</template>

<script>
import SearchBar from './components/SearchBar.vue'
import SearchResultList from './components/SearchResultList.vue'

export default {
    components: {
        SearchResultList,
        SearchBar,
    },
    computed: {},
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
#search {
    width: 100%;
}
@include media-breakpoint-only(md) {
    .search-bar {
        max-width: 50vw;
    }
}
</style>
