import AbstractLayer from '@/api/layers/AbstractLayer.class'
import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { getExtentForProjection } from '@/utils/extentUtils.js'
import { getGpxExtent } from '@/utils/gpxUtils.js'
import { getKmlExtent, parseKmlName } from '@/utils/kmlUtils'
import { ActiveLayerConfig } from '@/utils/layerUtils'
import log from '@/utils/logging'

const getActiveLayerById = (state, layerId) =>
    state.activeLayers.find((layer) => layer.getID() === layerId)
const removeActiveLayerById = (state, layerId) =>
    state.activeLayers.filter((layer) => layer.getID() !== layerId)

const cloneActiveLayerConfig = (getters, layer) => {
    const clone = getters.getLayerConfigById(layer.id)?.clone() ?? null
    if (clone) {
        if (layer.visible != undefined) {
            clone.visible = layer.visible
        }
        if (layer.opacity != undefined) {
            clone.opacity = layer.opacity
        }
        if (layer.customAttributes.year && clone.timeConfig) {
            const timeConfigEntry = clone.timeConfig.getTimeEntryForYear(
                layer.customAttributes.year
            )
            if (timeConfigEntry) {
                clone.timeConfig.updateCurrentTimeEntry(timeConfigEntry)
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
    activeKmlLayer: (state) => {
        return state.activeLayers.find(
            (layer) => layer.type === LayerTypes.KML && !layer.isExternal
        )
    },
    /**
     * All layers in the config that have the flag `background` to `true` (that can be shown as a
     * background layer).
     *
     * @returns Object returned with the same structure as the config, meaning keys of the object
     *   are BG layer IDs and values are BG layer metadata.
     */
    backgroundLayers: (state, _, rootState) =>
        state.config.filter(
            (layer) => layer.isBackground && rootState.cesium.active === layer.isSpecificFor3D
        ),
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
     * Get layers with time config
     *
     * @returns {GeoAdminLayer[]} List of layers with time config
     */
    visibleLayersWithTimeConfig: (state, getters) =>
        getters.visibleLayers.filter((layer) => layer.timeConfig?.timeEntries?.length),

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
    /**
     * Returns the z-index of a visible layer, taking into account the background layer(s) and/or if
     * one of them is a group of layer (and thus all sub-layers are counted in the index)
     *
     * If the layer is not part of the visible layers (or is null or invalid), this will return -1
     * as a result
     *
     * @param {AbstractLayer | String} layerIdOrObject
     * @returns {Number}
     */
    zIndexForVisibleLayer: (state, getters) => (layerIdOrObject) => {
        let lookupId
        if (layerIdOrObject instanceof AbstractLayer) {
            lookupId = layerIdOrObject.getID()
        } else if (typeof layerIdOrObject === 'string') {
            lookupId = layerIdOrObject
        } else {
            log.error("wrong type of layer definition, can't toggle visibility", layerIdOrObject)
            return -1
        }
        const matchingLayer = getters.visibleLayers.find((layer) => layer.getID() === lookupId)
        if (!matchingLayer) {
            return -1
        }
        // we start by counting the background layer
        let bgZIndex = state.currentBackgroundLayer ? 1 : 0
        // we now count layers, checking if there are sub-layers (if the layer is a group of layer)
        return (
            getters.visibleLayers
                // only keeping visible layer below the one that we want the z-index of
                .slice(0, getters.visibleLayers.indexOf(matchingLayer))
                // transforming layers into "z-indexes" by counting layers for groups, or 1 for normal layers
                .map((layer) => {
                    if (layer instanceof ExternalGroupOfLayers) {
                        return layer.layers.length
                    }
                    return 1
                })
                // sum of all "z-index", and setting the initial value to the background's z-index
                .reduce((a, b) => a + b, bgZIndex)
        )
    },
}

const actions = {
    /**
     * Will set the background to the given layer (or layer ID), but only if this layer's
     * configuration states that this layer can be a background layer (isBackground flag)
     *
     * @param {String | AbstractLayer} layerIdOrObject
     */
    setBackground({ commit, getters }, { bgLayer, dispatcher }) {
        const layerIdOrObject = bgLayer
        let futureBackground
        if (typeof layerIdOrObject === 'string') {
            futureBackground = getters.getLayerConfigById(layerIdOrObject)
        } else if (layerIdOrObject instanceof AbstractLayer) {
            futureBackground = getters.getLayerConfigById(layerIdOrObject.getID())
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
     */
    setLayerConfig({ commit, state, getters }, { config, dispatcher }) {
        const activeLayerBeforeConfigChange = [...state.activeLayers]
        commit('setLayerConfig', { config, dispatcher })
        const layers = activeLayerBeforeConfigChange.map((layer) => {
            const layerConfig = getters.getLayerConfigById(layer.getID())
            if (layerConfig) {
                // If we found a layer config we use as it might have changed the i18n translation
                const clone = layerConfig.clone()
                clone.visible = layer.visible
                clone.opacity = layer.opacity
                if (layer.timeConfig) {
                    clone.timeConfig.currentYear = layer.timeConfig.currentYear
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
     * Add a layer to the active layers.
     *
     * It will do so by cloning the config that is given, or the one that matches the layer ID in
     * the layers' config. This is done so that we may add one "layer" multiple time to the active
     * layers list (for instance having a time enabled layer added multiple time with a different
     * timestamp)
     *
     * @param {AbstractLayer} layer
     * @param {String} layerId
     * @param {ActiveLayerConfig} layerConfig
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
     */
    setLayers({ commit, getters }, { layers, dispatcher }) {
        const clones = layers
            .map((layer) => {
                let clone = null
                if (layer instanceof AbstractLayer) {
                    clone = layer.clone()
                } else if (layer instanceof ActiveLayerConfig) {
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
    removeLayer({ commit }, { layer = null, layerId = null, dispatcher }) {
        if (layerId) {
            commit('removeLayerWithId', { layerId, dispatcher })
        } else if (layer) {
            commit('removeLayerWithId', { layerId: layer.getID(), dispatcher })
        } else {
            log.error('Can not remove layer that is not yet added', layer, layerId, dispatcher)
        }
    },
    /**
     * Full or partial update of a layer in the active layer list
     *
     * @param {Object} actionParams Regular action parameters (commit, state, getters, ...)
     * @param {AbstractLayer | { id: String; any: any }} layer Full layer object (AbstractLayer) to
     *   update or an object with the layer ID to update and any property to update (partial
     *   update)
     */
    updateLayer({ commit, getters }, layer) {
        if (layer instanceof AbstractLayer) {
            commit('updateLayer', layer)
        } else if (layer instanceof Object && layer.id) {
            // Partial update of a layer
            const currentLayer = getters.getActiveLayerById(layer.id)
            if (!currentLayer) {
                throw new Error(
                    `Failed to update layer "${layer.id}", layer not found in active layers`
                )
            }
            const updatedLayer = currentLayer.clone()
            Object.entries(layer).forEach((entry) => {
                if (entry[0] !== 'id') {
                    updatedLayer[entry[0]] = entry[1]
                }
            })
            commit('updateLayer', updatedLayer)
        } else {
            throw new Error(`Failed to update layer, invalid type ${typeof layer}`)
        }
    },
    clearLayers({ commit }, args) {
        commit('clearLayers', args)
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
        commit('setLayerOpacity', payload)
    },
    setTimedLayerCurrentYear({ commit, getters }, { layerId, year, dispatcher }) {
        if (layerId && year) {
            const layer = getters.getActiveLayerById(layerId)
            if (layer && layer.timeConfig) {
                // checking that the year exists in this timeConfig
                const timeEntryForYear = layer.timeConfig.getTimeEntryForYear(year)
                if (timeEntryForYear) {
                    commit('setLayerYear', {
                        layerId,
                        year: year,
                        dispatcher,
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
    /**
     * @param {AbstractLayer | String} layerIdOrObject
     * @returns {Number}
     */
    setPreviewLayer({ commit, getters }, layerIdOrObject) {
        let layer = null
        if (layerIdOrObject instanceof AbstractLayer) {
            layer = layerIdOrObject.clone()
        } else {
            layer = getters.getLayerConfigById(layerIdOrObject)
        }
        if (layer) {
            const cloned = layer.clone()
            cloned.visible = true
            commit('setPreviewLayer', cloned)
        } else {
            log.error(`Layer "${layerIdOrObject}" not found in configs.`)
        }
    },
    clearPreviewLayer({ commit }) {
        commit('setPreviewLayer', null)
    },
    setPreviewYear({ commit, getters }, year) {
        const possibleYears = getters.visibleLayersWithTimeConfig.flatMap(
            (layer) => layer.timeConfig.years
        )
        if (possibleYears.includes(year)) {
            commit('setPreviewYear', year)
        } else {
            log.error('year not found in active layers, ignoring', year)
        }
    },
    clearPreviewYear({ commit }) {
        commit('setPreviewYear', null)
    },
    setLayerErrorKey({ commit, getters }, payload) {
        const { layerId, errorKey } = payload
        const currentLayer = getters.getActiveLayerById(layerId)
        if (!currentLayer) {
            throw new Error(
                `Failed to update layer error key "${layerId}", layer not found in active layers`
            )
        }
        const updatedLayer = currentLayer.clone()
        updatedLayer.errorKey = errorKey
        updatedLayer.hasError = !!errorKey
        if (updatedLayer.isLoading) {
            updatedLayer.isLoading = false
        }
        commit('updateLayer', updatedLayer)
    },
    updateKmlGpxLayer({ commit, getters, rootState }, payload) {
        const { layerId, data, metadata } = payload
        const currentLayer = getters.getActiveLayerById(layerId)
        if (!currentLayer) {
            throw new Error(
                `Failed to update GPX/KML layer data/metadata "${layerId}", ` +
                    `layer not found in active layers`
            )
        }
        const updatedLayer = currentLayer.clone()

        if (data) {
            let extent
            if (updatedLayer.type === LayerTypes.KML) {
                updatedLayer.name = parseKmlName(data) || 'KML'
                updatedLayer.kmlData = data
                extent = getKmlExtent(data)
            } else if (updatedLayer.type === LayerTypes.GPX) {
                // The name of the GPX is derived from the metadata below
                updatedLayer.gpxData = data
                extent = getGpxExtent(data)
            }
            updatedLayer.isLoading = false

            if (!extent) {
                updatedLayer.errorKey = 'kml_gpx_file_empty'
                updatedLayer.hasError = true
            } else if (!getExtentForProjection(rootState.position.projection, extent)) {
                updatedLayer.errorKey = 'kml_gpx_file_out_of_bounds'
                updatedLayer.hasError = true
            }
        }
        if (metadata) {
            if (updatedLayer.type === LayerTypes.KML) {
                updatedLayer.kmlMetadata = metadata
            } else if (updatedLayer.type === LayerTypes.GPX) {
                updatedLayer.gpxMetadata = metadata
                updatedLayer.name = metadata.name ?? 'GPX'
            }
        }
        commit('updateLayer', updatedLayer)
    },
}

const mutations = {
    setBackground(state, { bgLayer }) {
        state.currentBackgroundLayer = bgLayer
        // forcing its visibility (if not void layer), as 3D layers have their visible flag set to false somehow
        if (state.currentBackgroundLayer) {
            state.currentBackgroundLayer.visible = true
        }
    },
    setLayerConfig(state, { config }) {
        state.config = config
    },
    addLayer(state, { layer }) {
        // first, remove it if already present to avoid duplicate layers
        state.activeLayers = removeActiveLayerById(state, layer.getID())
        state.activeLayers.push(layer)
    },
    setLayers(state, { layers }) {
        state.activeLayers = layers
    },
    updateLayer(state, layer) {
        const layer2Update = getActiveLayerById(state, layer.getID())
        if (layer2Update) {
            Object.assign(layer2Update, layer)
        } else {
            throw new Error(
                `Failed to update layer ${layer.getID()}: layer not found in active layers`
            )
        }
    },
    removeLayerWithId(state, { layerId }) {
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
            layerMatchingId.opacity = Number(opacity)
        }
    },
    setLayerYear(state, { layerId, year }) {
        const timedLayer = getActiveLayerById(state, layerId)
        timedLayer.timeConfig.updateCurrentTimeEntry(
            timedLayer.timeConfig.getTimeEntryForYear(year)
        )
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
