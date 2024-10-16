import { SET_LANG_MUTATION_KEY } from '@/store/modules/i18n.store'

/**
 * Redo the search results on lang change if the search query is defined
 *
 * @param {Vuex.Store} store
 */
const redoSearchWhenNeeded = (store) => {
    function redoSearch() {
        if (store.state.search.query.length > 2) {
            store.dispatch('setSearchQuery', {
                query: store.state.search.query,
                // we don't center on the search query when redoing a search if there is a crosshair
                shouldCenter: store.state.position.crossHair === null,
                originUrlParam: true, // necessary to select the first result if there is only one else it will not be because this redo search is done every time the page loaded
            })
        }
    }

    store.subscribe((mutation) => {
        if (mutation.type === SET_LANG_MUTATION_KEY) {
            // we redispatch the same query to the search store (the lang will be picked by the search store)
            redoSearch()
        } else if (
            mutation.type === 'setLayers' &&
            mutation.payload.layers?.some((layer) => layer.searchable)
        ) {
            // rerunning search if layer added at startup are searchable, as the search has already been run
            // if swissearch URL param is set (and layer features for searchable layers won't be available)
            redoSearch()
        }
    })
}

export default redoSearchWhenNeeded
