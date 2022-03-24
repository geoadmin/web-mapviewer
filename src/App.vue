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
import { mapActions } from 'vuex'

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
    mounted() {
        // reading size
        this.setScreenSizeFromWindowSize()
        window.addEventListener('resize', this.setScreenSizeFromWindowSize)
    },
    unmounted() {
        window.removeEventListener('resize', this.setScreenSizeFromWindowSize)
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
</style>
