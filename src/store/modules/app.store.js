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
         * Flag telling that the Map Module is ready. This is usefull for E2E testing which should
         * not start before the Map Module is ready.
         */
        isMapReady: false,
    },
    getters: {},
    actions: {
        setAppIsReady: ({ commit }) => {
            commit('setAppIsReady')
        },
        mapModuleReady: ({ commit }) => {
            commit('mapModuleReady')
        },
    },
    mutations: {
        setAppIsReady: (state) => (state.isReady = true),
        mapModuleReady: (state) => (state.isMapReady = true),
    },
}
