<template>
    <div class="lang-switch-toolbar p-1 btn-group">
        <ButtonWithIcon
            v-for="lang in languages"
            :key="lang"
            :lang="lang"
            :danger="lang === currentLang"
            :transparent="lang !== currentLang"
            :button-title="lang.toUpperCase()"
            :small="isDesktopMode"
            :data-cy="'menu-lang-' + lang"
            @click="changeLang(lang)"
        />
    </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import { languages } from '../index'
import log from '@/utils/logging'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'

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
        }),
        ...mapGetters(['isDesktopMode']),
    },
    methods: {
        changeLang(lang) {
            log.debug('switching locale', lang)
            this.setLang(lang)
        },
        ...mapActions(['setLang']),
    },
}
</script>
