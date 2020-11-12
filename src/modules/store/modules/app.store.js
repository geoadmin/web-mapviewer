export default {
    state: {
        isReady: false,
    },
    getters: {},
    actions: {
        setAppIsReady: ({commit}) => commit('setAppIsReady'),
    },
    mutations: {
        setAppIsReady: (state) => state.isReady = true,
    },
}
