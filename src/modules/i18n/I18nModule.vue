<template>
    <div class="i18n-module">
        <LangSwitchButton :on-click="changeLang" :lang="'fr'"></LangSwitchButton>
        <LangSwitchButton :on-click="changeLang" :lang="'de'"></LangSwitchButton>
    </div>
</template>

<style>
    .i18n-module {
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
    }
</style>

<script>
    import LangSwitchButton from "./components/LangSwitchButton";
    import i18n from "./index";

    export default {
        components: { LangSwitchButton },
        methods: {
            changeLang: (lang) => {
                console.log('switching locale', lang);
                i18n.locale = lang;
            }
        }
    }
</script>
