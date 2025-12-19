import { BREAKPOINT_TABLET } from '@swissgeo/staging-config/constants'
import { defineStore } from 'pinia'

import type { UIStoreGetters, UIStoreState } from '@/store/modules/ui/types'

import addErrors from '@/store/modules/ui/actions/addErrors'
import addWarnings from '@/store/modules/ui/actions/addWarnings'
import clearLoadingBarRequester from '@/store/modules/ui/actions/clearLoadingBarRequester'
import closeMenu from '@/store/modules/ui/actions/closeMenu'
import removeError from '@/store/modules/ui/actions/removeError'
import removeWarning from '@/store/modules/ui/actions/removeWarning'
import setCompareRatio from '@/store/modules/ui/actions/setCompareRatio'
import setCompareSliderActive from '@/store/modules/ui/actions/setCompareSliderActive'
import setEmbed from '@/store/modules/ui/actions/setEmbed'
import setFeatureInfoPosition from '@/store/modules/ui/actions/setFeatureInfoPosition'
import setForceNoDevSiteWarning from '@/store/modules/ui/actions/setForceNoDevSiteWarning'
import setHeaderHeight from '@/store/modules/ui/actions/setHeaderHeight'
import setHideEmbedUI from '@/store/modules/ui/actions/setHideEmbedUI'
import setLoadingBarRequester from '@/store/modules/ui/actions/setLoadingBarRequester'
import setNoSimpleZoomEmbed from '@/store/modules/ui/actions/setNoSimpleZoomEmbed'
import setShowDisclaimer from '@/store/modules/ui/actions/setShowDisclaimer'
import setShowDragAndDropOverlay from '@/store/modules/ui/actions/setShowDragAndDropOverlay'
import setShowLoadingBar from '@/store/modules/ui/actions/setShowLoadingBar'
import setSize from '@/store/modules/ui/actions/setSize'
import setTimeSliderActive from '@/store/modules/ui/actions/setTimeSliderActive'
import setUiMode from '@/store/modules/ui/actions/setUiMode'
import toggleFullscreenMode from '@/store/modules/ui/actions/toggleFullscreenMode'
import toggleImportCatalogue from '@/store/modules/ui/actions/toggleImportCatalogue'
import toggleImportFile from '@/store/modules/ui/actions/toggleImportFile'
import toggleMenu from '@/store/modules/ui/actions/toggleMenu'
import hasDevSiteWarning from '@/store/modules/ui/getters/hasDevSiteWarning'
import hasGiveFeedbackButton from '@/store/modules/ui/getters/hasGiveFeedbackButton'
import hasNoSimpleZoomEmbedEnabled from '@/store/modules/ui/getters/hasNoSimpleZoomEmbedEnabled'
import hasReportProblemButton from '@/store/modules/ui/getters/hasReportProblemButton'
import hasWarningRibbon from '@/store/modules/ui/getters/hasWarningRibbon'
import isDesktopMode from '@/store/modules/ui/getters/isDesktopMode'
import isEmbed from '@/store/modules/ui/getters/isEmbed'
import isHeaderShown from '@/store/modules/ui/getters/isHeaderShown'
import isMenuShown from '@/store/modules/ui/getters/isMenuShown'
import isMenuTrayShown from '@/store/modules/ui/getters/isMenuTrayShown'
import isPhoneMode from '@/store/modules/ui/getters/isPhoneMode'
import isPhoneSize from '@/store/modules/ui/getters/isPhoneSize'
import isProductionSite from '@/store/modules/ui/getters/isProductionSite'
import isTabletSize from '@/store/modules/ui/getters/isTabletSize'
import isTraditionalDesktopSize from '@/store/modules/ui/getters/isTraditionalDesktopSize'
import noFeatureInfo from '@/store/modules/ui/getters/noFeatureInfo'
import screenDensity from '@/store/modules/ui/getters/screenDensity'
import showFeatureInfoInBottomPanel from '@/store/modules/ui/getters/showFeatureInfoInBottomPanel'
import showFeatureInfoInTooltip from '@/store/modules/ui/getters/showFeatureInfoInTooltip'
import showLoadingBar from '@/store/modules/ui/getters/showLoadingBar'
import { FeatureInfoPositions, UIModes } from '@/store/modules/ui/types'

export const MAP_LOADING_BAR_REQUESTER = 'app-map-loading'

const state = (): UIStoreState => ({
    height: window.innerHeight,
    width: window.innerWidth,
    showMenu: window.innerWidth >= BREAKPOINT_TABLET,
    fullscreenMode: false,
    embed: false,
    noSimpleZoomEmbed: false,
    loadingBarRequesters: { [MAP_LOADING_BAR_REQUESTER]: 1 },
    mode: UIModes.Phone,
    featureInfoPosition: FeatureInfoPositions.None,
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
})

const actions = {
    setSize,
    toggleMenu,
    closeMenu,
    toggleFullscreenMode,
    setEmbed,
    setNoSimpleZoomEmbed,
    setShowLoadingBar,
    setLoadingBarRequester,
    clearLoadingBarRequester,
    setUiMode,
    toggleImportCatalogue,
    toggleImportFile,
    setHeaderHeight,
    setCompareRatio,
    setCompareSliderActive,
    setFeatureInfoPosition,
    setTimeSliderActive,
    setShowDisclaimer,
    addErrors,
    removeError,
    addWarnings,
    removeWarning,
    setShowDragAndDropOverlay,
    setHideEmbedUI,
    setForceNoDevSiteWarning,
}

const getters: UIStoreGetters = {
    showLoadingBar,
    screenDensity,
    isMenuTrayShown,
    isMenuShown,
    isHeaderShown,
    isPhoneMode,
    isDesktopMode,
    hasNoSimpleZoomEmbedEnabled,
    isEmbed,
    isPhoneSize,
    isTabletSize,
    isTraditionalDesktopSize,
    hasWarningRibbon,
    hasDevSiteWarning,
    isProductionSite,
    showFeatureInfoInTooltip,
    showFeatureInfoInBottomPanel,
    noFeatureInfo,
    hasGiveFeedbackButton,
    hasReportProblemButton,
}

const useUIStore = defineStore('ui', {
    state,
    getters: { ...getters },
    actions,
})

export default useUIStore
