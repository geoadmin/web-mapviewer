import AbstractLayer from '@/api/layers/AbstractLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { getExtentForProjection } from '@/utils/extentUtils.js'
import { getGpxExtent } from '@/utils/gpxUtils.js'
import { getKmlExtent, parseKmlName } from '@/utils/kmlUtils'
import log from '@/utils/logging'

const getActiveLayersById = (state, layerId) =>
    state.activeLayers.filter((layer) => layer.id === layerId)
const getActiveLayerByIndex = (state, index) => state.activeLayers.at(index)

const cloneActiveLayerConfig = (getters, layer) => {
    const clone = getters.getLayerConfigById(layer.id)?.clone() ?? null
    if (clone) {
        if (typeof layer.visible === 'boolean') {
            clone.visible = layer.visible
        }
        if (typeof layer.opacity === 'number') {
            clone.opacity = layer.opacity
        }
        if (layer.customAttributes) {
            const { year, updateDelay } = layer.customAttributes
            if (year && clone.timeConfig) {
                clone.timeConfig.updateCurrentTimeEntry(clone.timeConfig.getTimeEntryForYear(year))
            }
            if (updateDelay) {
                clone.updateDelay = updateDelay
            }
        }
    }
    return clone
}

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
    /**
     * System layers. List of system layers that are added on top and cannot be directly controlled
     * by the user.
     *
     * @type AbstractLayer[]
     */
    systemLayers: [],
}

const getters = {
    /**
     * Filter all the active layers and gives only those who have the flag `visible` to `true`
     *
     * Layers are ordered from bottom to top (last layer is shown on top of all the others)
     *
     * @returns {AbstractLayer[]} All layers that are currently visible on the map
     */
    visibleLayers: (state) => {
        const visibleLayers = state.activeLayers.filter((layer) => layer.visible)
        if (state.previewLayer !== null) {
            visibleLayers.push(state.previewLayer)
        }
        return visibleLayers.concat(state.systemLayers.filter((layer) => layer.visible))
    },

    /**
     * Return the visible layer on top (layer with visible flag to true)
     *
     * @returns {AbstractLayer | null} The visible layer or null if no layer are visible
     */
    visibleLayerOnTop: (state, getters) => {
        if (getters.visibleLayers.length > 0) {
            return getters.visibleLayers.slice(-1)[0]
        }
        return null
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
    activeKmlLayer: (state) =>
        state.activeLayers.find((layer) => layer.type === LayerTypes.KML && !layer.isExternal) ??
        null,

    /**
     * All layers in the config that have the flag `background` to `true` (that can be shown as a
     * background layer).
     *
     * @returns {[AbstractLayer]} List of background layers.
     */
    backgroundLayers: (state, _) =>
        state.config.filter((layer) => layer.isBackground && layer.idIn3d),

    /**
     * Retrieves a layer config metadata defined by its unique ID
     *
     * @returns {AbstractLayer | null}
     */
    getLayerConfigById: (state) => (geoAdminLayerId) =>
        state.config.find((layer) => layer.id === geoAdminLayerId) ?? null,

    /**
     * Retrieves active layer(s) by ID
     *
     * @param {string} layerId ID of the layer(s) to retrieve
     * @returns {[AbstractLayer]} All active layers matching the ID
     */
    getActiveLayersById: (state) => (layerId) =>
        state.activeLayers.filter((layer) => layer.id === layerId),

    /**
     * Retrieves layer(s) by ID.
     *
     * Search in active layer and in preview layer
     *
     * @param {string} layerId ID of the layer(s) to retrieve
     * @returns {[AbstractLayer]} All active layers matching the ID
     */
    getLayersById: (state) => (layerId) => {
        const layers = state.activeLayers.filter((layer) => layer.id === layerId)
        if (state.previewLayer?.id === layerId) {
            layers.push(state.previewLayer)
        }
        return layers
    },

    /**
     * Retrieves active layer by index
     *
     * @param {number} index Index of the layer to retrieve
     * @returns {AbstractLayer | null} Active layer or null if the index is invalid
     */
    getActiveLayerByIndex: (state) => (index) => {
        if (index < 0 || index == null) {
            throw new Error(`Failed to get ActiveLayer by index: invalid index ${index}`)
        }
        return state.activeLayers.at(index) ?? null
    },

    /**
     * Get visiblelayers with time config. (Preview and system layer are filtered)
     *
     * @returns {GeoAdminLayer[]} List of layers with time config
     */
    visibleLayersWithTimeConfig: (state) =>
        // Here we cannot take the getter visibleLayers as it also contain the preview and system layers
        state.activeLayers.filter((layer) => layer.visible && layer.hasMultipleTimestamps),

    /**
     * Returns true if the layer comes from a third party (external layer or KML layer).
     *
     * KML layer are treated as external when they are generated by another user (no adminId).
     *
     * @param {string} layerId Layer ID of the layer to check for data disclaimer
     * @returns {Boolean}
     */
    hasDataDisclaimer: (state) => (layerId) => {
        const layer = state.activeLayers.find((layer) => layer.id === layerId)
        return layer?.isExternal || (layer?.type === LayerTypes.KML && !layer?.adminId)
    },
}

const actions = {
    /**
     * Will set the background to the given layer (or layer ID), but only if this layer's
     * configuration states that this layer can be a background layer (isBackground flag)
     *
     * @param {String | AbstractLayer} bgLayer Either the background layer id or an AbstractLayer
     *   object
     * @param {string} dispatcher Action dispatcher name
     */
    setBackground({ commit, getters }, { bgLayer, dispatcher }) {
        const layerIdOrObject = bgLayer
        let futureBackground
        if (typeof layerIdOrObject === 'string') {
            futureBackground = getters.getLayerConfigById(layerIdOrObject)
        } else if (layerIdOrObject instanceof AbstractLayer) {
            futureBackground = getters.getLayerConfigById(layerIdOrObject.id)
        }
        if (futureBackground?.isBackground) {
            commit('setBackground', { bgLayer: futureBackground, dispatcher })
        } else {
            commit('setBackground', { bgLayer: null, dispatcher })
        }
    },

    /**
     * Sets the configuration of all available layers for this application
     *
     * Will add layers back, if some were already added before the config was changed
     *
     * @param {AbstractLayer[]} config
     * @param {string} dispatcher Action dispatcher name
     */
    setLayerConfig({ commit, state, getters }, { config, dispatcher }) {
        const activeLayerBeforeConfigChange = [...state.activeLayers]
        commit('setLayerConfig', { config, dispatcher })
        const layers = activeLayerBeforeConfigChange.map((layer) => {
            const layerConfig = getters.getLayerConfigById(layer.id)
            if (layerConfig) {
                // If we found a layer config we use as it might have changed the i18n translation
                const clone = layerConfig.clone()
                clone.visible = layer.visible
                clone.opacity = layer.opacity
                if (layer.timeConfig) {
                    clone.timeConfig.updateCurrentTimeEntry(
                        clone.timeConfig.getTimeEntryForYear(layer.timeConfig.currentYear)
                    )
                }
                return clone
            } else {
                // if no config is found, then it is a layer that is not managed, like for example
                // the KML layers, in this case we take the old active configuration as fallback.
                return layer.clone()
            }
        })
        commit('setLayers', { layers: layers, dispatcher })
    },

    /**
     * Add a layer on top of the active layers.
     *
     * It will do so by cloning the config that is given, or the one that matches the layer ID in
     * the layers' config. This is done so that we may add one "layer" multiple time to the active
     * layers list (for instance having a time enabled layer added multiple time with a different
     * timestamp)
     *
     * @param {AbstractLayer} layer
     * @param {String} layerId
     * @param {ActiveLayerConfig} layerConfig
     * @param {string} dispatcher Action dispatcher name
     */
    addLayer(
        { commit, getters },
        { layer = null, layerId = null, layerConfig = null, dispatcher }
    ) {
        // creating a clone of the config, so that we do not modify the initial config of the app
        // (it is possible to add one layer many times, so we want to always have the correct
        // default values when we add it, not the settings from the layer already added)
        let clone = null
        if (layer) {
            clone = layer.clone()
        } else if (layerConfig) {
            // Get the AbstractLayer Config object, we need to clone it in order
            clone = cloneActiveLayerConfig(getters, layerConfig)
        } else if (layerId) {
            clone = getters.getLayerConfigById(layerId)?.clone() ?? null
        }
        if (clone) {
            commit('addLayer', { layer: clone, dispatcher })
        } else {
            log.error('no layer found for payload:', layer, layerId, layerConfig, dispatcher)
        }
    },

    /**
     * Sets the list of active layers. This replace the existing list.
     *
     * NOTE: the layers array is automatically deep cloned
     *
     * @param {[AbstractLayer | ActiveLayerConfig | String]} layers List of active layers
     * @param {string} dispatcher Action dispatcher name
     */
    setLayers({ commit, getters }, { layers, dispatcher }) {
        const clones = layers
            .map((layer) => {
                let clone = null
                if (layer instanceof AbstractLayer) {
                    clone = layer.clone()
                } else if (layer instanceof Object) {
                    clone = cloneActiveLayerConfig(getters, layer)
                } else if (layer instanceof String || typeof layer === 'string') {
                    // should be string
                    clone = getters.getLayerConfigById(layer)?.clone() ?? null
                }
                return clone
            })
            .filter((layer) => layer != null)
        commit('setLayers', { layers: clones, dispatcher })
    },

    /**
     * Remove a layer by ID or by index.
     *
     * @param {string} layerId Layer ID to removed. NOTE: this removes all layer with the matching
     *   ID!
     * @param {number} index Index of the layer to remove
     * @param {string} dispatcher Action dispatcher name
     */
    removeLayer({ commit }, { index = null, layerId = null, dispatcher }) {
        if (layerId) {
            commit('removeLayersById', { layerId, dispatcher })
        } else if (index != null) {
            commit('removeLayerByIndex', { index, dispatcher })
        } else {
            log.error(
                `Failed to remove layer: invalid parameter: ${index}, ${layerId}, ${dispatcher}`
            )
        }
    },

    /**
     * Full or partial update of a layer at index in the active layer list
     *
     * @param {number} index Index of the layer to update
     * @param {AbstractLayer | { any: any }} layer Full layer object (AbstractLayer) to update or an
     *   object with the properties to update (partial update)
     * @param {string} dispatcher Action dispatcher name
     */
    updateLayer({ commit, getters }, { index, layer, dispatcher }) {
        if (layer instanceof AbstractLayer) {
            commit('updateLayer', { index, layer, dispatcher })
        } else {
            // Partial update of a layer
            const layer2Update = getters.getActiveLayerByIndex(index)
            if (!layer2Update) {
                throw new Error(`Failed to updateLayer: invalid layer index ${index}`)
            }
            if (layer.id && layer.id !== layer2Update.id) {
                throw new Error(
                    `Failed to updateLayer "${layer2Update.id}" at index ${index}: not allowed to update layer ID to "${layer.id}"`
                )
            }

            const updatedLayer = layer2Update.clone()
            Object.entries(layer).forEach((entry) => (updatedLayer[entry[0]] = entry[1]))

            commit('updateLayer', { index, layer: updatedLayer, dispatcher })
        }
    },

    /**
     * Full or partial update of layers in the active layer list. The update is done by IDs and
     * updates all layer matching the IDs
     *
     * @param {[AbstractLayer | { id: String; any: any }]} layers List of full layer object
     *   (AbstractLayer) to update or an object with the layer ID to update and any property to
     *   update (partial update)
     * @param {string} dispatcher Action dispatcher name
     */
    updateLayers({ commit, getters }, { layers, dispatcher }) {
        const updatedLayers = layers
            .map((layer) => {
                if (layer instanceof AbstractLayer) {
                    return layer
                } else {
                    const layers2Update = getters.getActiveLayersById(layer.id)
                    if (!layers2Update) {
                        throw new Error(
                            `Failed to updateLayers: "${layer.id}" not found in active layers`
                        )
                    }
                    return layers2Update.map((layer2Update) => {
                        const updatedLayer = layer2Update.clone()
                        Object.entries(layer).forEach(
                            (entry) => (updatedLayer[entry[0]] = entry[1])
                        )
                        return updatedLayer
                    })
                }
            })
            .flat()
        commit('updateLayers', { layers: updatedLayers, dispatcher })
    },

    /**
     * Clear all active layers
     *
     * @param {string} dispatcher Action dispatcher name
     */
    clearLayers({ commit }, args) {
        commit('clearLayers', args)
    },

    /**
     * Toggle the layer visibility
     *
     * @param {number} index Index of the layer to toggle
     * @param {string} dispatcher Action dispatcher name
     */
    toggleLayerVisibility({ commit }, { index, dispatcher }) {
        commit('toggleLayerVisibility', { index, dispatcher })
    },

    /**
     * Set layer visibility flag
     *
     * @param {number} index Index of the layer to set
     * @param {Boolean} visible Visible flag value
     * @param {string} dispatcher Action dispatcher name
     */
    setLayerVisibility({ commit }, payload) {
        commit('setLayerVisibility', payload)
    },

    /**
     * Set layer opacity
     *
     * @param {number} index Index of the layer to set
     * @param {number} opacity Opacity value to set
     * @param {string} dispatcher Action dispatcher name
     */
    setLayerOpacity({ commit }, payload) {
        commit('setLayerOpacity', payload)
    },

    /**
     * Set layer current year
     *
     * @param {number} index Index of the layer to set
     * @param {number} year Year to set as current
     * @param {string} dispatcher Action dispatcher name
     */
    setTimedLayerCurrentYear({ commit, getters }, { index, year, dispatcher }) {
        const layer = getters.getActiveLayerByIndex(index)
        if (!layer) {
            throw new Error(`Failed to setTimedLayerCurrentYear: invalid index ${index}`)
        }
        // checking that the year exists in this timeConfig
        if (!layer.timeConfig) {
            throw new Error(
                `Failed to setTimedLayerCurrentYear: layer at index ${index} is not a timed layer`
            )
        }
        if (!layer.timeConfig.getTimeEntryForYear(year)) {
            throw new Error(
                `Failed to setTimedLayerCurrentYear: year ${year} is not valid for layer at index ${index}`
            )
        }
        commit('setLayerYear', {
            layer,
            year: year,
            dispatcher,
        })
    },

    /**
     * Move an active layer to the given index
     *
     * @param {number} index Index of the layer to move front
     * @param {number} newIndex Index to move the layer to
     * @param {string} dispatcher Action dispatcher name
     */
    moveActiveLayerToIndex({ commit, getters }, { index, newIndex, dispatcher }) {
        const activeLayer = getters.getActiveLayerByIndex(index)
        if (!activeLayer) {
            throw new Error(`Failed to moveActiveLayerToIndex: invalid index ${index}`)
        }
        // checking if the layer can be put one step front
        if (newIndex < state.activeLayers.length && newIndex >= 0) {
            commit('moveActiveLayerToIndex', {
                index,
                newIndex,
                dispatcher,
            })
        } else {
            throw new Error(`Failed to moveActiveLayerToIndex: invalid new index ${newIndex}`)
        }
    },

    /**
     * Set the preview layer
     *
     * @param {AbstractLayer | String | null} layer Layer to set as preview or layer id to set as
     *   preview or null to clear the preview layer
     * @param {string} dispatcher Action dispatcher name
     */
    setPreviewLayer({ commit, getters }, { layer, dispatcher }) {
        if (layer === null) {
            commit('setPreviewLayer', { layer: null, dispatcher })
        } else {
            let clone = null
            if (layer instanceof AbstractLayer) {
                clone = layer.clone()
            } else {
                clone = getters.getLayerConfigById(layer)?.clone()
                if (!clone) {
                    throw new Error(`Failed to setPreviewLayer: layer ${layer} not found in config`)
                }
            }
            clone.visible = true
            commit('setPreviewLayer', { layer: clone, dispatcher })
        }
    },

    /**
     * Clear the preview layer
     *
     * @param {string} dispatcher Action dispatcher name
     */
    clearPreviewLayer({ commit }, { dispatcher }) {
        commit('setPreviewLayer', { layer: null, dispatcher })
    },

    /**
     * Set preview year to all visible layers with time config
     *
     * @param {number} year Year to set
     * @param {string} dispatcher Action dispatcher name
     */
    setPreviewYear({ commit }, { year, dispatcher }) {
        if (isNaN(year)) {
            log.error('Invalid year value given in setPreviewYear, ignoring', year)
        } else {
            commit('setPreviewYear', { year, dispatcher })
        }
    },

    /**
     * Clear preview year
     *
     * @param {string} dispatcher Action dispatcher name
     */
    clearPreviewYear({ commit }, { dispatcher }) {
        commit('setPreviewYear', { year: null, dispatcher })
    },

    /**
     * Add a layer error translation key.
     *
     * NOTE: This set the error key to all layers matching the ID.
     *
     * @param {string} layerId Layer ID of the layer to set the error
     * @param {string} errorKey Error translation key to add
     * @param {string} dispatcher Action dispatcher name
     */
    addLayerErrorKey({ commit, getters }, { layerId, errorKey, dispatcher }) {
        const layers = getters.getLayersById(layerId)
        if (layers.length === 0) {
            throw new Error(
                `Failed to add layer error key "${layerId}", layer not found in active layers`
            )
        }
        const updatedLayers = layers.map((layer) => {
            const clone = layer.clone()
            clone.addErrorKey(errorKey)
            if (clone.isLoading) {
                clone.isLoading = false
            }
            return clone
        })
        commit('updateLayers', { layers: updatedLayers, dispatcher })
    },

    /**
     * Remove a layer error translation key.
     *
     * NOTE: This set the error key to all layers matching the ID.
     *
     * @param {string} layerId Layer ID of the layer to set the error
     * @param {string} errorKey Error translation key to remove
     * @param {string} dispatcher Action dispatcher name
     */
    removeLayerErrorKey({ commit, getters }, { layerId, errorKey, dispatcher }) {
        const layers = getters.getLayersById(layerId)
        if (layers.length === 0) {
            throw new Error(
                `Failed to remove layer error key "${layerId}", layer not found in active layers`
            )
        }
        const updatedLayers = layers.map((layer) => {
            const clone = layer.clone()
            clone.removeErrorKey(errorKey)
            return clone
        })
        commit('updateLayers', { layers: updatedLayers, dispatcher })
    },

    /**
     * Remove all layer error translation keys.
     *
     * NOTE: This set the error key to all layers matching the ID.
     *
     * @param {string} layerId Layer ID of the layer to clear the error keys
     * @param {string} dispatcher Action dispatcher name
     */
    clearLayerErrorKeys({ commit, getters }, { layerId, dispatcher }) {
        const layers = getters.getLayerById(layerId)
        if (layers.length === 0) {
            throw new Error(
                `Failed to clear layer error keys "${layerId}", layer not found in active layers`
            )
        }
        const updatedLayers = layers.map((layer) => {
            const clone = layer.clone()
            clone.clearErrorKeys()
            return clone
        })
        commit('updateLayers', { layers: updatedLayers, dispatcher })
    },

    /**
     * Set KML/GPX layer(s) with its data and metadata.
     *
     * NOTE: all matching layer id will be set.
     *
     * @param {string} layerId Layer ID of KML to update
     * @param {string} data Data KML data to set
     * @param {object | null} metadata KML metadata to set (only for geoadmin KMLs)
     * @param {string} dispatcher Action dispatcher name
     */
    setKmlGpxLayerData({ commit, getters, rootState }, { layerId, data, metadata, dispatcher }) {
        const layers = getters.getActiveLayersById(layerId)
        if (!layers) {
            throw new Error(
                `Failed to update GPX/KML layer data/metadata "${layerId}", ` +
                    `layer not found in active layers`
            )
        }
        const updatedLayers = layers.map((layer) => {
            const clone = layer.clone()
            if (data) {
                let extent
                if (clone.type === LayerTypes.KML) {
                    clone.name = parseKmlName(data) || 'KML'
                    clone.kmlData = data
                    extent = getKmlExtent(data)
                } else if (clone.type === LayerTypes.GPX) {
                    // The name of the GPX is derived from the metadata below
                    clone.gpxData = data
                    extent = getGpxExtent(data)
                }
                clone.isLoading = false

                if (!extent) {
                    clone.addErrorKey('kml_gpx_file_empty')
                } else if (!getExtentForProjection(rootState.position.projection, extent)) {
                    clone.addErrorKey('kml_gpx_file_out_of_bounds')
                }
            }
            if (metadata) {
                if (clone.type === LayerTypes.KML) {
                    clone.kmlMetadata = metadata
                } else if (clone.type === LayerTypes.GPX) {
                    clone.gpxMetadata = metadata
                    clone.name = metadata.name ?? 'GPX'
                }
            }
            return clone
        })
        commit('updateLayers', { layers: updatedLayers, dispatcher })
    },
    /**
     * Add a system layer
     *
     * NOTE: unlike the activeLayers, systemLayers cannot have duplicate and they are added/remove
     * by ID
     *
     * @param {AbstractLayer} layer
     * @param {String} dispatcher
     */
    addSystemLayer({ commit }, { layer, dispatcher }) {
        commit('addSystemLayer', { layer, dispatcher })
    },
    /**
     * Update a system layer
     *
     * @param {AbstractLayer | Object} layer
     * @param {String} dispatcher
     */
    updateSystemLayer({ commit }, { layer, dispatcher }) {
        commit('updateSystemLayer', { layer, dispatcher })
    },
    /**
     * Remove a system layer
     *
     * NOTE: unlike the activeLayers, systemLayers cannot have duplicate and they are added/remove
     * by ID
     *
     * @param {AbstractLayer} layer
     * @param {String} dispatcher
     */
    removeSystemLayer({ commit }, { layerId, dispatcher }) {
        commit('removeSystemLayer', { layerId, dispatcher })
    },
    /**
     * Set all system layers
     *
     * @param {[AbstractLayer]} layers
     * @param {String} dispatcher
     */
    setSystemLayers({ commit }, { layers, dispatcher }) {
        commit('setSystemLayers', { layers, dispatcher })
    },
}

const mutations = {
    setBackground(state, { bgLayer }) {
        state.currentBackgroundLayer = bgLayer
    },
    setLayerConfig(state, { config }) {
        state.config = config
    },
    addLayer(state, { layer }) {
        state.activeLayers.push(layer)
    },
    setLayers(state, { layers }) {
        state.activeLayers = layers
    },
    updateLayer(state, { index, layer }) {
        const layer2Update = getActiveLayerByIndex(state, index)
        if (!layer2Update) {
            throw new Error(`Failed to update layer at index ${index}: invalid index`)
        }
        if (layer.id && layer.id !== layer2Update.id) {
            throw new Error(
                `Failed to update layer at index ${index}: layer id "${layer2Update.id}" at index ${index} don't match given id "${layer.id}"`
            )
        }
        Object.assign(layer2Update, layer)
    },
    updateLayers(state, { layers }) {
        layers.forEach((layer) => {
            getActiveLayersById(state, layer.id).forEach((layer2Update) => {
                log.debug(`update layer`, layer2Update, layer)
                Object.assign(layer2Update, layer)
            })
        })
    },
    removeLayersById(state, { layerId }) {
        state.activeLayers = state.activeLayers.filter((layer) => layer.id !== layerId)
    },
    removeLayerByIndex(state, { index }) {
        state.activeLayers.splice(index, 1)
    },
    clearLayers(state) {
        state.activeLayers = []
    },
    toggleLayerVisibility(state, { index }) {
        const layer = getActiveLayerByIndex(state, index)
        if (!layer) {
            throw new Error(`Failed to toggleLayerVisibility at index ${index}: invalid index`)
        }
        layer.visible = !layer.visible
    },
    setLayerVisibility(state, { index, visible }) {
        const layer = getActiveLayerByIndex(state, index)
        if (!layer) {
            throw new Error(`Failed to setLayerVisibility at index ${index}: invalid index`)
        }
        if (layer) {
            layer.visible = visible
        }
    },
    setLayerOpacity(state, { index, opacity }) {
        const layer = getActiveLayerByIndex(state, index)
        if (!layer) {
            throw new Error(`Failed to setLayerOpacity at index ${index}: invalid index`)
        }
        layer.opacity = Number(opacity)
    },
    setLayerYear(state, { layer, year }) {
        layer.timeConfig.updateCurrentTimeEntry(layer.timeConfig.getTimeEntryForYear(year))
    },
    moveActiveLayerToIndex(state, { index, newIndex }) {
        const removed = state.activeLayers.splice(index, 1)
        state.activeLayers.splice(newIndex, 0, removed[0])
    },
    setPreviewLayer(state, { layer }) {
        state.previewLayer = layer
    },
    setPreviewYear(state, { year }) {
        state.previewYear = year
    },
    addSystemLayer(state, { layer }) {
        if (state.systemLayers.find((l) => l.id === layer.id)) {
            throw new Error(`Cannot add system layer ${layer.id}: duplicate`)
        }
        state.systemLayers.push(layer)
    },
    updateSystemLayer(state, { layer }) {
        const layer2Update = state.systemLayers.find((l) => l.id === layer.id)
        if (!layer2Update) {
            throw new Error(`Cannot update system layer ${layer.id}: layer not found`)
        }
        if (layer instanceof AbstractLayer) {
            Object.assign(layer2Update, layer)
        } else {
            Object.entries(layer).forEach((entry) => (layer2Update[entry[0]] = entry[1]))
        }
    },
    removeSystemLayer(state, { layerId }) {
        const index = state.systemLayers.findIndex((l) => l.id === layerId)
        if (index < 0) {
            log.warn(`Cannot remove layer ${layerId}: layer not found`)
        } else {
            state.systemLayers.splice(index, 1)
        }
    },
    setSystemLayers(state, { layers }) {
        state.systemLayers = layers
    },
}

export default {
    state,
    getters,
    actions,
    mutations,
}
