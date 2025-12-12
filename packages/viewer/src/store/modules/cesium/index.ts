import { defineStore } from 'pinia'

import type { CesiumStoreGetters, CesiumStoreState } from '@/store/modules/cesium/types'

import { CESIUM_LAYER_TOOLTIPS_CONFIGURATION } from '@/config/cesium.config'
import set3dActive from '@/store/modules/cesium/actions/set3dActive'
import setShowConstructionsBuildings from '@/store/modules/cesium/actions/setShowConstructionsBuildings'
import setShowLabels from '@/store/modules/cesium/actions/setShowLabels'
import setShowVegetation from '@/store/modules/cesium/actions/setShowVegetation'
import setViewerReady from '@/store/modules/cesium/actions/setViewerReady'
import backgroundLayersFor3D from '@/store/modules/cesium/getters/backgroundLayersFor3D'
import layersWithTooltips from '@/store/modules/cesium/getters/layersWithTooltips'

const state = (): CesiumStoreState => ({
    active: false,
    showVegetation: false,
    showBuildings: true,
    showConstructions: true,
    showLabels: true,
    isViewerReady: false,
    layersTooltipConfig: CESIUM_LAYER_TOOLTIPS_CONFIGURATION,
})

const getters: CesiumStoreGetters = {
    backgroundLayersFor3D,
    layersWithTooltips,
}

const actions = {
    set3dActive,
    setShowConstructionsBuildings,
    setShowVegetation,
    setShowLabels,
    setViewerReady,
}

const useCesiumStore = defineStore('cesium', {
    state,
    getters: { ...getters },
    actions,
})

export default useCesiumStore
