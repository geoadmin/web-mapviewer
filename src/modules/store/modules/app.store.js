/**
 * Vuex module that tells if the app has finished loading (is ready to show stuff)
 */
export default {
  state: {
    /**
     * Flag that tells if the app is ready to show data and the map
     * @type Boolean
     */
    isReady: false,
  },
  getters: {},
  actions: {
    setAppIsReady: ({ commit }) => commit('setAppIsReady'),
  },
  mutations: {
    setAppIsReady: (state) => (state.isReady = true),
  },
}
