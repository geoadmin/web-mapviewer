/** Vuex module that contains debug tools things */
export default {
    state: {
        showTileDebugInfo: false,
        showLayerExtents: false,
    },
    getters: {},
    actions: {
        toggleShowTileDebugInfo({ commit, state }) {
            commit('setShowTileDebugInfo', !state.showTileDebugInfo)
        },
        toggleShowLayerExtents({ commit, state }) {
            commit('setShowLayerExtents', !state.showLayerExtents)
        },
    },
    mutations: {
        setShowTileDebugInfo: (state, flagValue) => (state.showTileDebugInfo = flagValue),
        setShowLayerExtents: (state, flagValue) => (state.showLayerExtents = flagValue),
    },
}
