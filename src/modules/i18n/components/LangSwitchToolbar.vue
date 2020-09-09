<template>
  <div class="lang-switch-toolbar">
    <LangSwitchButton v-for="lang in languages" :key="lang" :on-click="changeLang" :lang="lang"></LangSwitchButton>
  </div>
</template>

<style>
</style>

<script>
import LangSwitchButton from "./LangSwitchButton";
import i18n, { languages } from "../index";

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
