import log from '@/utils/logging'
import AbstractLayer from '@/api/layers/AbstractLayer.class'

const getActiveLayerById = (state, layerId) =>
    state.activeLayers.find((layer) => layer.getID() === layerId)

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
     * @type GeoAdminLayer[]
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
     * @returns {GeoAdminLayer}
     */
    currentBackgroundLayer: (state, getters) => {
        if (!state.backgroundLayerId) {
            return undefined
        } else {
            return getters.getLayerConfigById(state.backgroundLayerId)
        }
    },
    /**
     * Retrieves a layer config metadata defined by its unique ID
     *
     * @param state
     * @returns {GeoAdminLayer}
     */
    getLayerConfigById: (state) => (geoAdminLayerId) =>
        state.config.find((layer) => layer.getID() === geoAdminLayerId),
    /**
     * Retrieves an active layer metadata defined by its unique ID
     *
     * @param state
     * @returns {GeoAdminLayer}
     */
    getActiveLayerById: (state) => (geoAdminLayerId) =>
        state.activeLayers.find((layer) => layer.getID() === geoAdminLayerId),
}

const actions = {
    toggleLayerVisibility({ commit }, layerId) {
        commit('toggleLayerVisibility', layerId)
    },
    setLayerVisibility({ commit }, payload) {
        if ('visible' in payload && 'layerId' in payload) {
            commit('setLayerVisibility', payload)
        } else {
            log('error', 'Failed to set layer visibility, invalid payload', payload)
        }
    },
    addLayer({ commit, getters }, layerIdOrConfig) {
        let layerConfig = null
        if (typeof layerIdOrConfig === 'string') {
            layerConfig = getters.getLayerConfigById(layerIdOrConfig)
        } else if (layerIdOrConfig instanceof AbstractLayer) {
            layerConfig = layerIdOrConfig
        }
        if (layerConfig) {
            commit('addLayerWithConfig', layerConfig)
        } else {
            log('error', 'no layer found with ID', layerIdOrConfig)
        }
    },
    addLocation({ commit }, coordsEPSG3857) {
        commit('addLocation', coordsEPSG3857)
    },
    removeLayer({ commit }, layerIdOrConfig) {
        if (typeof layerIdOrConfig === 'string') {
            commit('removeLayerWithId', layerIdOrConfig)
        } else if (layerIdOrConfig instanceof AbstractLayer) {
            commit('removeLayerWithId', layerIdOrConfig.getID())
        } else {
            log('error', 'Can not remove layer that is not yet added', layerIdOrConfig)
        }
    },
    clearLayers({ commit }) {
        commit('clearLayers')
    },
    setLayerConfig({ commit, state, getters }, config) {
        const activeLayerBeforeConfigChange = Array.from(state.activeLayers)
        commit('clearLayers')
        commit('setLayerConfig', config)
        activeLayerBeforeConfigChange.forEach((layer) => {
            const layerConfig = getters.getLayerConfigById(layer.getID())
            commit('addLayerWithConfig', layerConfig)
            commit('setLayerVisibility', { layerId: layer.getID(), visible: layer.visible })
            commit('setLayerOpacity', { layerId: layer.getID(), opacity: layer.opacity })
            if (layer.timeConfig) {
                commit('setLayerTimestamp', {
                    layerId: layer.getID(),
                    timestamp: layer.timeConfig.currentTimestamp,
                })
            }
        })
    },
    setBackground({ commit }, bgLayerId) {
        if (bgLayerId === 'void') {
            commit('setBackground', null)
        } else {
            commit('setBackground', bgLayerId)
        }
    },
    setLayerOpacity({ commit }, payload) {
        if ('opacity' in payload && 'layerId' in payload) {
            commit('setLayerOpacity', {
                layerId: payload.layerId,
                opacity: Number(payload.opacity),
            })
        } else {
            log('error', 'Cannot set layer opacity invalid payload', payload)
        }
    },
    setTimedLayerCurrentTimestamp({ commit, getters }, payload) {
        if ('layerId' in payload && 'timestamp' in payload) {
            const { layerId, timestamp } = payload
            const layer = getters.getActiveLayerById(layerId)
            if (layer && layer.timeConfig) {
                const isTimestampInSeries = layer.timeConfig.series.indexOf(`${timestamp}`) !== -1
                // required so that WMS layers with timestamp "all" can be set back to the "all" timestamp
                const isTimestampDefaultBehaviour = layer.timeConfig.behaviour === timestamp
                if (isTimestampInSeries || isTimestampDefaultBehaviour) {
                    commit('setLayerTimestamp', {
                        layerId,
                        // forcing timestamps to be strings
                        timestamp: `${timestamp}`,
                    })
                }
            } else {
                log(
                    'error',
                    'Failed to set layer timestamp, layer not found or has not time config',
                    layerId,
                    layer
                )
            }
        } else {
            log('error', 'Failed to set layer timestamp, invalid payload', payload)
        }
    },
    moveActiveLayerBack({ commit, state, getters }, layerId) {
        const activeLayer = getters.getActiveLayerById(layerId)
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
    moveActiveLayerFront({ commit, state, getters }, layerId) {
        const activeLayer = getters.getActiveLayerById(layerId)
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
    toggleLayerVisibility(state, layerId) {
        const layer = getActiveLayerById(state, layerId)
        if (layer) {
            layer.visible = !layer.visible
        }
    },
    setLayerVisibility(state, { layerId, visible }) {
        const activeLayer = getActiveLayerById(state, layerId)
        if (activeLayer) {
            activeLayer.visible = visible
        }
    },
    addLayerWithConfig(state, config) {
        const activeLayer = getActiveLayerById(state, config.getID())
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
    addLocation(state, { x, y }) {
        state.pinLocation = { x, y }
    },
    clearLayers(state) {
        state.activeLayers = []
    },
    removeLayerWithId(state, layerId) {
        state.activeLayers = state.activeLayers.filter((layer) => layer.getID() !== layerId)
    },
    setLayerConfig(state, config) {
        state.config = config
    },
    setBackground(state, bgLayerId) {
        state.backgroundLayerId = bgLayerId
    },
    setLayerOpacity(state, { layerId, opacity }) {
        getActiveLayerById(state, layerId).opacity = opacity
    },
    setLayerTimestamp(state, { layerId, timestamp }) {
        getActiveLayerById(state, layerId).timeConfig.currentTimestamp = timestamp
    },
    moveActiveLayerFromIndexToIndex(state, { layer, startingIndex, endingIndex }) {
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
