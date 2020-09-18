<template>
  <button class="btn btn-default" @click="onClick(lang)">
    {{ lang.toUpperCase() }}
  </button>
</template>

<style>
    .i18n-lang-switch {

    }
</style>

<script>
    export default {
        props: {
            lang: String,
            onClick: Function
        }
    }
</script>
