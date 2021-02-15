<template>
  <div
    class="search-category-entry"
    data-cy="search-result-entry"
    @click="onClick"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
  >
    <!-- eslint-disable-next-line vue/no-v-html-->
    <span v-html="entry.title"></span>
  </div>
</template>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
.search-category-entry {
  @extend .p-2;
  @extend .pl-4;
  @extend .border-bottom;
  @extend .border-light;

  @include media-breakpoint-up(sm) {
    &:hover {
      background-color: $dark;
      color: $light;
    }
  }
}
</style>

<script>
import { mapActions } from 'vuex'
import { SearchResult } from '@/api/search.api'

/** Component showing one search result entry (and dispatching its selection to the store) */
export default {
  props: {
    entry: {
      type: SearchResult,
      required: true,
    },
  },
  methods: {
    ...mapActions(['selectResultEntry']),
    onClick: function () {
      this.selectResultEntry(this.entry)
    },
    onMouseOver: function () {},
    onMouseLeave: function () {},
  },
}
</script>
