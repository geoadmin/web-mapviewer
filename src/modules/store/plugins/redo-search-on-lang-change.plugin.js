import { SET_LANG_MUTATION_KEY } from '@/modules/i18n/store/i18n.store'

// Redo (if necessary) the search results on lang change
const redoSearchOnLangChange = (store) => {
  store.subscribe((mutation, state) => {
    if (mutation.type === SET_LANG_MUTATION_KEY && state.search.query.length > 2) {
      // we redispatch the same query to the search store (the lang will be picked by the search store)
      store.dispatch('setSearchQuery', {
        query: state.search.query,
        showResultsAfterRequest: false,
      })
    }
  })
}

export default redoSearchOnLangChange
