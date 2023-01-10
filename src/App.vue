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

#main-component {
    font-family: $frutiger;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: $coal;
}

:focus {
    outline-style: none;
    .outlines & {
        outline-offset: 1px;
        outline: $focus-outline;
    }
}

// Importing Tippy globally, so that we do not need to import it in each component using it
@import 'tippy.js/dist/tippy.css';
// Tippy custom style, with a red background color
.tippy-box[data-theme~='danger'] {
    $bgColor: $danger;
    background-color: $bgColor;
    color: $white;
    &[data-placement^='top'] > .tippy-arrow::before {
        border-top-color: $bgColor;
    }
    &[data-placement^='bottom'] > .tippy-arrow::before {
        border-bottom-color: $bgColor;
    }
    &[data-placement^='left'] > .tippy-arrow::before {
        border-left-color: $bgColor;
    }
    &[data-placement^='right'] > .tippy-arrow::before {
        border-right-color: $bgColor;
    }
}
</style>
