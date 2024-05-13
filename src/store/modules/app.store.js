/** Vuex module that tells if the app has finished loading (is ready to show stuff) */
export default {
    state: {
        /**
         * Flag that tells if the app is ready to show data and the map
         *
         * @type Boolean
         */
        isReady: false,

        /**
         * Flag telling that the Map Module is ready. This is useful for E2E testing which should
         * not start before the Map Module is ready.
         */
        isMapReady: false,

        /**
         * Flag telling if we went through the legacy router. This is useful to force a router
         * 'next' call in the case we went through the legacy parser and there is no default
         * parameters.
         */
        needReloadBecauseOfLegacy: false,
    },
    getters: {},
    actions: {
        setAppIsReady: ({ commit }, { dispatcher }) => {
            commit('setAppIsReady', { dispatcher })
        },
        mapModuleReady: ({ commit }, { dispatcher }) => {
            commit('mapModuleReady', { dispatcher })
        },
        setNeedReloadBecauseOfLegacy: ({ commit }, { value, dispatcher }) => {
            commit('setNeedReloadBecauseOfLegacy', { value, dispatcher })
        },
    },
    mutations: {
        setAppIsReady: (state) => (state.isReady = true),
        mapModuleReady: (state) => (state.isMapReady = true),
        setNeedReloadBecauseOfLegacy: (state, { value }) =>
            (state.needReloadBecauseOfLegacy = value),
    },
}
