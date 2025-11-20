import { defineStore } from 'pinia'

import type { DrawingStoreGetters, DrawingStoreState } from '@/store/modules/drawing/types'

import clearDrawingFeatures from '@/store/modules/drawing/actions/clearDrawingFeatures'
import closeDrawing from '@/store/modules/drawing/actions/closeDrawing'
import deleteCurrentDrawing from '@/store/modules/drawing/actions/deleteCurrentDrawing'
import deleteDrawingFeature from '@/store/modules/drawing/actions/deleteDrawingFeature'
import initiateDrawing from '@/store/modules/drawing/actions/initiateDrawing'
import loadAvailableIconSets from '@/store/modules/drawing/actions/loadAvailableIconSets'
import setCurrentlyDrawnFeature from '@/store/modules/drawing/actions/setCurrentlyDrawnFeature'
import setDrawingFeatures from '@/store/modules/drawing/actions/setDrawingFeatures'
import setDrawingMode from '@/store/modules/drawing/actions/setDrawingMode'
import setDrawingName from '@/store/modules/drawing/actions/setDrawingName'
import setDrawingSaveState from '@/store/modules/drawing/actions/setDrawingSaveState'
import setEditingMode from '@/store/modules/drawing/actions/setEditingMode'
import setIsDrawingEditShared from '@/store/modules/drawing/actions/setIsDrawingEditShared'
import setIsVisitWithAdminId from '@/store/modules/drawing/actions/setIsVisitWithAdminId'
import setOnlineMode from '@/store/modules/drawing/actions/setOnlineMode'
import toggleDrawingOverlay from '@/store/modules/drawing/actions/toggleDrawingOverlay'
import updateCurrentDrawingFeature from '@/store/modules/drawing/actions/updateCurrentDrawingFeature'
import updateDrawingPreferences from '@/store/modules/drawing/actions/updateDrawingPreferences'
import { isDrawingEmpty } from '@/store/modules/drawing/getters/isDrawingEmpty'
import isDrawingModified from '@/store/modules/drawing/getters/isDrawingModified'
import showNotSharedDrawingWarning from '@/store/modules/drawing/getters/showNotSharedDrawingWarning'
import { DrawingSaveState, EditMode } from '@/store/modules/drawing/types'
import { MEDIUM, RED, TextPlacement } from '@/utils/featureStyleUtils'

const defaultDrawingTitle = 'draw_mode_title'

const state = (): DrawingStoreState => ({
    layer: {
        ol: undefined,
        config: undefined,
        temporaryKmlId: undefined,
    },
    edit: {
        featureType: undefined,
        mode: EditMode.Off,
        reverseLineStringExtension: false,
        preferred: {
            size: MEDIUM,
            color: RED,
            textPlacement: TextPlacement.Top,
        },
    },
    feature: {
        current: undefined,
        all: [],
    },
    iconSets: [],
    overlay: {
        show: false,
        title: defaultDrawingTitle,
    },
    save: {
        state: DrawingSaveState.Initial,
        pending: undefined,
    },
    // online: true,
    onlineMode: OnlineMode.Online,
    name: undefined,
    isDrawingNew: true,
    isDrawingEditShared: false,
    isVisitWithAdminId: false,
})

const getters: DrawingStoreGetters = {
    isDrawingEmpty,
    isDrawingModified,
    showNotSharedDrawingWarning,
}

const actions = {
    setOnlineMode,
    deleteCurrentDrawing,
    clearDrawingFeatures,
    deleteDrawingFeature,
    loadAvailableIconSets,
    setEditingMode,
    setDrawingFeatures,
    setDrawingMode,
    setDrawingName,
    setIsDrawingEditShared,
    setIsVisitWithAdminId,
    toggleDrawingOverlay,
    updateCurrentDrawingFeature,
    setDrawingSaveState,
    setCurrentlyDrawnFeature,
    initiateDrawing,
    closeDrawing,
    updateDrawingPreferences,
}

const useDrawingStore = defineStore('drawing', {
    state,
    getters: { ...getters },
    actions,
})

export default useDrawingStore
