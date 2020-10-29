export default {
    state: {
        height: 0,
        width: 0,
    },
    getters: {},
    mutations: {
        setSize: (state, {height, width}) => {
            state.height = height;
            state.width = width;
        }
    },
    actions: {
        setSize: ({commit}, {width, height}) => {
            commit('setSize', {
                height,
                width,
            })
        }
    }
}
