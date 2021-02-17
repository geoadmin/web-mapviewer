<template>
  <icon class="swiss-flag" data="@icon/swiss-flag.svg" />
</template>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
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
</style>

<script>
export default {}
</script>
