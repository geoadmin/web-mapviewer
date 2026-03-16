import { featureStyleUtils } from '@swissgeo/api/utils'
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
import setDrawingHasLoaded from '@/store/modules/drawing/actions/setDrawingHasLoaded'
import setDrawingMode from '@/store/modules/drawing/actions/setDrawingMode'
import setDrawingName from '@/store/modules/drawing/actions/setDrawingName'
import setDrawingSaveState from '@/store/modules/drawing/actions/setDrawingSaveState'
import setEditingMode from '@/store/modules/drawing/actions/setEditingMode'
import setIsDrawingEditShared from '@/store/modules/drawing/actions/setIsDrawingEditShared'
import updateCurrentDrawingFeature from '@/store/modules/drawing/actions/updateCurrentDrawingFeature'
import updateDrawingPreferences from '@/store/modules/drawing/actions/updateDrawingPreferences'
import { isDrawingEmpty } from '@/store/modules/drawing/getters/isDrawingEmpty'

const defaultDrawingTitle = 'draw_mode_title'

const state = (): DrawingStoreState => ({
    layer: {
        ol: undefined,
        temporaryKmlId: undefined,
        hasLoaded: false,
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
    iconSets: [],
    overlay: {
        show: false,
        title: defaultDrawingTitle,
    },
    save: {
        state: 'INITIAL',
        pending: undefined,
    },
    online: true,
    name: undefined,
    isDrawingNew: true,
    isDrawingEditShared: false,
    hasLoadedDrawingWithOnlyAdminId: false,
})

const getters: DrawingStoreGetters = {
    isDrawingEmpty,
}

const actions = {
    deleteCurrentDrawing,
    clearDrawingFeatures,
    deleteDrawingFeature,
    loadAvailableIconSets,
    setEditingMode,
    setDrawingFeatures,
    setDrawingMode,
    setDrawingName,
    setIsDrawingEditShared,
    updateCurrentDrawingFeature,
    setDrawingSaveState,
    setCurrentlyDrawnFeature,
    initiateDrawing,
    closeDrawing,
    updateDrawingPreferences,
    setDrawingHasLoaded,
}

const useDrawingStore = defineStore('drawing', {
    state,
    getters: { ...getters },
    actions,
})

export default useDrawingStore
