import { BREAKPOINT_TABLET } from '@/config'

/**
 * Describes the different mode the UI can have. Either desktop (menu is always shown, info box is a
 * side tray) or touch (menu has to be opened with a button, info box is a swipeable element)
 *
 * @type enum
 */
export const UIModes = {
    MENU_ALWAYS_OPEN: 'MENU_ALWAYS_OPEN',
    MENU_OPENED_THROUGH_BUTTON: 'MENU_OPENED_THROUGH_BUTTON',
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
         * should be open while on mobile
         *
         * By default, on desktop mode, the menu is shown as a side menu. On mobile/touch it is
         * hidden as it requires a click on a button to be shown (in order to clear up screen space)
         *
         * This flag is only valid while the UI mode is MENU_OPENED_THROUGH_BUTTON
         *
         * @type Boolean
         */
        showMenuTray: false,
        /**
         * Flag telling if the app should be shown in fullscreen mode, meaning that :
         *
         * - The header bar should be hidden
         * - The footer should be hidden
         * - Tool buttons (background wheel, zoom, geolocation) should be hidden
         *
         * @type Boolean
         */
        fullscreenMode: false,
        /**
         * Flag telling if a loading bar should be shown to tell the user something is on going
         *
         * @type Boolean
         */
        showLoadingBar: true,
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
         * @type String
         */
        mode: UIModes.MENU_OPENED_THROUGH_BUTTON,
        /**
         * Flag telling if the tooltip should be displayed over the map, floating and positioned at
         * the feature's coordinates. If false, the tooltip will be displayed in the footer
         *
         * @type Boolean
         */
        floatingTooltip: window.innerWidth > BREAKPOINT_TABLET,
        /**
         * Flag telling if the menu in desktop mode (MENU_ALWAYS_OPEN) is open.
         *
         * @type Boolean
         */
        menuDesktopOpen: window.innerWidth > BREAKPOINT_TABLET,
    },
    getters: {
        screenDensity(state) {
            if (state.height === 0) {
                return 0
            }
            return state.width / state.height
        },
        /**
         * Tells if the menu should be visible on the UI
         *
         * @returns {boolean}
         */
        showMenu(state) {
            // while on full screen mode, no menu must be visible
            if (state.fullscreenMode) {
                return false
            } else {
                // menu is always hidden when drawing
                return !state.showDrawingOverlay && state.showMenuTray
            }
        },
        /**
         * Tells if the header bar should be visible
         *
         * @returns {boolean}
         */
        showHeader(state) {
            return !state.fullscreenMode && !state.showDrawingOverlay
        },
    },
    actions: {
        setSize({ commit }, { width, height }) {
            commit('setSize', {
                height,
                width,
            })
        },
        toggleMenuTray({ commit, state }) {
            commit('setShowMenuTray', !state.showMenuTray)
        },
        toggleFullscreenMode({ commit, state }) {
            commit('setFullscreenMode', !state.fullscreenMode)
        },
        toggleLoadingBar({ commit, state }) {
            commit('setShowLoadingBar', !state.showLoadingBar)
        },
        toggleDrawingOverlay({ commit, state }) {
            commit('setShowDrawingOverlay', !state.showDrawingOverlay)
        },
        toggleFloatingTooltip({ commit, state }) {
            commit('setFloatingTooltip', !state.floatingTooltip)
        },
        setUiMode({ commit }, mode) {
            if (mode in UIModes) {
                commit('setUiMode', mode)
            }
        },
        toggleMenuDesktopOpen({ commit, state }) {
            commit('setMenuDesktopOpen', !state.menuDesktopOpen)
        },
    },
    mutations: {
        setSize(state, { height, width }) {
            state.height = height
            state.width = width
        },
        setShowMenuTray(state, flagValue) {
            state.showMenuTray = flagValue
        },
        setFullscreenMode(state, flagValue) {
            state.fullscreenMode = flagValue
        },
        setShowLoadingBar(state, flagValue) {
            state.showLoadingBar = flagValue
        },
        setShowDrawingOverlay(state, flagValue) {
            state.showDrawingOverlay = flagValue
        },
        setFloatingTooltip(state, flagValue) {
            state.floatingTooltip = flagValue
        },
        setUiMode(state, mode) {
            state.mode = mode
        },
        setMenuDesktopOpen(state, flagValue) {
            state.menuDesktopOpen = flagValue
        },
    },
}
