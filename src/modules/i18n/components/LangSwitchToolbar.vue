<template>
    <div class="lang-switch-toolbar p-1">
        <button
            v-for="lang in languages"
            :key="lang"
            class="btn btn-sm"
            :class="{
                'btn-light': lang !== currentLang,
                'btn-primary': lang === currentLang,
            }"
            :title="lang.toUpperCase()"
            :data-cy="'menu-lang-' + lang"
            @click="changeLang(lang)"
        >
            {{ lang.toUpperCase() }}
        </button>
    </div>
</template>

<script>
import log from '@/utils/logging'
import { mapActions, mapGetters, mapState } from 'vuex'
import { languages } from '../index'

export default {
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

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.lang-switch-toolbar {
    transition: max-height 0.3s linear;
    button {
        width: 3rem;
        margin-right: 3px;
        margin-left: 3px;
    }
}
</style>
