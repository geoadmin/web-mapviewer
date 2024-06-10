/** Vuex module that contains debug tools things */
export default {
    state: {
        showTileDebugInfo: false,
        showLayerExtents: false,
        showMapLibre: false,
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
        toggleShowMapLibre({ commit, state }, { dispatcher }) {
            commit('setShowMapLibre', { showMapLibre: !state.showMapLibre, dispatcher })
        },
    },
    mutations: {
        setShowTileDebugInfo: (state, { showTileDebugInfo }) =>
            (state.showTileDebugInfo = showTileDebugInfo),
        setShowLayerExtents: (state, { showLayerExtents }) =>
            (state.showLayerExtents = showLayerExtents),
        setShowMapLibre: (state, { showMapLibre }) => (state.showMapLibre = showMapLibre),
    },
}
