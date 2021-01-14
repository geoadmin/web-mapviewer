export default {
  state: {
    highlightedFeature: null,
    isBeingDragged: false,
    clickInfo: {
      coordinate: [],
      millisecondsSpentMouseDown: -1,
    },
    pinnedLocation: null,
  },
  getters: {},
  actions: {
    highlightLayer: ({ commit }, layerId) =>
      commit('setHighlightedFeature', { type: 'layer', layerId }),
    highlightLocation: ({ commit }, { id, coordinate, name }) =>
      commit('setHighlightedFeature', { type: 'location', id, coordinate, name }),
    removeHighlight: ({ commit }) => commit('setHighlightedFeature', null),
    click: ({ commit }, { coordinate = [], millisecondsSpentMouseDown = -1 }) =>
      commit('setClickInfo', { coordinate, millisecondsSpentMouseDown }),
    mapStartBeingDragged: ({ commit }) => commit('mapStartBeingDragged'),
    mapStoppedBeingDragged: ({ commit }) => commit('mapStoppedBeingDragged'),
    setPinnedLocation: ({ commit }, coordinates) => {
      if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
        commit('setPinnedLocation', coordinates)
      } else {
        commit('setPinnedLocation', null)
      }
    },
  },
  mutations: {
    setHighlightedFeature: (state, feature) => (state.highlightedFeature = feature),
    setClickInfo: (state, clickInfo) => (state.clickInfo = clickInfo),
    mapStartBeingDragged: (state) => (state.isBeingDragged = true),
    mapStoppedBeingDragged: (state) => (state.isBeingDragged = false),
    setPinnedLocation: (state, coordinates) => (state.pinnedLocation = coordinates),
  },
}
