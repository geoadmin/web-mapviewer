<template>
    <div
        id="main-component"
        :class="{ outlines: showOutlines }"
        @keydown="setOutlines(true)"
        @pointerdown="setOutlines(false)"
    >
        <router-view />
    </div>
</template>

<script>
import debounce from '@/utils/debounce'
import { mapActions, mapState } from 'vuex'

/**
 * Main component of the App.
 *
 * Will listen for screen size changes and commit this changes to the store
 */
export default {
    name: 'App',
    data() {
        return {
            showOutlines: false,
        }
    },
    computed: {
        ...mapState({
            lang: (state) => state.i18n.lang,
        }),
    },
    watch: {
        lang: function () {
            this.refreshPageTitle()
        },
    },
    mounted() {
        // reading size
        this.setScreenSizeFromWindowSize()
        this.debouncedOnResize = debounce(this.setScreenSizeFromWindowSize, 300)
        window.addEventListener('resize', this.debouncedOnResize, { passive: true })
        this.refreshPageTitle()
    },
    unmounted() {
        window.removeEventListener('resize', this.debouncedOnResize)
    },
    methods: {
        ...mapActions(['setSize']),
        setScreenSizeFromWindowSize() {
            this.setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        },
        setOutlines(state) {
            this.showOutlines = state
        },
        refreshPageTitle() {
            document.title = this.$i18n.t('page_title')
        },
    },
}
</script>

<style lang="scss">
// this style is not scoped in order to enable the distribution of bootstrap's
// CSS rules to the whole app (otherwise it would be limited to this component)
@import 'src/scss/webmapviewer-bootstrap-theme';
// this import needs to happen only once, otherwise bootstrap is import/added
// to the output CSS as many time as this file is imported
@import 'node_modules/bootstrap/scss/bootstrap';
// tippy-theme needs to be imported once and for the whole app in order to work
// properly therefore it is imported here in the un-scoped app styling.
@import 'src/scss/tippy-theme';

#main-component {
    font-family: $frutiger;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: $coal;
}

:focus {
    outline-style: none;
    .outlines & {
        outline-offset: 0px;
        outline: $focus-outline;
    }
}
</style>
