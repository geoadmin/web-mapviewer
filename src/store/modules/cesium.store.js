/** Module that stores all information related to the 3D viewer */
export default {
    state: {
        /**
         * Flag telling if the app should be displaying the map in 3D or not
         *
         * @type Boolean
         */
        active: false,
    },
    getters: {},
    actions: {
        set3dActive({ commit }, is3dActive) {
            commit('set3dActive', !!is3dActive)
        },
    },
    mutations: {
        set3dActive(state, flagValue) {
            state.active = flagValue
        },
    },
}
