<template>
    <div id="main-component">
        <router-view />
        <div id="toolbox"></div>
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
        window.onresize = () => {
            this.setScreenSizeFromWindowSize()
        }
    },
    methods: {
        ...mapActions(['setSize', 'setUiMode']),
        setScreenSizeFromWindowSize: function () {
            this.setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        },
    },
}
</script>

<style lang="scss">
@import 'src/scss/webmapviewer-bootstrap-theme';
// this import needs to happen only once, otherwise bootstrap is import/added
// to the output CSS as many time as this file is imported
@import 'node_modules/bootstrap/scss/bootstrap';
#main-component {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}
#toolbox {
    position: absolute;
    z-index: $zindex-toolbox;
    width: 100%;
    height: 100%;
    pointer-events: none;
    & > * {
        pointer-events: all;
    }
}
</style>
