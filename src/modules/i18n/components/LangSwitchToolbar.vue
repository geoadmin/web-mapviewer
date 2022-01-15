<template>
    <div class="lang-switch-toolbar p-1">
        <LangSwitchButton
            v-for="lang in languages"
            :key="lang"
            :on-click="changeLang"
            :lang="lang"
            :is-active="lang === currentLang"
        />
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import LangSwitchButton from './LangSwitchButton.vue'
import { languages } from '../index'
import log from '@/utils/logging'

export default {
    components: { LangSwitchButton },
    data() {
        return {
            languages: Object.keys(languages),
        }
    },
    computed: {
        ...mapState({
            currentLang: (state) => state.i18n.lang,
        }),
    },
    methods: {
        changeLang: function (lang) {
            log('debug', 'switching locale', lang)
            this.setLang(lang)
        },
        ...mapActions(['setLang']),
    },
}
</script>
