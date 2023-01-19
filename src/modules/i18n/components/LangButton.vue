<template>
    <button
        class="language-btn btn"
        :class="buttonClass"
        :title="lang.toUpperCase()"
        :data-cy="`menu-lang-${lang}`"
        @click="changeLang"
    >
        {{ lang.toUpperCase() }}
    </button>
</template>

<script>
import log from '@/utils/logging'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
    props: {
        lang: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            selected: false,
        }
    },
    computed: {
        ...mapGetters(['isDesktopMode']),
        ...mapState({
            currentLang: (state) => state.i18n.lang,
        }),
        buttonClass() {
            let classes = ''
            if (this.isDesktopMode) {
                classes += 'm-0 px-1 btn-xs btn-link custom-text-decoration'
                if (this.selected) {
                    classes += ' text-primary'
                } else {
                    classes += ' text-black'
                }
            } else {
                classes += ' mobile-view btn-sm mx-1'
                if (this.selected) {
                    classes += ' btn-primary'
                } else {
                    classes += ' btn-light'
                }
            }
            return classes
        },
    },
    watch: {
        currentLang(newLang) {
            this.updateSelection(newLang)
        },
    },
    mounted() {
        this.updateSelection(this.currentLang)
    },
    methods: {
        ...mapActions(['setLang']),
        changeLang() {
            log.debug('switching locale', this.lang)
            this.selected = true
            this.setLang(this.lang)
        },
        updateSelection(currentLang) {
            if (currentLang === this.lang) {
                this.selected = true
            } else {
                this.selected = false
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

.mobile-view {
    width: 40px;
}

.custom-text-decoration {
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
}
</style>
