export default {
    state: {
        overlay: {
            show: false,
            callbacksOnClose: []
        },
        highlightedFeature: null,
        isBeingDragged: false,
        clickInfo: {
            coordinate: [],
            millisecondsSpentMouseDown: -1
        },
    },
    getters: {},
    actions: {
        toggleMapOverlay: ({commit}, callbackOnClick) => commit("toggleMapOverlay", callbackOnClick),
        clearOverlayCallbacks: ({commit}) => commit('clearOverlayCallbacks'),
        highlightLayer: ({commit}, layerId) => commit('setHighlightedFeature', {type: 'layer', layerId}),
        highlightLocation: ({commit}, {id, coordinate, name}) => commit('setHighlightedFeature', { type: 'location', id, coordinate, name }),
        removeHighlight: ({commit}) => commit('setHighlightedFeature', null),
        mapStartBeingDragged: ({commit}) => commit('mapStartBeingDragged'),
        mapStoppedBeingDragged: ({commit}) => commit('mapStoppedBeingDragged'),
        click: ({commit}, {coordinate = [], millisecondsSpentMouseDown = -1}) => commit('setClickInfo', { coordinate, millisecondsSpentMouseDown }),
    },
    mutations: {
        toggleMapOverlay: (state, callbackOnClose) => {
            state.overlay.show = !state.overlay.show;
            if (state.overlay.show && callbackOnClose) {
                state.overlay.callbacksOnClose.push(callbackOnClose);
            } else if (!state.overlay.show && state.overlay.callbacksOnClose.length > 0) {
                state.overlay.callbacksOnClose.forEach(callback => {
                    callback();
                });
                state.overlay.callbacksOnClose = [];
            }
        },
        clearOverlayCallbacks: (state) => state.overlay.callbacksOnClose = [],
        setHighlightedFeature: (state, feature) => state.highlightedFeature = feature,
        mapStartBeingDragged: (state) => state.isBeingDragged = true,
        mapStoppedBeingDragged: (state) => state.isBeingDragged = false,
        setClickInfo: (state, clickInfo) => state.clickInfo = clickInfo,
    }
};
