<template>
  <div id="search-bar" class="d-flex flex-fill">
    <input type="text"
           ref="search"
           class="form-control"
           :placeholder="$t('search_placeholder')"
           aria-label="Search"
           aria-describedby="search-icon"
           :value="searchQuery"
           @input="updateSearchQuery"
           @focus="showSearchResultsIfExists"
    />
    <button id="clear-search-button"
            class="btn bg-transparent"
            v-show="searchQuery && searchQuery.length > 0"
            @click="clearSearchQuery">
      <i class="fa fa-times"></i>
    </button>
  </div>
</template>

<style lang="scss">
  @import "node_modules/bootstrap/scss/bootstrap";
  #clear-search-button {
    margin-left: -40px;
    z-index: 100;
  }
</style>

<script>
  import { mapActions, mapState } from "vuex";

  export default {
    computed: {
      ...mapState({
        searchQuery: state => state.search.query
      })
    },
    methods: {
      ...mapActions(['setSearchQuery', 'showSearchResults', 'hideSearchResults', 'hideMenuTray', 'hideOverlay']),
      updateSearchQuery: function (e) {
        this.setSearchQuery(e.target.value);
      },
      showSearchResultsIfExists: function () {
        if (this.searchQuery && this.searchQuery.length >= 2) {
          this.showSearchResults();
          this.hideMenuTray();
          this.hideOverlay();
        }
      },
      clearSearchQuery: function () {
        this.setSearchQuery('');
        // we then give back the focus to the search input so the user can seamlessly continue to type search queries
        this.$refs.search.focus();
      },
    }
  };
</script>
