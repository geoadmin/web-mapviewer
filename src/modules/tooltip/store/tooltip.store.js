/**
 * Module that will store information about position of the tooltip on the screen
 */
export default {
  state: {
    anchor: [],
  },
  getters: {},
  actions: {
    setTooltipAnchor: ({ commit }, pixelCoordinates) => {
      if (Array.isArray(pixelCoordinates) && pixelCoordinates.length === 2) {
        commit('setTooltipAnchor', pixelCoordinates)
      }
    },
  },
  mutations: {
    setTooltipAnchor: (state, pixelCoordinate) => (state.anchor = [...pixelCoordinate]),
  },
}
