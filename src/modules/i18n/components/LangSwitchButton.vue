<template>
  <button
    class="btn"
    :class="{ 'btn-default': !isActive, 'btn-danger': isActive }"
    @click="onClick(lang)"
  >
    {{ lang.toUpperCase() }}
  </button>
</template>

<style></style>

<script>
export default {
  props: {
    lang: {
      type: String,
      default: 'en',
    },
    onClick: {
      type: Function,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
