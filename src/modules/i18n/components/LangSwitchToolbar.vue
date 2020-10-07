<template>
  <div class="lang-switch-toolbar p-1">
    <LangSwitchButton v-for="lang in languages"
                      :key="lang"
                      :on-click="changeLang"
                      :lang="lang"
                      :is-active="lang === currentLang"
    />
  </div>
</template>

<style lang="scss">
  .lang-switch-toolbar {
  }
</style>

<script>
import { mapActions, mapState } from "vuex";
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
  computed: {
    ...mapState({
      currentLang: state => state.i18n.lang
    })
  },
  data() {
    return {
      languages: Object.keys(languages)
    }
  }
}
</script>
