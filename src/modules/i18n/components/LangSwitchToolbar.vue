<template>
    <div
        :class="{
            'lang-switch-menu': !isDesktopMode,
            'p-1': !isDesktopMode,
            'lang-switch-header': isDesktopMode,
        }"
    >
        <button
            v-for="lang in languages"
            :key="lang"
            :class="buttonClass(lang)"
            :title="lang.toUpperCase()"
            :data-cy="`menu-lang-${lang}`"
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
        buttonClass(lang) {
            let classes = 'btn'
            if (this.isDesktopMode) {
                classes += ' btn-xs btn-link custom-text-decoration'
                if (lang === this.currentLang) {
                    classes += ' text-primary'
                } else {
                    classes += ' text-black'
                }
            } else {
                classes += ' btn-sm ms-2 me-2'
                if (lang === this.currentLang) {
                    classes += ' btn-primary'
                } else {
                    classes += ' btn-light'
                }
            }
            return classes
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.custom-text-decoration {
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
}
.lang-switch-menu {
    transition: max-height 0.3s linear;
}
</style>
