/** Vuex module that contains debug tools things */
export default {
    state: {
        showTileDebugInfo: false,
        showLayerExtents: false,
        hasBaseUrlOverride: false,
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
        setHasBaseUrlOverrides({ commit }, { hasOverrides, dispatcher }) {
            commit('setShowTileDebugInfo', {
                hasOverrides: !!hasOverrides,
                dispatcher,
            })
        },
    },
    mutations: {
        setShowTileDebugInfo: (state, { showTileDebugInfo }) =>
            (state.showTileDebugInfo = showTileDebugInfo),
        setShowLayerExtents: (state, { showLayerExtents }) =>
            (state.showLayerExtents = showLayerExtents),
        setHasBaseUrlOverrides: (state, { hasOverrides }) =>
            (state.hasBaseUrlOverride = hasOverrides),
    },
}
