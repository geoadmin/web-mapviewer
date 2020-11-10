const state = {
    backgroundLayerId: 'ch.swisstopo.pixelkarte-farbe',
    activeLayers: [],
    config: {},
    pinLocation: null
};

const getters = {
    visibleLayers: state => state.activeLayers.filter(layer => layer.visible && !layer.fetching),
    backgroundLayers: state => state.config.filter(layer => layer.isBackground && !layer.isSpecificFor3D),
    currentBackgroundLayer: (state, getters) => {
        if (!state.backgroundLayerId) {
            return undefined;
        } else {
            return getters.getLayerForId(state.backgroundLayerId);
        }
    },
    getLayerForId: state => layerId => {
        return state.config.find(layer => layer.id === layerId);
    }
};

const actions = {
    toggleLayerVisibility: ({ commit }, layerId) => commit("toggleLayerVisibility", layerId),
    addLayer: ({commit}, layerId) => commit('addLayer', layerId),
    addLocation: ({commit}, coordsEPSG3857) => commit('addLocation', coordsEPSG3857),
    removeLayer: ({commit}, layerId) => commit('removeLayer', layerId),
    setLayerConfig: ({commit}, config) => commit('setLayerConfig', config),
    setBackground: ({commit}, bgLayerId) => commit('setBackground', bgLayerId),
};

const mutations = {
    toggleLayerVisibility: function (state, layerId) {
        const layer = state.activeLayers.find(layer => layer.id === layerId);
        if (layer) {
            layer.visible = !layer.visible;
        }
    },
    addLayer: (state, layerId) => {
        // if the layer is already active, we skip the adding
        if (state.activeLayers.find(layer => layer.id === layerId)) return;
        // otherwise we load the config for this layer into the active layers
        const layer = state.config.find(layer => layer.id === layerId);
        if (layer) {
            layer.visible = true;
            state.activeLayers.push(layer);
        } else {
            console.error('no layer found with id', layerId)
        }
    },
    addLocation: (state, {x, y}) => state.pinLocation = { x, y },
    removeLayer: (state, layerId) => state.activeLayers = state.activeLayers.filter(layer => layer.id !== layerId),
    setLayerConfig: (state, config) => state.config = config,
    setBackground: (state, bgLayerId) => state.backgroundLayerId = bgLayerId,
};

export default {
    state,
    getters,
    actions,
    mutations
};
