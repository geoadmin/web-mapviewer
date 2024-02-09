import { BREAKPOINT_TABLET, NO_WARNING_BANNER_HOSTNAMES, WARNING_RIBBON_HOSTNAMES } from '@/config'

/**
 * Describes the different mode the UI can have. Either desktop / tablet (menu is always shown, info
 * box is a side tray) or phone (menu has to be opened with a button, info box is a swipeable
 * element)
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
 * used/synchronized by store plugins as it involved listening to some mutation to trigger this
 * change.
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
         * Flag telling if the app must be displayed as an embedded iFrame app (broken down /
         * simplified UI)
         *
         * @type Boolean
         */
        embeddedMode: false,
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
        /**
         * Hostname on which the application is running (use to display warnings to the user on
         * 'non-production' hosts)
         *
         * @type String
         */
        hostname: window.location.hostname,
        /**
         * Flag telling if import catalogue shown
         *
         * @type Boolean
         */
        importCatalogue: false,
        /**
         * Flag telling if import file (map tooltip overlay or infobox) is shown
         *
         * @type Boolean
         */
        importFile: false,
        /**
         * Height of the header (in px)
         *
         * @type Number
         */
        headerHeight: 100,

        /**
         * Height of the menu tray (in px)
         *
         * @type Number
         */
        menuTrayWidth: 400,

        /**
         * Float telling where across the screen is the compare slider. The compare Slider should
         * only be shown when the value is between 0 and 1
         *
         * @type Number
         */

        compareRatio: null,
        /**
         * Flag telling if the compare slider is currently active or not
         *
         * @type Boolean
         */
        isCompareSliderActive: false,
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
            return !state.fullscreenMode && !state.showDrawingOverlay && !state.embeddedMode
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
        /** Flag to display a warning ribbon ('TEST') at the top/bottom right corner */
        hasWarningRibbon(state) {
            return WARNING_RIBBON_HOSTNAMES.some((hostname) => state.hostname.includes(hostname))
        },
        /**
         * Flag that tells if users should be warned that it is a development site. Also used to
         * hide development specific features in production (like the app version)
         */
        hasDevSiteWarning(state) {
            return !NO_WARNING_BANNER_HOSTNAMES.some((hostname) =>
                state.hostname.includes(hostname)
            )
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
        setEmbeddedMode({ commit }, isEmbedded) {
            commit('setEmbeddedMode', !!isEmbedded)
        },
        setShowLoadingBar({ commit }, value) {
            commit('setShowLoadingBar', !!value)
        },
        toggleLoadingBar({ commit, state }) {
            commit('setShowLoadingBar', !state.showLoadingBar)
        },
        toggleDrawingOverlay({ commit, state }) {
            commit('setShowDrawingOverlay', !state.showDrawingOverlay)
        },
        setShowDrawingOverlay({ commit }, value) {
            commit('setShowDrawingOverlay', !!value)
        },
        toggleFloatingTooltip({ commit, state }) {
            commit('setFloatingTooltip', !state.floatingTooltip)
        },
        setUiMode({ commit, state }, mode) {
            if (mode in UIModes) {
                commit('setUiMode', mode)
                // As there is no possibility to trigger the fullscreen mode in desktop mode for now
                if (state.fullscreenMode && mode === UIModes.DESKTOP) {
                    commit('setFullscreenMode', false)
                }
            }
        },
        toggleImportCatalogue({ commit, state }) {
            commit('setImportCatalogue', !state.importCatalogue)
        },
        toggleImportFile({ commit, state }) {
            commit('setImportFile', !state.importFile)
        },
        setHeaderHeight({ commit }, height) {
            commit('setHeaderHeight', parseFloat(height))
        },
        setMenuTrayWidth({ commit }, width) {
            commit('setMenuTrayWidth', parseFloat(width))
        },
        setCompareRatio({ commit }, value) {
            /*
                This check is here to make sure the compare ratio doesn't get out of hand
                The logic is, we want the compare ratio to be either in its visible range,
                which is 0.001 to 0.999, and it's "storage range" (-0.001 to -0.999). If
                we are not within these bounds, we revert to the default value (-0.5)
            */
            if (value > 0.0 && value < 1.0) {
                commit('setCompareRatio', value)
            } else {
                commit('setCompareRatio', null)
            }
        },
        setCompareSliderActive({ commit }, value) {
            commit('setCompareSliderActive', value)
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
        setEmbeddedMode(state, flagValue) {
            state.embeddedMode = flagValue
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
        setImportCatalogue(state, flagValue) {
            state.importCatalogue = flagValue
        },
        setImportFile(state, flagValue) {
            state.importFile = flagValue
        },
        setHeaderHeight(state, height) {
            state.headerHeight = height
        },
        setMenuTrayWidth(state, width) {
            state.menuTrayWidth = width
        },
        setCompareRatio(state, value) {
            state.compareRatio = value
        },
        setCompareSliderActive(state, value) {
            state.isCompareSliderActive = value
        },
    },
}
