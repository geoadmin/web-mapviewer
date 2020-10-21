const state = {
    showMenuTray: false,
};

const getters = {};

const actions = {
    showMenuTray: ({commit}) => { commit('showMenuTray') },
    hideMenuTray: ({commit}) => { commit('hideMenuTray') },
};

const mutations = {
    showMenuTray: state => state.showMenuTray = true,
    hideMenuTray: state => state.showMenuTray = false,
};

export default {
    state,
    getters,
    actions,
    mutations
};
