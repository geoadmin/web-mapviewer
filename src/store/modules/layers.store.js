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
     * Current background layer
     *
     * @type AbstractLayer
     */
    currentBackgroundLayer: null,
    /**
     * Currently active layers (that have been selected by the user from the search bar or the layer
     * tree)
     *
     * Layers are ordered from bottom to top (last layer is shown on top of all the others)
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
    /**
     * Year being picked by the time slider. The format is YYYY (but might evolve in the future in
     * the ISO 8601 date format direction, meaning YYYY-MM-DD, hence the String type).
     *
     * We store it outside the time config of layers so that layers revert back to their specific
     * chosen timestamp when the time slider is closed. That also means that the year picked by the
     * time slider doesn't end up in the URL params too.
     *
     * @type Number
     */
    previewYear: null,
}

const getters = {
    /**
     * Filter all the active layers and gives only those who have the flag `visible` to `true`
     *
     * Layers are ordered from bottom to top (last layer is shown on top of all the others)
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

    /**
     * Returns true if the layer comes from a third party (external layer or KML layer).
     *
     * KML layer are treated as external when they are generated by another user (no adminId).
     *
     * @param {string} layerId Layer ID of the layer to check for data disclaimer
     * @returns {Boolean}
     */
    hasDataDisclaimer: (state) => (layerId) => {
        const layer = state.activeLayers.find((layer) => layer.getID() === layerId)
        return layer?.isExternal || (layer?.type === LayerTypes.KML && !layer?.adminId)
    },
}

const actions = {
    /**
     * Will set the background to the given layer (or layer ID), but only if this layer's
     * configuration states that this layer can be a background layer (isBackground flag)
     *
     * @param {String | AbstractLayer} layerIdOrObject
     */
    setBackground({ commit, getters }, layerIdOrObject) {
        let futureBackground
        if (typeof layerIdOrObject === 'string') {
            futureBackground = getters.getLayerConfigById(layerIdOrObject)
        } else if (layerIdOrObject instanceof AbstractLayer) {
            futureBackground = getters.getLayerConfigById(layerIdOrObject.getID())
        }
        if (futureBackground?.isBackground) {
            commit('setBackground', futureBackground)
        } else {
            commit('setBackground', null)
        }
    },
    /**
     * Sets the configuration of all available layers for this application
     *
     * Will add layers back, if some were already added before the config was changed
     *
     * @param {AbstractLayer[]} config
     */
    setLayerConfig({ commit, state, getters }, config) {
        const activeLayerBeforeConfigChange = [...state.activeLayers]
        commit('clearLayers')
        commit('setLayerConfig', [...config])
        activeLayerBeforeConfigChange.forEach((layer) => {
            const layerConfig = getters.getLayerConfigById(layer.getID())
            if (layerConfig) {
                // If we found a layer config we use as it might have changed the i18n translation
                const clone = layerConfig.clone()
                clone.visible = layer.visible
                clone.opacity = layer.opacity
                commit('addLayer', { layer: clone })
                if (layer.timeConfig) {
                    commit('setLayerYear', {
                        layerId: clone.getID(),
                        year: layer.timeConfig.currentYear,
                    })
                }
            } else {
                // if no config is found, then it is a layer that is not managed, like for example
                // the KML layers, in this case we take the old active configuration as fallback.
                commit('addLayer', { layer: layer.clone() })
            }
        })
    },
    /**
     * Add a layer to the active layers.
     *
     * It will do so by cloning the config that is given, or the one that matches the layer ID in the
     * layers' config. This is done so that we may add one "layer" multiple time to the active layers
     * list (for instance having a time enabled layer added multiple time with a different timestamp)
     *
     * @param {String | AbstractLayer | ActiveLayerConfig} layerIdOrObject
     */
    async addLayer({ commit, getters }, layerIdOrObject) {
        // creating a clone of the config, so that we do not modify the initial config of the app
        // (it is possible to add one layer many times, so we want to always have the correct
        // default values when we add it, not the settings from the layer already added)
        let layer = null
        if (layerIdOrObject instanceof AbstractLayer) {
            layer = layerIdOrObject.clone()
        } else if (layerIdOrObject instanceof ActiveLayerConfig) {
            // Get the AbstractLayer Config object, we need to clone it in order
            // to update the config (opacity/visible) if needed.
            layer = getters.getLayerConfigById(layerIdOrObject.id)?.clone()

            if (layer) {
                if (layerIdOrObject.visible !== undefined) {
                    layer.visible = layerIdOrObject.visible
                }
                if (layerIdOrObject.opacity !== undefined) {
                    layer.opacity = layerIdOrObject.opacity
                }
            }
        } else if (typeof layerIdOrObject === 'string') {
            layer = getters.getLayerConfigById(layerIdOrObject)?.clone()
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
            log.error('no layer found for payload:', layerIdOrObject)
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
    toggleLayerVisibility({ commit, state }, layerIdOrObject) {
        let layer = null
        if (typeof layerIdOrObject === 'string') {
            layer = getActiveLayerById(state, layerIdOrObject)
        } else if (layerIdOrObject instanceof AbstractLayer) {
            // here we are not 100% sure that the instance we have received matches the one stored
            // in activate layers, as the addLayer action creates clones of the config when a layer
            // is added. So we search for the matching instance in the currently active layers.
            layer = state.activeLayers.find(
                (activeLayer) => activeLayer.getID() === layerIdOrObject.getID()
            )
        }
        if (layer) {
            commit('toggleLayerVisibility', layer)
        } else {
            log.error('Cannot toggle layer visibility, layer not found', layerIdOrObject)
        }
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
    setTimedLayerCurrentYear({ commit, getters }, { layerId, year }) {
        if (layerId && year) {
            const layer = getters.getActiveLayerById(layerId)
            if (layer && layer.timeConfig) {
                // checking that the year exists in this timeConfig
                const timeEntryForYear = layer.timeConfig.getTimeEntryForYear(year)
                if (timeEntryForYear) {
                    commit('setLayerYear', {
                        layerId,
                        year: year,
                    })
                } else {
                    log.error('timestamp for year not found, ignoring change', layer, year)
                }
            } else {
                log.error(
                    'Failed to set layer year, layer not found or has no time config',
                    layerId,
                    layer
                )
            }
        } else {
            log.error('Failed to set layer year, invalid payload', layerId, year)
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
            log.error(`Layer "${layerId}" not found in configs.`)
        }
    },
    clearPreviewLayer({ commit }) {
        commit('setPreviewLayer', null)
    },
    setPreviewYear({ commit, state }, year) {
        const possibleYears = state.activeLayers.flatMap((layer) => layer.timeConfig.years)
        if (possibleYears.includes(year)) {
            commit('setPreviewYear', year)
        } else {
            log.error('year not found in active layers, ignoring', year)
        }
    },
    clearPreviewYear({ commit }) {
        commit('setPreviewYear', null)
    },
}

const mutations = {
    setBackground(state, backgroundLayer) {
        state.currentBackgroundLayer = backgroundLayer
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
    toggleLayerVisibility(state, layer) {
        layer.visible = !layer.visible
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
    setLayerYear(state, { layerId, year }) {
        const timedLayer = getActiveLayerById(state, layerId)
        timedLayer.timeConfig.currentTimeEntry = timedLayer.timeConfig.getTimeEntryForYear(year)
    },
    moveActiveLayerFromIndexToIndex(state, { layer, startingIndex, endingIndex }) {
        state.activeLayers.splice(startingIndex, 1)
        state.activeLayers.splice(endingIndex, 0, layer)
    },
    setPreviewLayer(state, layer) {
        state.previewLayer = layer
    },
    setPreviewYear(state, year) {
        state.previewYear = year
    },
}

export default {
    state,
    getters,
    actions,
    mutations,
}
