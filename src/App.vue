<template>
    <div id="main-component">
        <router-view />
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

/**
 * Main component of the App.
 *
 * Will listen for screen size changes and commit this changes to the store
 */
export default {
    name: 'App',
    computed: {
        ...mapState({
            currentUiMode: (state) => state.ui.mode,
        }),
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
        ...mapActions(['setSize', 'setUiMode']),
        setScreenSizeFromWindowSize() {
            this.setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
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
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}
</style>
