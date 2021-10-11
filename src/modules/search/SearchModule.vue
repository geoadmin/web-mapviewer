<template>
    <div id="search">
        <SearchBar />
        <SearchResultList />
    </div>
</template>

<script>
import SearchBar from './components/SearchBar'
import SearchResultList from './components/SearchResultList'

export default {
    components: {
        SearchResultList,
        SearchBar,
    },
    computed: {},
}
</script>

<style lang="scss" scoped>
#search {
    width: 100%;
}
</style>
