import type { GeoAdminLayer } from '@swissgeo/layers'
import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import { LayerStoreActions } from '@/store/actions'
import useLayersStore from '@/store/modules/layers'
import useSearchStore from '@/store/modules/search'
import { isEnumValue } from '@/utils/utils'

function redoSearch() {
    const searchStore = useSearchStore()

    if (searchStore.query.length > 2) {
        searchStore
            .setSearchQuery(
                searchStore.query,
                // necessary to select the first result if there is only one else it will not be because this redo search is done every time the page loaded
                { originUrlParam: true },
                { name: 'redoSearchWhenNeeded' }
            )
    }
}

/** Redo the search results on lang change if the search query is defined */
const redoSearchWhenNeeded: PiniaPlugin = (context: PiniaPluginContext) => {
    const { store } = context

    // it is used to get the type of the action arguments
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const layersStore = useLayersStore()

    store.$onAction(({ name, args }) => {
        if (name === 'setLang') {
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
