import { BREAKPOINT_TABLET } from '@/config'

/**
 * Describes the different mode the UI can have. Either desktop / tablet (menu is always shown, info
 * box is a side tray) or phone (menu has to be opened with a button, info box is a swipeable element)
 *
 * @type enum
 */
export const UIModes = {
    DESKTOP: 'DESKTOP', // formerly called "MENU_ALWAYS_OPEN", also used for tablets
    PHONE: 'PHONE', //  formerly called "MENU_OPENED_THROUGH_BUTTON"
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
        height: window.innerHeight,
        /**
         * Width of the viewport (in px)
         *
         * @type Number
         */
        width: window.innerWidth,

        /**
         * Flag telling if the main menu (where the layer options, layer tree and other stuff is)
         * should be open. It does not tell if the menu is effectively displayed on screen, as this
         * also depends on e.g. if the drawing mode is open or not. Use the getter "isMenuShown" to
         * know that.
         */
        showMenu: window.innerWidth >= BREAKPOINT_TABLET,
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
        mode: UIModes.PHONE, // Configured in screen-size-management.plugin.js (or manually in the settings)
        /**
         * Flag telling if the tooltip should be displayed over the map, floating and positioned at
         * the feature's coordinates. If false, the tooltip will be displayed in the footer
         *
         * @type Boolean
         */
        floatingTooltip: false, // Configured in screen-size-management.plugin.js
    },
    getters: {
        screenDensity(state) {
            if (state.height === 0) {
                return 0
            }
            return state.width / state.height
        },
        /**
         * Tells if the menu tray is shown
         *
         * On desktop mode, the menu tray is always shown, as long as the header is shown. Clicking
         * on the menu open / close button will simply minimize / maximize the menu tray. On phone
         * mode, the menu tray is only shown if the menu is shown.
         *
         * @returns {boolean}
         */
        isMenuTrayShown(state, getters) {
            return state.mode === UIModes.PHONE ? getters.isMenuShown : getters.isHeaderShown
        },

        /**
         * Tells if the main menu is effectively displayed on the screen (i.e. if the menu is open
         * AND visible).
         *
         * This is the case if the menu is in its open state and the header is shown.
         *
         * @returns {boolean}
         */
        isMenuShown(state, getters) {
            return getters.isHeaderShown && state.showMenu
        },

        /**
         * Tells if the header bar is visible
         *
         * @returns {boolean}
         */
        isHeaderShown(state) {
            return !state.fullscreenMode && !state.showDrawingOverlay
        },

        isPhoneMode(state) {
            return state.mode === UIModes.PHONE
        },
        isDesktopMode(state) {
            return state.mode === UIModes.DESKTOP
        },
        isPhoneSize(state, getters) {
            return getters.isPhoneMode
        },
        isTabletSize(state, getters) {
            return getters.isDesktopMode && state.width < BREAKPOINT_TABLET
        },
        isTraditionalDesktopSize(state, getters) {
            return getters.isDesktopMode && state.width >= BREAKPOINT_TABLET
        },
    },
    actions: {
        setSize({ commit }, { width, height }) {
            commit('setSize', {
                height,
                width,
            })
        },
        toggleMenu({ commit, state }) {
            commit('setShowMenu', !state.showMenu)
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
    },
    mutations: {
        setSize(state, { height, width }) {
            state.height = height
            state.width = width
        },
        setShowMenu(state, flagValue) {
            state.showMenu = flagValue
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
    },
}
