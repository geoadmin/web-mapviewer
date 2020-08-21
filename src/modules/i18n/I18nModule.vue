<template>
    <div class="i18n-module">
        <LangSwitchButton v-for="lang in languages" :key="lang" :on-click="changeLang" :lang="lang"></LangSwitchButton>
    </div>
</template>

<style>
    .i18n-module {
        position: absolute;
        top: 0;
        right: 0;
        margin: auto;
        width: 100%;
    }
</style>

<script>
    import LangSwitchButton from "./components/LangSwitchButton";
    import i18n, { languages } from "./index";

    export default {
        components: { LangSwitchButton },
        methods: {
            changeLang: (lang) => {
                console.debug('switching locale', lang);
                i18n.locale = lang;
            }
        },
        data() {
            return {
                languages: Object.keys(languages)
            }
        }
    }
</script>
