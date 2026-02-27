import type { ErrorMessage, WarningMessage } from '@swissgeo/log/Message'

import type useUiStore from '@/store/modules/ui'

/**
 * 'default' is not the default value, but the default behavior, which depends on the UI size:
 * 'bottomPanel' on phones, 'tooltip' on desktop
 */
export type FeatureInfoPosition = 'default' | 'bottomPanel' | 'tooltip' | 'none'

/**
 * Describes the different mode the UI can have. Either desktop / tablet (menu is always shown, info
 * box is a side tray) or phone (menu has to be opened with a button, info box is a swipeable
 * element)
 */
export type UIMode = 'desktop' | 'phone'

/**
 * Module that stores all information related to the UI, for instance if a portion of the UI (like
 * the header) should be visible right now or not. Most actions from this module will be
 * used/synchronized by store plugins as it involved listening to some mutation to trigger this
 * change.
 */
export interface UIStoreState {
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
    mode: UIMode
    /**
     * Expected position of the features tooltip position when selecting features.
     *
     * The default position is set to NONE, as we want people who want to share a feature without
     * the tooltip to have a very simple URL.
     */
    featureInfoPosition: FeatureInfoPosition
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

export interface UIStoreGetters {
    showLoadingBar(): boolean
    screenDensity(): number
    isMenuTrayShown(): boolean
    isMenuShown(): boolean
    isHeaderShown(): boolean
    isPhoneMode(): boolean
    isDesktopMode(): boolean
    hasNoSimpleZoomEmbedEnabled(): boolean
    isEmbed(): boolean
    isPhoneSize(): boolean
    isTabletSize(): boolean
    isTraditionalDesktopSize(): boolean
    hasWarningRibbon(): boolean
    hasDevSiteWarning(): boolean
    isProductionSite(): boolean
    showFeatureInfoInTooltip(): boolean
    showFeatureInfoInBottomPanel(): boolean
    noFeatureInfo(): boolean
    hasGiveFeedbackButton(): boolean
    hasReportProblemButton(): boolean
}

export type UIStore = ReturnType<typeof useUiStore>
