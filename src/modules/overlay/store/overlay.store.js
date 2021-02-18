export default {
    state: {
        show: false,
        callbacksOnClose: [],
    },
    getters: {},
    mutations: {
        showOverlay(state, callbackOnClose) {
            state.show = true
            state.callbacksOnClose.push(callbackOnClose)
        },
        hideOverlay(state) {
            state.show = false
            if (state.callbacksOnClose.length > 0) {
                state.callbacksOnClose.forEach((callback) => {
                    callback()
                })
                state.callbacksOnClose = []
            }
        },
    },
    actions: {
        showOverlay: ({ commit }, callbacksOnClose) => commit('showOverlay', callbacksOnClose),
        hideOverlay: ({ commit }) => commit('hideOverlay'),
    },
}
