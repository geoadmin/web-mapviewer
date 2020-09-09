<template>
  <a class="i18n-lang-switch" @click="onClick(lang)">{{ lang.toUpperCase() }}</a>
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
