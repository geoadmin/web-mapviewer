/**
 * The name of the mutation for base URL override changes
 *
 * @type {String}
 */
export const SET_HAS_URL_OVERRIDES_MUTATION_KEY = 'setHasBaseUrlOverrides'

const mutations = {
    setShowTileDebugInfo: (state, { showTileDebugInfo }) =>
        (state.showTileDebugInfo = showTileDebugInfo),
    setShowLayerExtents: (state, { showLayerExtents }) =>
        (state.showLayerExtents = showLayerExtents),
    setShowMapLibre: (state, { showMapLibre }) => (state.showMapLibre = showMapLibre),
}
mutations[SET_HAS_URL_OVERRIDES_MUTATION_KEY] = (state, { hasOverrides }) =>
    (state.hasBaseUrlOverride = hasOverrides)

/** Vuex module that contains debug tools things */
export default {
    state: {
        showTileDebugInfo: false,
        showLayerExtents: false,
        hasBaseUrlOverride: false,
        showMapLibre: true,
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
            commit(SET_HAS_URL_OVERRIDES_MUTATION_KEY, {
                hasOverrides: !!hasOverrides,
                dispatcher,
            })
        },
        toggleShowMapLibre({ commit, state }, { dispatcher }) {
            commit('setShowMapLibre', { showMapLibre: !state.showMapLibre, dispatcher })
        },
    },
    mutations,
}
