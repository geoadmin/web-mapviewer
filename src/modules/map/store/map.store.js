export default {
    state: {
        highlightedFeature: null,
        clickInfo: {
            coordinate: [],
            millisecondsSpentMouseDown: -1
        },
    },
    getters: {},
    actions: {
        highlightLayer: ({commit}, layerId) => commit('setHighlightedFeature', {type: 'layer', layerId}),
        highlightLocation: ({commit}, {id, coordinate, name}) => commit('setHighlightedFeature', { type: 'location', id, coordinate, name }),
        removeHighlight: ({commit}) => commit('setHighlightedFeature', null),
        click: ({commit}, {coordinate = [], millisecondsSpentMouseDown = -1}) => commit('setClickInfo', { coordinate, millisecondsSpentMouseDown }),
    },
    mutations: {
        setHighlightedFeature: (state, feature) => state.highlightedFeature = feature,
        setClickInfo: (state, clickInfo) => state.clickInfo = clickInfo,
    }
};
