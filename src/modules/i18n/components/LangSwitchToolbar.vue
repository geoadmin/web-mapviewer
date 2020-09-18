<template>
  <div class="lang-switch-toolbar p-1">
    <LangSwitchButton class="m-1" v-for="lang in languages" :key="lang" :on-click="changeLang" :lang="lang"></LangSwitchButton>
  </div>
</template>

<style lang="scss">
  .lang-switch-toolbar {
  }
</style>

<script>
import { mapActions } from "vuex";
import LangSwitchButton from "./LangSwitchButton";
import { languages } from "../index";

export default {
  components: { LangSwitchButton },
  methods: {
    changeLang: function(lang) {
      console.debug('switching locale', lang);
      this.setLang(lang);
    },
    ...mapActions(['setLang'])
  },
  data() {
    return {
      languages: Object.keys(languages)
    }
  }
}
</script>
