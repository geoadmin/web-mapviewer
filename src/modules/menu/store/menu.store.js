
const state = {
    showMenuTray: false
};

const getters = {};

const actions = {
    toggleMenuTray: function ({ commit }) {
        commit('toggleMenuTray');
    }
};

const mutations = {
    toggleMenuTray: function (state) {
        state.showMenuTray = !state.showMenuTray;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
