import { isMobile } from 'mobile-device-detect'

/**
 * Describes the different mode the UI can have. Either desktop (menu is always shown, info box is a
 * side tray) or touch (menu has to be opened with a button, info box is a swipeable element)
 *
 * @type enum
 */
export const UIModes = {
    DESKTOP: 'DESKTOP',
    TOUCH: 'TOUCH',
}

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
         * By default, on desktop mode, the menu is shown as a side menu. On mobile/touch it is
         * hidden as it requires a click on a button to be shown (in order to clear up screen space)
         *
         * @type Boolean
         */
        showMenuTray: !isMobile,
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
        /**
         * Current UI mode of the application, dictates how the menu interaction is made (for touch
         * the menu has to be opened through a button, for desktop it is always shown) and how the
         * information about a selected feature are shown.
         *
         * @type UIModes
         */
        mode: isMobile ? UIModes.TOUCH : UIModes.DESKTOP,
    },
    getters: {
        screenDensity: (state) => {
            if (state.height === 0) {
                return 0
            }
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
        setUiMode: ({ commit }, mode) => {
            if (mode in UIModes) {
                commit('setUiMode', mode)
                switch (mode) {
                    case UIModes.TOUCH:
                        // if going to mobile/touch, we hide the menu tray
                        commit('setShowMenuTray', false)
                        break
                    case UIModes.DESKTOP:
                        // if going desktop, the menu should be visible by default
                        commit('setShowMenuTray', true)
                        // no need of the overlay in desktop (the menu is always shown)
                        // TODO: hide overlay
                        break
                }
            }
        },
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
        setUiMode: (state, mode) => (state.mode = mode),
    },
}
