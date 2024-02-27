/** Vuex module that contains debug tools things */
export default {
    state: {
        showTileDebugInfo: false,
        showLayerExtents: false,
    },
    getters: {},
    actions: {
        toggleShowTileDebugInfo({ commit, state }, { dispatcher }) {
            commit('setShowTileDebugInfo', {
                showTileDebugInfo: !state.showTileDebugInfo,
                dispatcher,
            })
        },
        toggleShowLayerExtents({ commit, state }, { dispatcher }) {
            commit('setShowLayerExtents', { showLayerExtents: !state.showLayerExtents, dispatcher })
        },
    },
    mutations: {
        setShowTileDebugInfo: (state, { showTileDebugInfo }) =>
            (state.showTileDebugInfo = showTileDebugInfo),
        setShowLayerExtents: (state, { showLayerExtents }) =>
            (state.showLayerExtents = showLayerExtents),
    },
}
