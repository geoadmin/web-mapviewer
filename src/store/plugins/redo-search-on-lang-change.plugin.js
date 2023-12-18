import { SET_LANG_MUTATION_KEY } from '@/store/modules/i18n.store'

/**
 * Redo the search results on lang change if the search query is defined
 *
 * @param {Vuex.Store} store
 */
const redoSearchOnLangChange = (store) => {
    store.subscribe((mutation, state) => {
        if (mutation.type === SET_LANG_MUTATION_KEY && state.search.query.length > 2) {
            // we redispatch the same query to the search store (the lang will be picked by the search store)
            store.dispatch('setSearchQuery', {
                query: state.search.query,
            })
        }
    })
}

export default redoSearchOnLangChange
