<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import bootstrapVariable from '@/scss/webmapviewer-bootstrap-theme.scss'
import { UIModes } from '@/modules/store/modules/ui.store'

/**
 * Main component of the App.
 *
 * Will listen for screen size changes and commit this changes to the store
 */
export default {
    name: 'App',
    data() {
        return {
            widthThresholdForMobileMode: parseInt(bootstrapVariable.sm.replace('px', '')),
        }
    },
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
            // we check if the screen width has changed enough to justify a UI
            // mode change (if the menu has to be shrunk, etc...)
            const wantedUiMode =
                window.innerWidth >= this.widthThresholdForMobileMode
                    ? UIModes.DESKTOP
                    : UIModes.TOUCH
            if (wantedUiMode !== this.currentUiMode) {
                this.setUiMode(wantedUiMode)
            }
        },
    },
}
</script>

<style lang="scss">
@import 'src/scss/webmapviewer-bootstrap-theme';
// this import needs to happen only once, otherwise bootstrap is import/added
// to the output CSS as many time as this file is imported
@import 'node_modules/bootstrap/scss/bootstrap';
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}
</style>
