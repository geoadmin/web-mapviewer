import AbstractLayer from '@/api/layers/AbstractLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { ActiveLayerConfig } from '@/utils/layerUtils'
import log from '@/utils/logging'

const getActiveLayerById = (state, layerId) =>
    state.activeLayers.find((layer) => layer.getID() === layerId)
const removeActiveLayerById = (state, layerId) =>
    state.activeLayers.filter((layer) => layer.getID() !== layerId)

const state = {
    /**
     * Current background layer ID
     *
     * @type String
     */
    backgroundLayerId: null,
    /**
     * Currently active layers (that have been selected by the user from the search bar or the layer
     * tree)
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
    /**
     * A layer to show on the map when hovering a layer (catalog and search) but not in the list of
     * active layers.
     *
     * @type AbstractLayer
     */
    previewLayer: null,
}

const getters = {
    /**
     * Filter all the active layers and gives only those who have the flag `visible` to `true`
     *
     * @param state
     * @returns {AbstractLayer[]} All layers that are currently visible on the map
     */
    visibleLayers: (state) => {
        const visibleLayers = state.activeLayers.filter((layer) => layer.visible)
        if (state.previewLayer !== null) {
            visibleLayers.push(state.previewLayer)
        }
        return visibleLayers
    },
    /**
     * Get current KML layer selected for drawing.
     *
     * That is the KML layer that will be used when the drawing mode is opened.
     *
     * When no KML layer is in active layers then null is returned.
     *
     * @returns {KMLLayer | null}
     */
    activeKmlLayer: (state) => {
        const kmlLayers = state.activeLayers.filter((layer) => layer.type === LayerTypes.KML)
        if (kmlLayers.length > 0) {
            return kmlLayers[kmlLayers.length - 1]
        }
        return null
    },
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
    addLocation({ commit }, coordsEPSG3857) {
        commit('addLocation', coordsEPSG3857)
    },
    setBackground({ commit }, bgLayerId) {
        if (bgLayerId === 'void') {
            commit('setBackground', null)
        } else {
            commit('setBackground', bgLayerId)
        }
    },
    setLayerConfig({ commit, state, getters }, config) {
        const activeLayerBeforeConfigChange = Array.from(state.activeLayers)
        commit('clearLayers')
        commit('setLayerConfig', config)
        activeLayerBeforeConfigChange.forEach((layer) => {
            const layerConfig = getters.getLayerConfigById(layer.getID())
            if (layerConfig) {
                // If we found a layer config we use as it might have change the i18n translation
                const clone = layerConfig.clone()
                clone.visible = layer.visible
                clone.opacity = layer.opacity
                commit('addLayer', { layer: clone })
                if (layer.timeConfig) {
                    commit('setLayerTimestamp', {
                        layerId: clone.getID(),
                        timestamp: layer.timeConfig.currentTimestamp,
                    })
                }
            } else {
                // if no config is found, then it is a layer that is not managed, like for example
                // the KML layers, in this case we take the old active configuration as fallback.
                commit('addLayer', { layer: layer.clone() })
            }
        })
    },
    async addLayer({ commit, getters }, payload) {
        let layer = null
        if (payload instanceof AbstractLayer) {
            layer = payload
        } else if (payload instanceof ActiveLayerConfig) {
            // Get the AbstractLayer Config object, we need to clone it in order
            // to update the config (opacity/visible) if needed.
            layer = getters.getLayerConfigById(payload.id)?.clone()

            if (layer) {
                if (payload.visible !== undefined) {
                    layer.visible = payload.visible
                }
                if (payload.opacity !== undefined) {
                    layer.opacity = payload.opacity
                }
            }
        } else if (typeof payload === 'string') {
            layer = getters.getLayerConfigById(payload)
        }
        if (layer) {
            try {
                const metadata = await layer.getMetadata()
                commit('addLayer', { layer: layer, metadata: metadata })
            } catch (error) {
                log.error(`Failed to retrieve layer ${layer.getID()} metadata`, error)
                commit('addLayer', { layer: layer, metadata: null })
            }
        } else {
            log.error('no layer found for payload:', payload)
        }
    },
    removeLayer({ commit }, layerIdOrObject) {
        if (typeof layerIdOrObject === 'string') {
            commit('removeLayerWithId', layerIdOrObject)
        } else if (layerIdOrObject instanceof AbstractLayer) {
            commit('removeLayerWithId', layerIdOrObject.getID())
        } else {
            log.error('Can not remove layer that is not yet added', layerIdOrObject)
        }
    },
    clearLayers({ commit }) {
        commit('clearLayers')
    },
    toggleLayerVisibility({ commit }, layerId) {
        commit('toggleLayerVisibility', layerId)
    },
    setLayerVisibility({ commit }, payload) {
        if ('visible' in payload && 'layerId' in payload) {
            commit('setLayerVisibility', payload)
        } else {
            log.error('Failed to set layer visibility, invalid payload', payload)
        }
    },
    setLayerOpacity({ commit }, payload) {
        if ('opacity' in payload && 'layerId' in payload) {
            commit('setLayerOpacity', {
                layerId: payload.layerId,
                opacity: Number(payload.opacity),
            })
        } else {
            log.error('Cannot set layer opacity invalid payload', payload)
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
                log.error(
                    'Failed to set layer timestamp, layer not found or has not time config',
                    layerId,
                    layer
                )
            }
        } else {
            log.error('Failed to set layer timestamp, invalid payload', payload)
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
    setPreviewLayer({ commit, getters }, layerId) {
        const layer = getters.getLayerConfigById(layerId)
        if (layer) {
            const cloned = layer.clone()
            cloned.visible = true
            commit('setPreviewLayer', cloned)
        } else {
            log.error(`Layer "${layerId} not found in configs.`)
        }
    },
    clearPreviewLayer({ commit }) {
        commit('setPreviewLayer', null)
    },
}

const mutations = {
    addLocation(state, { x, y }) {
        state.pinLocation = { x, y }
    },
    setBackground(state, bgLayerId) {
        state.backgroundLayerId = bgLayerId
    },
    setLayerConfig(state, config) {
        state.config = config
    },
    addLayer(state, { layer: layer, metadata: metadata }) {
        // first remove it if already present in order to avoid duplicate layers
        state.activeLayers = removeActiveLayerById(state, layer.getID())
        if (metadata) {
            layer.metadata = metadata
        }
        state.activeLayers.push(layer)
    },
    removeLayerWithId(state, layerId) {
        state.activeLayers = removeActiveLayerById(state, layerId)
    },
    clearLayers(state) {
        state.activeLayers = []
    },
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
    setLayerOpacity(state, { layerId, opacity }) {
        const layerMatchingId = getActiveLayerById(state, layerId)
        if (layerMatchingId) {
            layerMatchingId.opacity = opacity
        }
    },
    setLayerTimestamp(state, { layerId, timestamp }) {
        getActiveLayerById(state, layerId).timeConfig.currentTimestamp = timestamp
    },
    moveActiveLayerFromIndexToIndex(state, { layer, startingIndex, endingIndex }) {
        state.activeLayers.splice(startingIndex, 1)
        state.activeLayers.splice(endingIndex, 0, layer)
    },
    setPreviewLayer(state, layer) {
        state.previewLayer = layer
    },
}

export default {
    state,
    getters,
    actions,
    mutations,
}
