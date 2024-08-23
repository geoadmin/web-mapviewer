import { BREAKPOINT_TABLET, MAX_WIDTH_SHOW_FLOATING_TOOLTIP } from '@/config/responsive.config'
import {
    GIVE_FEEDBACK_HOSTNAMES,
    NO_WARNING_BANNER_HOSTNAMES,
    REPORT_PROBLEM_HOSTNAMES,
    WARNING_RIBBON_HOSTNAMES,
} from '@/config/staging.config'
import log from '@/utils/logging'
import WarningMessage from '@/utils/WarningMessage.class'

const MAP_LOADING_BAR_REQUESTER = 'app-map-loading'

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
export const FeatureInfoPositions = {
    DEFAULT: 'default', // This is not the default value, but this is the default behavior,
    // which depends on the UI size. Bottompanel on phones, tooltip on desktop
    BOTTOMPANEL: 'bottomPanel',
    TOOLTIP: 'tooltip',
    NONE: 'none',
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
        embed: false,
        /**
         * Mapping of loading bar requesters. The loading bar on top of the screen is shown as soon
         * as this mapping (object) is not empty. A requester can request several times the loading
         * bar, but then it needs to clear it as many times it has set it.
         *
         * @type {[String]: Number}
         */
        loadingBarRequesters: { [MAP_LOADING_BAR_REQUESTER]: 1 },
        /**
         * Current UI mode of the application, dictates how the menu interaction is made (for touch
         * the menu has to be opened through a button, for desktop it is always shown) and how the
         * information about a selected feature are shown.
         *
         * @type String
         */
        mode: UIModes.PHONE, // Configured in screen-size-management.plugin.js (or manually in the settings)
        /**
         * Expected position of the features tooltip position when selecting features.
         *
         * The default position is set to NONE, as we want people who want to share a feature
         * without the tooltip to have a very simple URL.
         *
         * @type String
         */
        featureInfoPosition: FeatureInfoPositions.NONE,
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
        /**
         * Flag telling if the time slider is currently active or not
         *
         * @type Boolean
         */
        isTimeSliderActive: false,

        /**
         * Flag telling if iframe marker description has disclaimer shown
         *
         * @type Boolean
         */
        showDisclaimer: true,

        /**
         * Text to display in the error window
         *
         * When this text is set the error window will be displayed
         *
         * @type String
         */
        errorText: null,

        /**
         * Set of warnings to display. Each warning must be an object WarningMessage
         *
         * @type Set(WarningMessage)
         */
        warnings: new Set(),

        /**
         * Flag telling if the "Drop file here" overlay will be displayed on top of the map.
         *
         * @type Boolean
         */
        showDragAndDropOverlay: false,
    },
    getters: {
        showLoadingBar(state) {
            return Object.keys(state.loadingBarRequesters).length > 0
        },
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
        isHeaderShown(state, getters, rootState) {
            return !state.fullscreenMode && !rootState.drawing?.drawingOverlay.show
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
        isProductionSite(state) {
            return state.hostname === 'map.geo.admin.ch'
        },
        showFeatureInfoInTooltip(state, getters) {
            return (
                state.featureInfoPosition === FeatureInfoPositions.TOOLTIP ||
                (state.featureInfoPosition === FeatureInfoPositions.DEFAULT && !getters.isPhoneMode)
            )
        },
        showFeatureInfoInBottomPanel(state, getters) {
            return (
                state.featureInfoPosition === FeatureInfoPositions.BOTTOMPANEL ||
                (state.featureInfoPosition === FeatureInfoPositions.DEFAULT && getters.isPhoneMode)
            )
        },
        noFeatureInfo(state) {
            return state.featureInfoPosition === FeatureInfoPositions.NONE
        },
        /**
         * Flag to display to display give feedback button/form. On localhost, it will always shown
         * for testing purpose
         */
        hasGiveFeedbackButton(state) {
            return GIVE_FEEDBACK_HOSTNAMES.some((hostname) => state.hostname.includes(hostname))
        },
        /**
         * Flag to display to display report problem button/form. On localhost, it will always shown
         * for testing purpose
         */
        hasReportProblemButton(state) {
            return REPORT_PROBLEM_HOSTNAMES.some((hostname) => state.hostname.includes(hostname))
        },
    },
    actions: {
        setSize({ commit, state }, { width, height, dispatcher }) {
            commit('setSize', {
                height,
                width,
                dispatcher,
            })
            // on resize with a very narrow width, the tooltip would overlap with the right side menu
            // we enforce the features information to be set into an infobox when we want to show them
            // in this situation
            if (
                state.featureInfoPosition !== FeatureInfoPositions.NONE &&
                width < MAX_WIDTH_SHOW_FLOATING_TOOLTIP
            ) {
                commit('setFeatureInfoPosition', {
                    position: FeatureInfoPositions.BOTTOMPANEL,
                    dispatcher,
                })
            }
        },
        toggleMenu({ commit, state }, { dispatcher }) {
            commit('setShowMenu', { show: !state.showMenu, dispatcher })
        },
        closeMenu({ commit }, { dispatcher }) {
            commit('setShowMenu', { show: false, dispatcher })
        },
        toggleFullscreenMode({ commit, state }, { dispatcher }) {
            commit('setFullscreenMode', { mode: !state.fullscreenMode, dispatcher })
        },
        setEmbed({ commit }, { embed, dispatcher }) {
            commit('setEmbed', { embed: !!embed, dispatcher })
        },
        setLoadingBarRequester({ commit }, { requester, dispatcher }) {
            commit('setShowLoadingBar', { requester, loading: true, dispatcher })
        },
        clearLoadingBarRequester({ commit }, { requester, dispatcher }) {
            commit('setShowLoadingBar', { requester, loading: false, dispatcher })
        },
        clearLoadingBar4MapLoading({ commit }, { dispatcher }) {
            commit('setShowLoadingBar', {
                requester: MAP_LOADING_BAR_REQUESTER,
                loading: false,
                dispatcher,
            })
        },
        setUiMode({ commit, state }, { mode, dispatcher }) {
            if (mode in UIModes) {
                commit('setUiMode', { mode, dispatcher })
                // As there is no possibility to trigger the fullscreen mode in desktop mode for now
                if (state.fullscreenMode && mode === UIModes.DESKTOP) {
                    commit('setFullscreenMode', { mode: false, dispatcher })
                }
            }
        },
        toggleImportCatalogue({ commit, state }, { dispatcher }) {
            commit('setImportCatalogue', { importCatalogue: !state.importCatalogue, dispatcher })
        },
        toggleImportFile({ commit, state }, { dispatcher }) {
            commit('setImportFile', { importFile: !state.importFile, dispatcher })
        },
        setHeaderHeight({ commit }, { height, dispatcher }) {
            commit('setHeaderHeight', { height: parseFloat(height), dispatcher })
        },
        setCompareRatio({ commit }, { compareRatio, dispatcher }) {
            /*
                This check is here to make sure the compare ratio doesn't get out of hand
                The logic is, we want the compare ratio to be either in its visible range,
                which is 0.001 to 0.999, and it's "storage range" (-0.001 to -0.999). If
                we are not within these bounds, we revert to the default value (-0.5)
            */
            if (compareRatio > 0.0 && compareRatio < 1.0) {
                commit('setCompareRatio', { compareRatio, dispatcher })
            } else {
                commit('setCompareRatio', { compareRatio: null, dispatcher })
            }
        },
        setCompareSliderActive({ commit }, args) {
            commit('setCompareSliderActive', args)
        },
        setFeatureInfoPosition({ commit, state }, { position, dispatcher }) {
            let featurePosition = FeatureInfoPositions[position?.toUpperCase()]
            if (!featurePosition) {
                log.error(
                    `invalid feature Info Position given as parameter. ${position} is not a valid key`
                )
                return
            }
            // when the viewport width is too small, the layout of the floating infobox will be
            // partially under the menu, making it hard to use. In those conditions, the option to
            // set it as a floating tooltip is disabled.
            if (
                featurePosition !== FeatureInfoPositions.NONE &&
                state.width < MAX_WIDTH_SHOW_FLOATING_TOOLTIP
            ) {
                featurePosition = FeatureInfoPositions.BOTTOMPANEL
            }
            if (state.featureInfoPosition === featurePosition) {
                // no need to commit anything if we're trying to switch to the current value
                return
            }
            commit('setFeatureInfoPosition', {
                position: featurePosition,
                dispatcher: dispatcher,
            })
        },
        setTimeSliderActive({ commit }, args) {
            commit('setTimeSliderActive', args)
        },
        setShowDisclaimer({ commit }, { showDisclaimer, dispatcher }) {
            commit('setShowDisclaimer', { showDisclaimer, dispatcher })
        },
        setErrorText({ commit }, { errorText, dispatcher }) {
            commit('setErrorText', { errorText, dispatcher })
        },
        addWarning({ commit, state }, { warning, dispatcher }) {
            if (!(warning instanceof WarningMessage)) {
                throw new Error(
                    `Warning ${warning} dispatched by ${dispatcher} is not of type WarningMessage`
                )
            }
            if (!state.warnings.has(warning)) {
                commit('addWarning', { warning, dispatcher })
            }
        },
        removeWarning({ commit, state }, { warning, dispatcher }) {
            if (!(warning instanceof WarningMessage)) {
                throw new Error(
                    `Warning ${warning} dispatched by ${dispatcher} is not of type WarningMessage`
                )
            }
            if (state.warnings.has(warning)) {
                commit('removeWarning', { warning, dispatcher })
            }
        },
        setShowDragAndDropOverlay({ commit }, { showDragAndDropOverlay, dispatcher }) {
            commit('setShowDragAndDropOverlay', { showDragAndDropOverlay, dispatcher })
        },
    },
    mutations: {
        setSize(state, { height, width }) {
            state.height = height
            state.width = width
        },
        setShowMenu(state, { show }) {
            state.showMenu = show
        },
        setFullscreenMode(state, { mode }) {
            state.fullscreenMode = mode
        },
        setEmbed(state, { embed }) {
            state.embed = embed
        },
        setShowLoadingBar(state, { requester, loading }) {
            if (loading) {
                if (state.loadingBarRequesters[requester] == null) {
                    state.loadingBarRequesters[requester] = 0
                }
                state.loadingBarRequesters[requester] += 1
            } else {
                if (state.loadingBarRequesters[requester] > 0) {
                    state.loadingBarRequesters[requester] -= 1
                }
                if (state.loadingBarRequesters[requester] <= 0) {
                    delete state.loadingBarRequesters[requester]
                }
            }
            log.debug(
                `Loading bar has been set; requester=${requester}, loading=${loading}, loadingBarRequesters=`,
                state.loadingBarRequesters
            )
        },
        setUiMode(state, { mode }) {
            state.mode = mode
        },
        setImportCatalogue(state, { importCatalogue }) {
            state.importCatalogue = importCatalogue
        },
        setImportFile(state, { importFile }) {
            state.importFile = importFile
        },
        setHeaderHeight(state, { height }) {
            state.headerHeight = height
        },
        setCompareRatio(state, { compareRatio }) {
            state.compareRatio = compareRatio
        },
        setCompareSliderActive(state, { compareSliderActive }) {
            state.isCompareSliderActive = compareSliderActive
        },
        setTimeSliderActive(state, { timeSliderActive }) {
            state.isTimeSliderActive = timeSliderActive
        },
        setFeatureInfoPosition(state, { position }) {
            state.featureInfoPosition = position
        },
        setShowDisclaimer: (state, { showDisclaimer }) => (state.showDisclaimer = showDisclaimer),
        setErrorText: (state, { errorText }) => (state.errorText = errorText),
        addWarning: (state, { warning }) => state.warnings.add(warning),
        removeWarning: (state, { warning }) => state.warnings.delete(warning),
        setShowDragAndDropOverlay: (state, { showDragAndDropOverlay }) =>
            (state.showDragAndDropOverlay = showDragAndDropOverlay),
    },
}
