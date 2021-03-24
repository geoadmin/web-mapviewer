import log from '@/utils/logging'

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
     * @type Array<WMSLayer|WMTSLayer|GeoJsonLayer|AggregateLayer>
     */
    activeLayers: [],
    /**
     * All layers' config available to this app
     *
     * @type Array<WMSLayer|WMTSLayer|GeoJsonLayer|AggregateLayer>
     */
    config: [],
}

const getters = {
    /**
     * Filter all the active layers and gives only those who have the flag `visible` to `true`
     *
     * @param state
     * @returns {(WMSLayer | WMTSLayer | GeoJsonLayer | AggregateLayer)[]} All layers that are
     *   currently visible on the map
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
     * @returns {WMSLayer | WMTSLayer | GeoJsonLayer | AggregateLayer}
     */
    currentBackgroundLayer: (state, getters) => {
        if (!state.backgroundLayerId) {
            return undefined
        } else {
            return getters.getLayerForId(state.backgroundLayerId)
        }
    },
    /**
     * Retrieves a layer metadata defined by its unique ID
     *
     * @param state
     * @returns {WMSLayer | WMTSLayer | GeoJsonLayer | AggregateLayer}
     */
    getLayerForId: (state) => (layerId) => state.config.find((layer) => layer.id === layerId),
    jointVisibleLayerIds: (state, getters) => {
        const visibleLayerIds = getters.visibleLayers.map((layer) => layer.id)
        if (visibleLayerIds.length > 0) {
            return visibleLayerIds.reduce((accumulator, layerId) => `${accumulator},${layerId}`)
        }
        return ''
    },
}

const actions = {
    toggleLayerVisibility: ({ commit }, layerId) => commit('toggleLayerVisibility', layerId),
    addLayer: ({ commit }, layerId) => commit('addLayer', layerId),
    addLocation: ({ commit }, coordsEPSG3857) => commit('addLocation', coordsEPSG3857),
    removeLayer: ({ commit }, layerId) => commit('removeLayer', layerId),
    clearLayers: ({ commit }) => commit('clearLayers'),
    setLayerConfig: ({ commit, dispatch, state }, config) => {
        const activedLayerBeforeConfigChange = state.activeLayers.map((layer) => layer)
        commit('clearLayers')
        commit('setLayerConfig', config)
        activedLayerBeforeConfigChange.forEach((layer) => {
            commit('addLayer', layer.id)
            if (!layer.visible) {
                commit('toggleLayerVisibility', layer.id)
            }
            if (layer.opacity) {
                dispatch('setLayerOpacity', {
                    layerId: layer.id,
                    opacity: layer.opacity,
                })
            }
        })
    },
    setBackground: ({ commit }, bgLayerId) => commit('setBackground', bgLayerId),
    setVisibleLayersByIds: ({ commit, getters }, ids) => {
        if (typeof ids === 'string' || ids instanceof String) {
            const layerIds = ids.split(',')
            // first we deactivate any visible layer that is not in the last (anymore)
            getters.visibleLayers.forEach((visibleLayer) => {
                if (!(visibleLayer.id in layerIds)) {
                    commit('toggleLayerVisibility', visibleLayer.id)
                }
            })
            // we then go trough all IDs that will be visible, and toggle layers that are active but not visible or add them altogether if they are not active yet
            layerIds.forEach((layerId) => {
                commit('addLayer', layerId)
            })
        }
    },
    setLayerOpacity: ({ commit }, payload) => {
        if ('opacity' in payload && 'layerId' in payload) {
            const layer = state.activeLayers.find((layer) => layer.id === payload.layerId)
            if (layer) {
                commit('setLayerOpacity', {
                    layer,
                    opacity: Number(payload.opacity),
                })
            }
        }
    },
    moveActiveLayerBack: ({ commit }, layerId) => {
        const activeLayer = state.activeLayers.find((layer) => layer.id === layerId)
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
        const activeLayer = state.activeLayers.find((layer) => layer.id === layerId)
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
        const layer = state.activeLayers.find((layer) => layer.id === layerId)
        if (layer) {
            layer.visible = !layer.visible
        }
    },
    addLayer: (state, layerId) => {
        const activeLayer = state.activeLayers.find((layer) => layer.id === layerId)
        // if the layer is already active, we only make sure it is visible again
        if (activeLayer) {
            activeLayer.visible = true
        } else {
            // otherwise we load the config for this layer into the active layers
            const layer = state.config.find((layer) => layer.id === layerId)
            if (layer) {
                // cloning layer config so that we keep the one we received from the backend pristine
                const layerClone = layer.clone()
                layerClone.visible = true
                state.activeLayers.push(layerClone)
            } else {
                log('error', 'no layer found with id', layerId)
            }
        }
    },
    addLocation: (state, { x, y }) => (state.pinLocation = { x, y }),
    clearLayers: (state) => (state.activeLayers = []),
    removeLayer: (state, layerId) =>
        (state.activeLayers = state.activeLayers.filter((layer) => layer.id !== layerId)),
    setLayerConfig: (state, config) => (state.config = config),
    setBackground: (state, bgLayerId) => (state.backgroundLayerId = bgLayerId),
    setLayerOpacity: (state, { layer, opacity }) => (layer.opacity = opacity),
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
