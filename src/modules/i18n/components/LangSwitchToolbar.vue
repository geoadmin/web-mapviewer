<template>
    <div class="lang-switch-toolbar p-1 btn-group">
        <ButtonWithIcon
            v-for="lang in languages"
            :key="lang"
            :lang="lang"
            :danger="lang === currentLang"
            :transparent="lang !== currentLang"
            :button-title="lang.toUpperCase()"
            :small="isUIinDesktopMode"
            @click="changeLang(lang)"
        />
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { languages } from '../index'
import log from '@/utils/logging'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import { UIModes } from '@/modules/store/modules/ui.store'

export default {
    components: { ButtonWithIcon },
    data() {
        return {
            languages: Object.keys(languages),
        }
    },
    computed: {
        ...mapState({
            currentLang: (state) => state.i18n.lang,
            uiMode: (state) => state.ui.mode,
        }),
        isUIinDesktopMode: function () {
            return this.uiMode === UIModes.MENU_ALWAYS_OPEN
        },
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
