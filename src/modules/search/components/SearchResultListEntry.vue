<template>
  <div class="search-category-entry"
       @click="onClick"
       @mouseover="onMouseOver"
       @mouseleave="onMouseLeave">
    <span v-html="entry.title"></span>
  </div>
</template>

<style lang="scss">
@import "node_modules/bootstrap/scss/bootstrap";
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
import {SearchResult} from "../../../api/search.api";

export default {
  props: {
    entry: {
      type: SearchResult,
      required: true,
    }
  },
  methods: {
    ...mapActions(['selectResultEntry']),
    onClick: function () {
      this.selectResultEntry(this.entry);
    },
    onMouseOver: function () {
    },
    onMouseLeave: function () {
    }
  }
}
</script>
