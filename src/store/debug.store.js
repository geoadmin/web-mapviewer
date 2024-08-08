import log from '@/utils/logging.js'

function commitIfValidOverrideUrl(commit, url, mutationName, dispatcher) {
    if (url === null) {
        commit(mutationName, { baseUrl: url, dispatcher })
    } else {
        try {
            new URL(url)
            commit(mutationName, { baseUrl: url, dispatcher })
        } catch (error) {
            log.error('Invalid override URL', url, `${mutationName} wasn't called`)
        }
    }
}

/** Vuex module that contains debug tools things */
export default {
    state: {
        showTileDebugInfo: false,
        showLayerExtents: false,
        baseUrlOverride: {
            wms: null,
            wmts: null,
            api3: null,
        },
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
        setWmsBaseUrlOverride({ commit }, { baseUrl, dispatcher }) {
            commitIfValidOverrideUrl(commit, baseUrl, 'setWmsBaseUrlOverride', dispatcher)
        },
        setWmtsBaseUrlOverride({ commit }, { baseUrl, dispatcher }) {
            commitIfValidOverrideUrl(commit, baseUrl, 'setWmtsBaseUrlOverride', dispatcher)
        },
        setApi3BaseUrlOverride({ commit }, { baseUrl, dispatcher }) {
            commitIfValidOverrideUrl(commit, baseUrl, 'setApi3BaseUrlOverride', dispatcher)
        },
    },
    mutations: {
        setShowTileDebugInfo: (state, { showTileDebugInfo }) =>
            (state.showTileDebugInfo = showTileDebugInfo),
        setShowLayerExtents: (state, { showLayerExtents }) =>
            (state.showLayerExtents = showLayerExtents),
        setWmsBaseUrlOverride: (state, { baseUrl }) => (state.baseUrlOverride.wms = baseUrl),
        setWmtsBaseUrlOverride: (state, { baseUrl }) => (state.baseUrlOverride.wmts = baseUrl),
        setApi3BaseUrlOverride: (state, { baseUrl }) => (state.baseUrlOverride.api3 = baseUrl),
    },
}
