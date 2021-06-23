import log from '@/utils/logging'
import AbstractLayer from '@/api/layers/AbstractLayer.class'

const state = {
    /**
     * Current background layer ID
     *
     * @type String
     */
    backgroundLayerId: null,
    /**
     * Currently active layers (that have been selected by the user from the search bar or the layer tree)
     *
     * @type AbstractLayer[]
     */
    activeLayers: [],
    /**
     * All layers' config available to this app
     *
     * @type BODLayer[]
     */
    config: [],
}

const getters = {
    /**
     * Filter all the active layers and gives only those who have the flag `visible` to `true`
     *
     * @param state
     * @returns {AbstractLayer[]} All layers that are currently visible on the map
     */
    visibleLayers: (state) => state.activeLayers.filter((layer) => layer.visible),
    /**
     * All layers in the config that have the flag `background` to `true` (that can be shown as a
     * background layer).
     *
     * @param state
     * @returns Object returned with the same structure as the config, meaning keys of the object
     *   are BG layer IDs and values are BG layer metadata.
     */
    backgroundLayers: (state) =>
        state.config.filter((layer) => layer.isBackground && !layer.isSpecificFor3D),
    /**
     * The currently used background layer's metadata
     *
     * @param state
     * @param getters
     * @returns {BODLayer}
     */
    currentBackgroundLayer: (state, getters) => {
        if (!state.backgroundLayerId) {
            return undefined
        } else {
            return getters.getLayerForBodId(state.backgroundLayerId)
        }
    },
    /**
     * Retrieves a layer metadata defined by its unique ID
     *
     * @param state
     * @returns {BODLayer}
     */
    getLayerForBodId: (state) => (bodId) => state.config.find((layer) => layer.bodID === bodId),
    jointVisibleLayerIds: (state, getters) => {
        const visibleLayerIds = getters.visibleLayers.map((layer) => layer.getID())
        if (visibleLayerIds.length > 0) {
            return visibleLayerIds.reduce((accumulator, layerId) => `${accumulator},${layerId}`)
        }
        return ''
    },
}

const actions = {
    toggleLayerVisibility: ({ commit }, layerId) => commit('toggleLayerVisibility', layerId),
    addLayer: ({ commit }, layerIdOrConfig) => {
        let layerConfig = null
        if (typeof layerIdOrConfig === 'string') {
            layerConfig = state.config.find((layer) => layer.getID() === layerIdOrConfig)
        } else if (layerIdOrConfig instanceof AbstractLayer) {
            layerConfig = layerIdOrConfig
        }
        if (layerConfig) {
            commit('addLayerWithConfig', layerConfig)
        } else {
            log('error', 'no layer found with ID', layerIdOrConfig)
        }
    },
    addLocation: ({ commit }, coordsEPSG3857) => commit('addLocation', coordsEPSG3857),
    removeLayer: ({ commit }, layerId) => commit('removeLayer', layerId),
    clearLayers: ({ commit }) => commit('clearLayers'),
    setLayerConfig: ({ commit, dispatch, state }, config) => {
        const activedLayerBeforeConfigChange = state.activeLayers.map((layer) => layer)
        commit('clearLayers')
        commit('setLayerConfig', config)
        activedLayerBeforeConfigChange.forEach((layer) => {
            commit('addLayer', layer.getID())
            if (!layer.visible) {
                commit('toggleLayerVisibility', layer.getID())
            }
            if (layer.opacity) {
                dispatch('setLayerOpacity', {
                    layerId: layer.getID(),
                    opacity: layer.opacity,
                })
            }
        })
    },
    setBackground: ({ commit }, bgLayerId) => commit('setBackground', bgLayerId),
    setLayerOpacity: ({ commit, state }, payload) => {
        if ('opacity' in payload && 'layerId' in payload) {
            const layer = state.activeLayers.find((layer) => layer.getID() === payload.layerId)
            if (layer) {
                commit('setLayerOpacity', {
                    layer,
                    opacity: Number(payload.opacity),
                })
            }
        }
    },
    setTimedLayerCurrentTimestamp: ({ commit, state }, payload) => {
        if ('layerId' in payload && 'timestamp' in payload) {
            const { layerId, timestamp } = payload
            const layer = state.activeLayers.find((layer) => layer.getID() === layerId)
            const isTimestampInSeries = layer.timeConfig.series.indexOf(`${timestamp}`) !== -1
            // required so that WMS layers with timestamp "all" can be set back to the "all" timestamp
            const isTimestampDefaultBehaviour = layer.timeConfig.behaviour === timestamp
            if (layer && (isTimestampInSeries || isTimestampDefaultBehaviour)) {
                commit('setLayerTimestamp', {
                    layer,
                    // forcing timestamps to be strings
                    timestamp: `${timestamp}`,
                })
            }
        }
    },
    moveActiveLayerBack: ({ commit }, layerId) => {
        const activeLayer = state.activeLayers.find((layer) => layer.getID() === layerId)
        if (activeLayer) {
            // checking if the layer can be put one step back
            const currentIndex = state.activeLayers.indexOf(activeLayer)
            if (currentIndex > 0) {
                commit('moveActiveLayerFromIndexToIndex', {
                    layer: activeLayer,
                    startingIndex: currentIndex,
                    endingIndex: currentIndex - 1,
                })
            }
        }
    },
    moveActiveLayerFront: ({ commit }, layerId) => {
        const activeLayer = state.activeLayers.find((layer) => layer.getID() === layerId)
        if (activeLayer) {
            // checking if the layer can be put one step front
            const currentIndex = state.activeLayers.indexOf(activeLayer)
            if (currentIndex < state.activeLayers.length - 1) {
                commit('moveActiveLayerFromIndexToIndex', {
                    layer: activeLayer,
                    startingIndex: currentIndex,
                    endingIndex: currentIndex + 1,
                })
            }
        }
    },
}

const mutations = {
    toggleLayerVisibility: function (state, layerId) {
        const layer = state.activeLayers.find((layer) => layer.getID() === layerId)
        if (layer) {
            layer.visible = !layer.visible
        }
    },
    addLayerWithConfig: (state, config) => {
        const activeLayer = state.activeLayers.find((layer) => layer.getID() === config.getID())
        // if the layer is already active, we only make sure it is visible again
        if (activeLayer) {
            activeLayer.visible = true
        } else {
            // otherwise cloning layer config so that we keep the one we received pristine
            const layerClone = config.clone()
            layerClone.visible = true
            state.activeLayers.push(layerClone)
        }
    },
    addLocation: (state, { x, y }) => (state.pinLocation = { x, y }),
    clearLayers: (state) => (state.activeLayers = []),
    removeLayer: (state, layerId) =>
        (state.activeLayers = state.activeLayers.filter((layer) => layer.getID() !== layerId)),
    setLayerConfig: (state, config) => (state.config = config),
    setBackground: (state, bgLayerId) => (state.backgroundLayerId = bgLayerId),
    setLayerOpacity: (state, { layer, opacity }) => (layer.opacity = opacity),
    setLayerTimestamp: (state, { layer, timestamp }) =>
        (layer.timeConfig.currentTimestamp = timestamp),
    moveActiveLayerFromIndexToIndex: (state, { layer, startingIndex, endingIndex }) => {
        state.activeLayers.splice(startingIndex, 1)
        state.activeLayers.splice(endingIndex, 0, layer)
    },
}

export default {
    state,
    getters,
    actions,
    mutations,
}
