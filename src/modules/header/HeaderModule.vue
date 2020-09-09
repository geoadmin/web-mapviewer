<template>
  <div class="header d-flex align-items-center">
    <icon class="swiss-flag m-1"
          data="@icon/swiss-flag.svg"
          color="#8A99B2 r-#1C2330"></icon>
    <div class="searchbar-container input-group">
      <div class="input-group-prepend">
        <span class="input-group-text" id="search-icon">
          <i class="fa fa-search"></i>
        </span>
      </div>
      <input type="text"
             class="form-control"
             :placeholder="$t('search_placeholder')"
             aria-label="Search"
             aria-describedby="search-icon">
    </div>
    <button type="button" class="btn btn-default">
      <i class="fa fa-bars"></i>
    </button>
  </div>
</template>

<style lang="scss">
  @import "node_modules/bootstrap/scss/bootstrap";

  .header {
    position: absolute;
    top: 0;
    left: 0;
    height: 3em;
    width: 100%;
    background: $white;
    border-bottom: 4px solid $red;

    .swiss-flag {
      height: 2em;
      width: 2em;
      :first-child {
        fill: $red;
      }
      :last-child {
        fill: $white;
      }
    }
  }
</style>

<script>

import swissFlag from '@/assets/svg/swiss-flag.svg'

export default {
  data: () => {
    return {
      swissFlag: swissFlag
    }
  }
}
</script>
