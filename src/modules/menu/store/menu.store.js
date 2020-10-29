const state = {
    showMenuTray: false,
    showHeader: true,
};

const getters = {};

const actions = {
    showMenuTray: ({commit}) => { commit('showMenuTray') },
    hideMenuTray: ({commit}) => { commit('hideMenuTray') },
    showHeader: ({commit}) => { commit('showHeader') },
    hideHeader: ({commit}) => { commit('hideHeader') },
    toggleHeader: ({commit, state}) => {
        if (state.showHeader) {
            commit('hideHeader');
        } else {
            commit('showHeader');
        }
    },
};

const mutations = {
    showMenuTray: state => state.showMenuTray = true,
    hideMenuTray: state => state.showMenuTray = false,
    showHeader: state => state.showHeader = true,
    hideHeader: state => state.showHeader = false,
};

export default {
    state,
    getters,
    actions,
    mutations
};
