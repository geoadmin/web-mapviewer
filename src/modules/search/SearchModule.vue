<template>
  <div id="search">
    <SearchBar />
    <SearchResultList />
  </div>
</template>

<style lang="scss">
#search {
  width: 100%;
}
</style>

<script>
import SearchBar from "./components/SearchBar";
import SearchResultList from "./components/SearchResultList";

export default {
  computed: {
  },
  components: {
    SearchResultList,
    SearchBar,
  }
}
</script>
