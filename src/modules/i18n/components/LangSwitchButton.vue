<template>
  <button class="btn" :class="{ 'btn-default': !isActive, 'btn-danger': isActive }" @click="onClick(lang)">
    {{ lang.toUpperCase() }}
  </button>
</template>

<style>
</style>

<script>
export default {
  props: {
    lang: String,
    onClick: Function,
    isActive: Boolean
  }
}
</script>
