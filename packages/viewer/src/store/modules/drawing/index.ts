import { defineStore } from 'pinia'

import type { DrawingStoreGetters, DrawingStoreState } from '@/store/modules/drawing/types/drawing'

import addDrawingFeature from '@/store/modules/drawing/actions/addDrawingFeature'
import clearDrawingFeatures from '@/store/modules/drawing/actions/clearDrawingFeatures'
import deleteDrawingFeature from '@/store/modules/drawing/actions/deleteDrawingFeature'
import loadAvailableIconSets from '@/store/modules/drawing/actions/loadAvailableIconSets'
import setDrawingFeatures from '@/store/modules/drawing/actions/setDrawingFeatures'
import setDrawingMode from '@/store/modules/drawing/actions/setDrawingMode'
import setDrawingName from '@/store/modules/drawing/actions/setDrawingName'
import setEditingMode from '@/store/modules/drawing/actions/setEditingMode'
import setIsDrawingEditShared from '@/store/modules/drawing/actions/setIsDrawingEditShared'
import setIsDrawingModified from '@/store/modules/drawing/actions/setIsDrawingModified'
import setIsVisitWithAdminId from '@/store/modules/drawing/actions/setIsVisitWithAdminId'
import toggleDrawingOverlay from '@/store/modules/drawing/actions/toggleDrawingOverlay'
import { isDrawingEmpty } from '@/store/modules/drawing/getters/isDrawingEmpty'
import showNotSharedDrawingWarning from '@/store/modules/drawing/getters/showNotSharedDrawingWarning'
import { EditMode } from '@/store/modules/drawing/types/EditMode.enum'

const defaultDrawingTitle = 'draw_mode_title'

const state = (): DrawingStoreState => ({
    mode: undefined,
    iconSets: [],
    featureIds: [],
    drawingOverlay: {
        show: false,
        title: defaultDrawingTitle,
    },
    online: true,
    temporaryKmlId: undefined,
    name: undefined,
    reverseLineStringExtension: false,
    editingMode: EditMode.Off,
    isDrawingEditShared: false,
    isDrawingModified: false,
    isVisitWithAdminId: false,
})

const getters: DrawingStoreGetters = {
    isDrawingEmpty,
    showNotSharedDrawingWarning,
}

const actions = {
    addDrawingFeature,
    clearDrawingFeatures,
    deleteDrawingFeature,
    loadAvailableIconSets,
    setEditingMode,
    setDrawingFeatures,
    setDrawingMode,
    setDrawingName,
    setIsDrawingEditShared,
    setIsDrawingModified,
    setIsVisitWithAdminId,
    toggleDrawingOverlay,
}

const useDrawingStore = defineStore('drawing', {
    state,
    getters: { ...getters },
    actions,
})

export default useDrawingStore
