import { defineStore } from 'pinia'

import type { LayersStoreGetters, LayersStoreState } from '@/store/modules/layers/types/layers'

import addLayer from '@/store/modules/layers/actions/addLayer'
import addLayerError from '@/store/modules/layers/actions/addLayerError'
import addSystemLayer from '@/store/modules/layers/actions/addSystemLayer'
import clearLayers from '@/store/modules/layers/actions/clearLayers'
import clearPreviewLayer from '@/store/modules/layers/actions/clearPreviewLayer'
import { identifyFeatures } from '@/store/modules/layers/actions/identifyFeatures'
import loadLayersConfig from '@/store/modules/layers/actions/loadLayersConfig'
import moveActiveLayerToIndex from '@/store/modules/layers/actions/moveActiveLayerToIndex'
import removeLayer from '@/store/modules/layers/actions/removeLayer'
import removeLayerError from '@/store/modules/layers/actions/removeLayerError'
import removeSystemLayer from '@/store/modules/layers/actions/removeSystemLayer'
import setBackground from '@/store/modules/layers/actions/setBackground'
import setKmlGpxLayerData from '@/store/modules/layers/actions/setKmlGpxLayerData'
import setLayerConfig from '@/store/modules/layers/actions/setLayerConfig'
import setLayerOpacity from '@/store/modules/layers/actions/setLayerOpacity'
import setLayers from '@/store/modules/layers/actions/setLayers'
import setLayerVisibility from '@/store/modules/layers/actions/setLayerVisibility'
import setPreviewLayer from '@/store/modules/layers/actions/setPreviewLayer'
import setPreviewYear from '@/store/modules/layers/actions/setPreviewYear'
import setTimedLayerCurrentTimeEntry from '@/store/modules/layers/actions/setTimedLayerCurrentTimeEntry'
import setTimedLayerCurrentYear from '@/store/modules/layers/actions/setTimedLayerCurrentYear'
import toggleLayerVisibility from '@/store/modules/layers/actions/toggleLayerVisibility'
import updateLayer from '@/store/modules/layers/actions/updateLayer'
import updateLayers from '@/store/modules/layers/actions/updateLayers'
import updateSystemLayer from '@/store/modules/layers/actions/updateSystemLayer'
import activeKmlLayer from '@/store/modules/layers/getters/activeKmlLayer'
import backgroundLayers from '@/store/modules/layers/getters/backgroundLayers'
import currentBackgroundLayer from '@/store/modules/layers/getters/currentBackgroundLayer'
import getActiveLayerByIndex from '@/store/modules/layers/getters/getActiveLayerByIndex'
import getActiveLayersById from '@/store/modules/layers/getters/getActiveLayersById'
import getIndexOfActiveLayerById from '@/store/modules/layers/getters/getIndexOfActiveLayerById'
import getLayerConfigById from '@/store/modules/layers/getters/getLayerConfigById'
import getLayersById from '@/store/modules/layers/getters/getLayersById'
import hasAnyLocalFile from '@/store/modules/layers/getters/hasAnyLocalFile'
import hasDataDisclaimer from '@/store/modules/layers/getters/hasDataDisclaimer'
import { isFeatureSelected } from '@/store/modules/layers/getters/isFeatureSelected'
import isLocalFile from '@/store/modules/layers/getters/isLocalFile'
import oldestYear from '@/store/modules/layers/getters/oldestYear'
import visibleLayerOnTop from '@/store/modules/layers/getters/visibleLayerOnTop'
import visibleLayers from '@/store/modules/layers/getters/visibleLayers'
import visibleLayersWithTimeConfig from '@/store/modules/layers/getters/visibleLayersWithTimeConfig'
import youngestYear from '@/store/modules/layers/getters/yougestYear'

const state = (): LayersStoreState => ({
    currentBackgroundLayerId: undefined,
    activeLayers: [],
    config: [],
    previewLayer: undefined,
    previewInterval: undefined,
    systemLayers: [],
})

const getters: LayersStoreGetters = {
    activeKmlLayer,
    backgroundLayers,
    currentBackgroundLayer,
    getActiveLayerByIndex,
    getActiveLayersById,
    getIndexOfActiveLayerById,
    getLayerConfigById,
    getLayersById,
    hasAnyLocalFile,
    hasDataDisclaimer,
    isLocalFile,
    oldestYear,
    visibleLayerOnTop,
    visibleLayers,
    visibleLayersWithTimeConfig,
    youngestYear,
    isFeatureSelected,
}

const actions = {
    loadLayersConfig,
    setBackground,
    setPreviewYear,
    setTimedLayerCurrentYear,
    setLayerConfig,
    addLayer,
    setLayers,
    removeLayer,
    updateLayer,
    updateLayers,
    clearLayers,
    toggleLayerVisibility,
    setLayerVisibility,
    setLayerOpacity,
    setTimedLayerCurrentTimeEntry,
    moveActiveLayerToIndex,
    setPreviewLayer,
    clearPreviewLayer,
    addLayerError,
    removeLayerError,
    setKmlGpxLayerData,
    addSystemLayer,
    updateSystemLayer,
    removeSystemLayer,
    identifyFeatures,
}

const useLayersStore = defineStore('layers', {
    state,
    getters: {
        ...getters,
    },
    actions,
})

export default useLayersStore
