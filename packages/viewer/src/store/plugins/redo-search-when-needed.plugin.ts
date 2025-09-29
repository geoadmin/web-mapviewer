import { useI18nStore } from "@/store/modules/i18n.store"
import useLayersStore from "@/store/modules/layers.store"
import useSearchStore from "@/store/modules/search.store"
import log from '@swissgeo/log'
import type { PiniaPlugin } from "pinia"

/**
 * Redo the search results on lang change if the search query is defined
 *
 * @param {Vuex.Store} store
 */
const redoSearchWhenNeeded: PiniaPlugin = () => {
    const i18nStore = useI18nStore()
    const layersStore = useLayersStore()
    const searchStore = useSearchStore()

    function redoSearch() {
        if (searchStore.query.length > 2) {
            searchStore.setSearchQuery({
                query: searchStore.query,
                originUrlParam: true, // necessary to select the first result if there is only one else it will not be because this redo search is done every time the page loaded
            },
                { name: 'redoSearchWhenNeeded' }
            ).catch((error) => {
                log.error({ messages: [error]})
            })
        }
    }

    i18nStore.$onAction(({ name }) => {
        if (name === 'setLang') {
            // we redispatch the same query to the search store (the lang will be picked by the search store)
            redoSearch()
        }
    })

    layersStore.$onAction(({ name, args }) => {
        if (
            name === 'setLayers' &&
            args[0].some((layer) => typeof layer !== 'string' && 'searchable' in layer && layer.searchable)
        ) {
            // rerunning search if layer added at startup are searchable, as the search has already been run
            // if swissearch URL param is set (and layer features for searchable layers won't be available)
            redoSearch()
        }
    })
}

export default redoSearchWhenNeeded
