<template>
    <button class="i18n-lang-switch" @click="onClick(lang)">{{ lang.toUpperCase() }}</button>
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
