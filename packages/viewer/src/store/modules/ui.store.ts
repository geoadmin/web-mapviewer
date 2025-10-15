import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage, WarningMessage } from '@swissgeo/log/Message'
import { isNumber } from '@swissgeo/numbers'
import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

import { BREAKPOINT_TABLET, MAX_WIDTH_SHOW_FLOATING_TOOLTIP } from '@/config/responsive.config'
import {
    GIVE_FEEDBACK_HOSTNAMES,
    NO_WARNING_BANNER_HOSTNAMES,
    REPORT_PROBLEM_HOSTNAMES,
    WARNING_RIBBON_HOSTNAMES,
} from '@/config/staging.config'
import useDrawingStore from '@/store/modules/drawing.store'

const MAP_LOADING_BAR_REQUESTER = 'app-map-loading'

/**
 * Describes the different mode the UI can have. Either desktop / tablet (menu is always shown, info
 * box is a side tray) or phone (menu has to be opened with a button, info box is a swipeable
 * element)
 */
export enum UIModes {
    DESKTOP,
    PHONE,
}

export enum FeatureInfoPositions {
    DEFAULT = 'default', // This is not the default value, but this is the default behavior,
    // which depends on the UI size. Bottompanel on phones, tooltip on desktop
    BOTTOMPANEL = 'bottomPanel',
    TOOLTIP = 'tooltip',
    NONE = 'none',
}

/**
 * Module that stores all information related to the UI, for instance if a portion of the UI (like
 * the header) should be visible right now or not. Most actions from this module will be
 * used/synchronized by store plugins as it involved listening to some mutation to trigger this
 * change.
 */
export interface UIState {
    /** Height of the viewport (in px) */
    height: number
    /** Width of the viewport (in px) */
    width: number
    /**
     * Flag telling if the main menu (where the layer options, layer tree and other stuff is) should
     * be open. It does not tell if the menu is effectively displayed on screen, as this also
     * depends on e.g. if the drawing mode is open or not. Use the getter "isMenuShown" to know
     * that.
     */
    showMenu: boolean
    /**
     * Flag telling if the app should be shown in fullscreen mode, meaning that :
     *
     * - The header bar should be hidden
     * - The footer should be hidden
     * - Tool buttons (background wheel, zoom, geolocation) should be hidden
     */
    fullscreenMode: boolean
    /**
     * Flag telling if the app must be displayed as an embedded iFrame app (broken down / simplified
     * UI)
     */
    embed: boolean
    /**
     * Flag telling if the ctrl key is required to scroll. This is useful when the map is embedded
     * in an iframe and the parent page needs to scroll.
     */
    noSimpleZoomEmbed: boolean
    /**
     * Mapping of loading bar requesters. The loading bar on top of the screen is shown as soon as
     * this mapping (object) is not empty. A requester can request several times the loading bar,
     * but then it needs to clear it as many times it has set it.
     */
    loadingBarRequesters: { [key: string]: number }
    /**
     * Current UI mode of the application, dictates how the menu interaction is made (for touch the
     * menu has to be opened through a button, for desktop it is always shown) and how the
     * information about a selected feature are shown.
     */
    mode: UIModes
    /**
     * Expected position of the features tooltip position when selecting features.
     *
     * The default position is set to NONE, as we want people who want to share a feature without
     * the tooltip to have a very simple URL.
     */
    featureInfoPosition: FeatureInfoPositions
    /**
     * Hostname on which the application is running (use to display warnings to the user on
     * 'non-production' hosts)
     */
    hostname: string
    /** Flag telling if import catalogue shown */
    importCatalogue: boolean
    /** Flag telling if import file (map tooltip overlay or infobox) is shown */
    importFile: boolean
    /** Height of the header (in px) */
    headerHeight: number
    /**
     * Float telling where across the screen is the compare slider. The compare Slider should only
     * be shown when the value is between 0 and 1
     */
    compareRatio: number | undefined
    /** Flag telling if the compare slider is currently active or not */
    isCompareSliderActive: boolean
    /** Flag telling if the time slider is currently active or not */
    isTimeSliderActive: boolean
    /** Flag telling if iframe marker description has disclaimer shown */
    showDisclaimer: boolean
    /** Set of errors to display. Each error must be an ErrorMessage object. */
    errors: Set<ErrorMessage>
    /** Set of warnings to display. Each warning must be an object WarningMessage */
    warnings: Set<WarningMessage>
    /** Flag telling if the "Drop file here" overlay will be displayed on top of the map. */
    showDragAndDropOverlay: boolean
    /**
     * Flag telling if we should hide the UI elements in the embed viewer. Zoom buttons, 3d button
     * and the `view on geoadmin link`. This is only for the Geo Platform Schweiz current
     * implementation and should not be disclosed to users as something they can use.
     */
    hideEmbedUI: boolean
    /**
     * Flag used to override the dev site warning behavior. This can only be used to force the dev
     * site to remove its dev-specific UI element, so this always start as false, and is only meant
     * to be set to true by a press of a button in the debug menu
     */
    forceNoDevSiteWarning: boolean
}

const useUIStore = defineStore('ui', {
    state: (): UIState => ({
        height: window.innerHeight,
        width: window.innerWidth,
        showMenu: window.innerWidth >= BREAKPOINT_TABLET,
        fullscreenMode: false,
        embed: false,
        noSimpleZoomEmbed: false,
        loadingBarRequesters: { [MAP_LOADING_BAR_REQUESTER]: 1 },
        mode: UIModes.PHONE, // Configured in screen-size-management.plugin.js (or manually in the settings)
        featureInfoPosition: FeatureInfoPositions.NONE,
        hostname: window.location.hostname,
        importCatalogue: false,
        importFile: false,
        headerHeight: 100,
        compareRatio: undefined,
        isCompareSliderActive: false,
        isTimeSliderActive: false,
        showDisclaimer: true,
        errors: new Set(),
        warnings: new Set(),
        showDragAndDropOverlay: false,
        hideEmbedUI: false,
        forceNoDevSiteWarning: false,
    }),
    getters: {
        showLoadingBar(): boolean {
            return Object.keys(this.loadingBarRequesters).length > 0
        },

        screenDensity(): number {
            if (this.height === 0) {
                return 0
            }
            return this.width / this.height
        },

        /**
         * Tells if the menu tray is shown
         *
         * On desktop mode, the menu tray is always shown, as long as the header is shown. Clicking
         * on the menu open / close button will simply minimize / maximize the menu tray. On phone
         * mode, the menu tray is only shown if the menu is shown.
         */
        isMenuTrayShown(): boolean {
            return this.mode === UIModes.PHONE ? this.isMenuShown : this.isHeaderShown
        },

        /**
         * Tells if the main menu is effectively displayed on the screen (i.e. if the menu is open
         * AND visible).
         *
         * This is the case if the menu is in its open state and the header is shown.
         */
        isMenuShown(): boolean {
            return this.isHeaderShown && this.showMenu
        },

        /** Tells if the header bar is visible */
        isHeaderShown(): boolean {
            const drawingStore = useDrawingStore()
            return !this.fullscreenMode && drawingStore.drawingOverlay.show
        },

        isPhoneMode(): boolean {
            return this.mode === UIModes.PHONE
        },

        isDesktopMode(): boolean {
            return this.mode === UIModes.DESKTOP
        },

        // TODO: remove redundant getter
        hasNoSimpleZoomEmbedEnabled(): boolean {
            return this.noSimpleZoomEmbed
        },

        // TODO: remove redundant getter
        isEmbed(): boolean {
            return this.embed
        },

        // TODO: remove redundant getter
        isPhoneSize(): boolean {
            return this.isPhoneMode
        },

        isTabletSize(): boolean {
            return this.isDesktopMode && this.width < BREAKPOINT_TABLET
        },

        isTraditionalDesktopSize(): boolean {
            return this.isDesktopMode && this.width >= BREAKPOINT_TABLET
        },

        /** Flag to display a warning ribbon ('TEST') at the top/bottom right corner */
        hasWarningRibbon(): boolean {
            return WARNING_RIBBON_HOSTNAMES.some((hostname) => this.hostname.includes(hostname))
        },

        /**
         * Flag that tells if users should be warned that it is a development site. Also used to
         * hide development-specific features in production (like the app version)
         */
        hasDevSiteWarning(): boolean {
            return (
                !this.forceNoDevSiteWarning &&
                !NO_WARNING_BANNER_HOSTNAMES.some((hostname) => this.hostname.includes(hostname))
            )
        },

        isProductionSite(): boolean {
            return this.hostname === 'map.geo.admin.ch'
        },

        showFeatureInfoInTooltip(): boolean {
            return (
                this.featureInfoPosition === FeatureInfoPositions.TOOLTIP ||
                (this.featureInfoPosition === FeatureInfoPositions.DEFAULT && !this.isPhoneMode)
            )
        },

        showFeatureInfoInBottomPanel(): boolean {
            return (
                this.featureInfoPosition === FeatureInfoPositions.BOTTOMPANEL ||
                (this.featureInfoPosition === FeatureInfoPositions.DEFAULT && this.isPhoneMode)
            )
        },

        noFeatureInfo(): boolean {
            return this.featureInfoPosition === FeatureInfoPositions.NONE
        },

        /**
         * Flag to display to display give feedback button/form. On localhost, it will always shown
         * for testing purpose
         */
        hasGiveFeedbackButton(): boolean {
            return GIVE_FEEDBACK_HOSTNAMES.some((hostname) => this.hostname.includes(hostname))
        },

        /**
         * Flag to display to display report problem button/form. On localhost, it will always shown
         * for testing purpose
         */
        hasReportProblemButton(): boolean {
            return REPORT_PROBLEM_HOSTNAMES.some((hostname) => this.hostname.includes(hostname))
        },
    },
    actions: {
        setSize(width: number, height: number, dispatcher: ActionDispatcher) {
            this.height = height
            this.width = width

            // on resize with a very narrow width, the tooltip would overlap with the right side menu
            // we enforce the features information to be set into an infobox when we want to show them
            // in this situation
            if (
                this.featureInfoPosition !== FeatureInfoPositions.NONE &&
                this.width < MAX_WIDTH_SHOW_FLOATING_TOOLTIP
            ) {
                this.featureInfoPosition = FeatureInfoPositions.BOTTOMPANEL
            }
        },

        toggleMenu(dispatcher: ActionDispatcher) {
            this.showMenu = !this.showMenu
        },

        closeMenu(dispatcher: ActionDispatcher) {
            this.showMenu = false
        },

        toggleFullscreenMode(dispatcher: ActionDispatcher) {
            this.fullscreenMode = !this.fullscreenMode
        },

        setEmbed(embed: boolean, dispatcher: ActionDispatcher) {
            this.embed = !!embed
        },

        setNoSimpleZoomEmbed(noSimpleZoomEmbed: boolean, dispatcher: ActionDispatcher) {
            this.noSimpleZoomEmbed = !!noSimpleZoomEmbed
        },

        setShowLoadingBar(loading: boolean, requester: string, dispatcher: ActionDispatcher) {
            if (!this.loadingBarRequesters[requester]) {
                return
            }

            if (loading) {
                if (!isNumber(this.loadingBarRequesters[requester])) {
                    this.loadingBarRequesters[requester] = 0
                }
                this.loadingBarRequesters[requester] += 1
            } else {
                if (this.loadingBarRequesters[requester] > 0) {
                    this.loadingBarRequesters[requester] -= 1
                }
                if (this.loadingBarRequesters[requester] <= 0) {
                    delete this.loadingBarRequesters[requester]
                }
            }
            log.debug({
                title: 'UI store / setShowLoadingBar',
                titleStyle: {
                    color: LogPreDefinedColor.Red,
                },
                messages: [
                    `Loading bar has been set; requester=${requester}, loading=${loading}, loadingBarRequesters=`,
                    this.loadingBarRequesters,
                ],
            })
        },

        setLoadingBarRequester(requester: string, dispatcher: ActionDispatcher) {
            this.setShowLoadingBar(true, requester, dispatcher)
        },

        clearLoadingBarRequester(requester: string, dispatcher: ActionDispatcher) {
            this.setShowLoadingBar(false, requester, dispatcher)
        },

        clearLoadingBar4MapLoading(dispatcher: ActionDispatcher) {
            this.setShowLoadingBar(false, MAP_LOADING_BAR_REQUESTER, dispatcher)
        },

        setUiMode(mode: UIModes, dispatcher: ActionDispatcher) {
            if (mode in UIModes) {
                this.mode = mode
                this.fullscreenMode = false
            }
        },

        toggleImportCatalogue(dispatcher: ActionDispatcher) {
            this.importCatalogue = !this.importCatalogue
        },

        toggleImportFile(dispatcher: ActionDispatcher) {
            this.importFile = !this.importFile
        },

        setHeaderHeight(height: number, dispatcher: ActionDispatcher) {
            this.headerHeight = height
        },

        setCompareRatio(compareRatio: number, dispatcher: ActionDispatcher) {
            /*
                This check is here to make sure the compare ratio doesn't get out of hand
                The logic is, we want the compare ratio to be either in its visible range,
                which is 0.001 to 0.999, and it's "storage range" (-0.001 to -0.999). If
                we are not within these bounds, we revert to the default value (-0.5)
            */
            if (compareRatio > 0.0 && compareRatio < 1.0) {
                this.compareRatio = compareRatio
            } else {
                this.compareRatio = undefined
            }
        },

        setCompareSliderActive(isActive: boolean, dispatcher: ActionDispatcher) {
            this.isCompareSliderActive = !!isActive
        },

        setFeatureInfoPosition(position: FeatureInfoPositions, dispatcher: ActionDispatcher) {
            const featurePosition: FeatureInfoPositions =
                FeatureInfoPositions[position?.toUpperCase() as keyof typeof FeatureInfoPositions]

            if (!featurePosition) {
                log.error({
                    title: 'UI store / setFeatureInfoPosition',
                    titleStyle: {
                        color: LogPreDefinedColor.Red,
                    },
                    messages: [`Invalid feature info position: ${position}.`],
                })
                return
            }
            // When the viewport width is too small, the layout of the floating infobox will be
            // partially under the menu, making it hard to use. In those conditions, the option to
            // set it as a floating tooltip is disabled.
            if (
                featurePosition !== FeatureInfoPositions.NONE &&
                this.width < MAX_WIDTH_SHOW_FLOATING_TOOLTIP
            ) {
                this.featureInfoPosition = FeatureInfoPositions.BOTTOMPANEL
            } else {
                this.featureInfoPosition = featurePosition
            }
        },

        setTimeSliderActive(isActive: boolean, dispatcher: ActionDispatcher) {
            this.isTimeSliderActive = isActive
        },

        setShowDisclaimer(showDisclaimer: boolean, dispatcher: ActionDispatcher) {
            this.showDisclaimer = !!showDisclaimer
        },

        addErrors(errors: ErrorMessage[], dispatcher: ActionDispatcher) {
            if (Array.isArray(errors) && errors.every((error) => error instanceof ErrorMessage)) {
                errors
                    .filter(
                        (error) =>
                            // we only add the errors that are not already present in the store
                            ![...this.errors].some((otherError) => error.isEqual(otherError))
                    )
                    .forEach((error) => {
                        this.errors.add(error)
                    })
            } else {
                log.error({
                    title: 'UI store / addErrors',
                    titleStyle: {
                        color: LogPreDefinedColor.Red,
                    },
                    messages: ['Wrong type of errors passed to addErrors', errors, dispatcher],
                })
            }
        },

        removeError(error: ErrorMessage, dispatcher: ActionDispatcher) {
            if (!(error instanceof ErrorMessage)) {
                log.error({
                    title: 'UI store / removeError',
                    titleStyle: {
                        color: LogPreDefinedColor.Red,
                    },
                    messages: ['Wrong type of error passed to removeError', error, dispatcher],
                })
                return
            }
            if (this.errors.has(error)) {
                this.errors.delete(error)
            }
        },

        addWarnings(warnings: WarningMessage[], dispatcher: ActionDispatcher) {
            if (
                Array.isArray(warnings) &&
                warnings.every((warning) => warning instanceof WarningMessage)
            ) {
                warnings
                    .filter(
                        (warning) =>
                            // we only add the warnings that are not already present in the store
                            ![...this.warnings].some((otherWarning) =>
                                warning.isEqual(otherWarning)
                            )
                    )
                    .forEach((warning) => {
                        this.warnings.add(warning)
                    })
            } else {
                log.error({
                    title: 'UI store / addWarnings',
                    titleStyle: {
                        color: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Wrong type of warnings passed to addWarnings',
                        warnings,
                        dispatcher,
                    ],
                })
            }
        },
        removeWarning(warning: WarningMessage, dispatcher: ActionDispatcher) {
            if (!(warning instanceof WarningMessage)) {
                log.error({
                    title: 'UI store / removeWarning',
                    titleStyle: {
                        color: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Wrong type of warning passed to removeWarning',
                        warning,
                        dispatcher,
                    ],
                })
                return
            }
            if (this.warnings.has(warning)) {
                this.warnings.delete(warning)
            }
        },

        setShowDragAndDropOverlay(showDragAndDropOverlay: boolean, dispatcher: ActionDispatcher) {
            this.showDragAndDropOverlay = !!showDragAndDropOverlay
        },

        setHideEmbedUI(hideEmbedUI: boolean, dispatcher: ActionDispatcher) {
            this.hideEmbedUI = !!hideEmbedUI
        },

        setForceNoDevSiteWarning(dispatcher: ActionDispatcher) {
            this.forceNoDevSiteWarning = true
        },
    },
})

export default useUIStore
