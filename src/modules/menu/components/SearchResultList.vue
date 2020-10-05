<template>
  <div id="search-results" v-show="results.show" class="bg-light rounded-bottom">
    <SearchResultCategory :title="$t('locations_results_header')"
                          :half-size="results.layers.length > 0"
                          :entries="results.locations" />
    <SearchResultCategory :title="$t('layers_results_header')"
                          :half-size="results.locations.length > 0"
                          :entries="results.layers" />
  </div>
</template>

<style lang="scss">
  #search-results {
    position: absolute;
    top: 3rem;
    left: 5%;
    width: 90%;
    max-height: calc(75vh - 3rem);
  }
</style>

<script>
import { mapState } from 'vuex'
import SearchResultCategory from "./SearchResultCategory";
export default {
  components: {SearchResultCategory},
  computed: {
    ...mapState({
      results: state => state.menu.search.results
    })
  }
}
</script>
