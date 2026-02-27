import type { DrawingStoreGetters, DrawingStoreState } from '~/types/drawingStore'

import { featureStyleUtils } from '@swissgeo/api/utils'
import { LV95 } from '@swissgeo/coordinates'
import { acceptHMRUpdate, defineStore } from 'pinia'

import cancelCloseDrawing from './actions/cancelCloseDrawing'
import closeDrawing from './actions/closeDrawing'
import deleteCurrentDrawing from './actions/deleteCurrentDrawing'
import generateShareLinks from './actions/generateShareLinks'
import initiateDrawing from './actions/initiateDrawing'
import loadAvailableIconSets from './actions/loadAvailableIconSets'
import setCurrentlyDrawnFeature from './actions/setCurrentlyDrawnFeature'
import setDrawingDebugConfig from './actions/setDrawingDebugConfig'
import setDrawingFeatures from './actions/setDrawingFeatures'
import setDrawingMode from './actions/setDrawingMode'
import setDrawingName from './actions/setDrawingName'
import setDrawingProjection from './actions/setDrawingProjection'
import setDrawingSaveState from './actions/setDrawingSaveState'
import setEditingMode from './actions/setEditingMode'
import setHasAdminLinkBeenCopied from './actions/setHasAdminLinkBeenCopied'
import setIsDrawingEditShared from './actions/setIsDrawingEditShared'
import setIsVisitWithAdminId from './actions/setIsVisitWithAdminId'
import updateCurrentDrawingFeature from './actions/updateCurrentDrawingFeature'
import updateDrawingPreferences from './actions/updateDrawingPreferences'
import isDrawingEmpty from './getters/isDrawingEmpty'
import isDrawingModified from './getters/isDrawingModified'
import showWarningAdminLinkNotCopied from './getters/showWarningAdminLinkNotCopied'

const defaultDrawingTitle = '@swissgeo/drawing.draw_mode_title'

const state = (): DrawingStoreState => ({
    olMap: undefined,
    state: 'INITIALIZING',
    online: true,
    name: 'Drawing',
    description: defaultDrawingTitle,
    projection: LV95,
    iconSets: [],

    layer: {
        ol: undefined,
        config: undefined,
        temporaryKmlId: undefined,
    },

    edit: {
        featureType: undefined,
        mode: 'OFF',
        reverseLineStringExtension: false,
        preferred: {
            size: featureStyleUtils.MEDIUM,
            color: featureStyleUtils.RED,
            textPlacement: 'top',
        },
    },

    feature: {
        current: undefined,
        all: [],
    },

    save: {
        state: 'INITIAL',
        pending: undefined,
    },

    share: {
        adminLink: undefined,
        publicLink: undefined,
        hasAdminLinkBeenCopied: false,
    },

    isDrawingNew: true,
    isDrawingEditShared: false,
    isVisitWithAdminId: false,

    debug: {
        retryOnError: false,
        quickDebounce: false,
        staging: 'production',
    },
})

const getters: DrawingStoreGetters = {
    isDrawingEmpty,
    isDrawingModified,
    showWarningAdminLinkNotCopied,
}

const actions = {
    cancelCloseDrawing,
    closeDrawing,
    deleteCurrentDrawing,
    generateShareLinks,
    initiateDrawing,
    loadAvailableIconSets,
    setCurrentlyDrawnFeature,
    setDrawingDebugConfig,
    setDrawingFeatures,
    setDrawingMode,
    setDrawingName,
    setDrawingProjection,
    setDrawingSaveState,
    setEditingMode,
    setHasAdminLinkBeenCopied,
    setIsDrawingEditShared,
    setIsVisitWithAdminId,
    updateCurrentDrawingFeature,
    updateDrawingPreferences,
}

export const useDrawingStore = defineStore('drawing', {
    state,
    getters: { ...getters },
    actions,
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useDrawingStore, import.meta.hot))
}
