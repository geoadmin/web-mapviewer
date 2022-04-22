import i18n from '@/modules/i18n'

/**
 * The name of the mutation for lang changes
 *
 * @type {String}
 */
export const SET_LANG_MUTATION_KEY = 'setLang'

const state = {
    /**
     * The current language used by this application, expressed as an country ISO code (`en`,`de`,`fr,etc...)
     *
     * @type String
     */
    lang: i18n.global.locale,
}

const getters = {}

const actions = {
    setLang({ commit }, lang) {
        commit(SET_LANG_MUTATION_KEY, lang)
    },
}

const mutations = {}

mutations[SET_LANG_MUTATION_KEY] = function (state, lang) {
    state.lang = lang
    i18n.global.locale = lang
}

export default {
    state,
    getters,
    actions,
    mutations,
}
