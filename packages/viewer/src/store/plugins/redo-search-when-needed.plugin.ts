import type { GeoAdminLayer } from '@swissgeo/layers'
import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import log from '@swissgeo/log'

import { I18nStoreActions } from '@/store/modules/i18n.store'
import useLayersStore, { LayerStoreActions } from '@/store/modules/layers.store'
import useSearchStore from '@/store/modules/search.store'
import { isEnumValue } from '@/utils/utils'

function redoSearch() {
    const searchStore = useSearchStore()

    if (searchStore.query.length > 2) {
        searchStore
            .setSearchQuery(
                {
                    query: searchStore.query,
                    // necessary to select the first result if there is only one else it will not be because this redo search is done every time the page loaded
                    originUrlParam: true,
                },
                { name: 'redoSearchWhenNeeded' }
            )
            .catch((error) => {
                log.error({
                    title: 'Redo search when needed plugin',
                    messages: ['Error while redoing search with query', searchStore.query, error],
                })
            })
    }
}

/** Redo the search results on lang change if the search query is defined */
const redoSearchWhenNeeded: PiniaPlugin = (context: PiniaPluginContext) => {
    const { store } = context

    const layersStore = useLayersStore()

    store.$onAction(({ name, args }) => {
        if (isEnumValue<I18nStoreActions>(I18nStoreActions.SetLang, name)) {
            // we redispatch the same query to the search store (the lang will be picked by the search store)
            redoSearch()
        } else if (isEnumValue<LayerStoreActions>(LayerStoreActions.SetLayers, name)) {
            const [layers] = args as Parameters<typeof layersStore.setLayers>

            const internalLayers = layers.filter(
                (layer) => typeof layer !== 'string' && !layer.isExternal
            ) as GeoAdminLayer[]

            // rerunning search if layer added at startup are searchable, as the search has already been run
            // if swissearch URL param is set (and layer features for searchable layers won't be available)
            if (internalLayers.some((layer) => layer && layer.searchable)) {
                redoSearch()
            }
        }
    })
}

export default redoSearchWhenNeeded
