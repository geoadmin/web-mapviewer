/** Vuex module that tells if the app has finished loading (is ready to show stuff) */
export default {
    state: {
        /**
         * Flag telling that the initial required application configuration has been loaded from
         * backend (layers config and topics)
         *
         * @type Boolean
         */
        isConfigReady: false,

        initialQueryParsed: false,

        /**
         * Flag that tells if the app is ready to show data and the map
         *
         * @type Boolean
         */
        isReady: false,

        /**
         * Flag telling that the Map Module is ready. This is usefull for E2E testing which should
         * not start before the Map Module is ready.
         */
        isMapReady: false,
    },
    getters: {},
    actions: {
        setConfigIsReady: ({ commit }, { dispatcher }) => {
            commit('setConfigIsReady', { dispatcher })
        },
        setAppIsReady: ({ commit }, { dispatcher }) => {
            commit('setAppIsReady', { dispatcher })
        },
        mapModuleReady: ({ commit }, { dispatcher }) => {
            commit('mapModuleReady', { dispatcher })
        },
        setInitialQueryParsed: ({ commit }, { dispatcher }) => {
            commit('setInitialQueryParsed', { dispatcher })
        },
    },
    mutations: {
        setConfigIsReady: (state) => (state.isConfigReady = true),
        setAppIsReady: (state) => (state.isReady = true),
        mapModuleReady: (state) => (state.isMapReady = true),
        setInitialQueryParsed: (state) => (state.initialQueryParsed = true),
    },
}
