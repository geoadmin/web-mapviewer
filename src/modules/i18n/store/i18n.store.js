import i18n from "../";

const state = {
    lang: i18n.locale
};

const getters = {};

const actions = {
    setLang: function ({ commit }, lang) {
        commit('setLang', lang);
    }
};

const mutations = {
    setLang: function (state, lang) {
        state.lang = lang;
        i18n.locale = lang;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
