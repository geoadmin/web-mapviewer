/**
 * Module that stores all information related to the UI, for instance if a portion of the UI (like
 * the header) should be visible right now or not. Most actions from this module will be
 * used/synchronized by store plugins as it involved listening to some mutation to trigger this change.
 */
export default {
    state: {
        /**
         * Height of the viewport (in px)
         *
         * @type Number
         */
        height: 0,
        /**
         * Width of the viewport (in px)
         *
         * @type Number
         */
        width: 0,
        /**
         * Flag telling if the menu tray (where the layer options, layer tree and other stuff is)
         * should be open
         *
         * @type Boolean
         */
        showMenuTray: false,
        /**
         * Flag telling if the header bar should be visible (so that we can go map fullscreen)
         *
         * @type Boolean
         */
        showHeader: true,
        /**
         * Flag telling if the footer should be visible (so that we can go map fullscreen)
         *
         * @type Boolean
         */
        showFooter: true,
        /**
         * Flag telling if the background wheel button should be visible
         *
         * @type Boolean
         */
        showBackgroundWheel: true,
        /**
         * Flag telling if a loading bar should be shown to tell the user something is on going
         *
         * @type Boolean
         */
        showLoadingBar: true,
        /**
         * Flag telling if the zoom and the geolocation buttons should be visible
         *
         * @type Boolean
         */
        showZoomGeolocationButtons: true,
        /**
         * Flag telling if the drawing toolkit / overlay should be visible
         *
         * @type Boolean
         */
        showDrawingOverlay: false,
    },
    getters: {
        screenDensity: (state) => {
            if (state.height === 0) return 0
            return state.width / state.height
        },
    },
    actions: {
        setSize: ({ commit }, { width, height }) => {
            commit('setSize', {
                height,
                width,
            })
        },
        toggleMenuTray: ({ commit, state }) => commit('setShowMenuTray', !state.showMenuTray),
        toggleHeader: ({ commit, state }) => commit('setShowHeader', !state.showHeader),
        toggleFooter: ({ commit, state }) => commit('setShowFooter', !state.showFooter),
        toggleBackgroundWheel: ({ commit, state }) =>
            commit('setShowBackgroundWheel', !state.showBackgroundWheel),
        toggleLoadingBar: ({ commit, state }) => commit('setShowLoadingBar', !state.showLoadingBar),
        toggleZoomGeolocationButtons: ({ commit, state }) =>
            commit('setShowZoomGeolocationButtons', !state.showZoomGeolocationButtons),
        toggleDrawingOverlay: ({ commit, state }) =>
            commit('setShowDrawingOverlay', !state.showDrawingOverlay),
    },
    mutations: {
        setSize: (state, { height, width }) => {
            state.height = height
            state.width = width
        },
        setShowMenuTray: (state, flagValue) => (state.showMenuTray = flagValue),
        setShowHeader: (state, flagValue) => (state.showHeader = flagValue),
        setShowFooter: (state, flagValue) => (state.showFooter = flagValue),
        setShowBackgroundWheel: (state, flagValue) => (state.showBackgroundWheel = flagValue),
        setShowLoadingBar: (state, flagValue) => (state.showLoadingBar = flagValue),
        setShowZoomGeolocationButtons: (state, flagValue) =>
            (state.showZoomGeolocationButtons = flagValue),
        setShowDrawingOverlay: (state, flagValue) => (state.showDrawingOverlay = flagValue),
    },
}
