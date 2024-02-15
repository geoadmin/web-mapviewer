import i18n from '@/modules/i18n'

/**
 * The name of the mutation for lang changes
 *
 * @type {String}
 */
export const SET_LANG_MUTATION_KEY = 'setLang'

const state = {
    /**
     * The current language used by this application, expressed as an country ISO code
     * (`en`,`de`,`fr,etc...)
     *
     * @type String
     */
    lang: i18n.global.locale,
}

const getters = {}

const actions = {
    setLang({ commit }, args) {
        commit(SET_LANG_MUTATION_KEY, args)
    },
}

const mutations = {}

mutations[SET_LANG_MUTATION_KEY] = function (state, { value }) {
    state.lang = value
    i18n.global.locale = value
}

export default {
    state,
    getters,
    actions,
    mutations,
}
