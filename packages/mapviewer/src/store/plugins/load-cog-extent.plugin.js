import { toValue } from 'vue'

import CloudOptimizedGeoTIFFLayer from '@/api/layers/CloudOptimizedGeoTIFFLayer.class'
import { CloudOptimizedGeoTIFFParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/CloudOptimizedGeoTIFFParser.class'

const cogParser = new CloudOptimizedGeoTIFFParser()

async function loadExtentAndUpdateLayer(store, layer) {
    const layerWithExtent = await cogParser.parse({
        fileSource: layer.fileSource,
        currentProjection: toValue(store.state.position.projection),
    })
    // getting the layer index. It's OK here because this layer can't be
    // duplicated
    const layerIndex = store.getLayerIndexById(layer.id)
    store.dispatch('updateLayer', {
        index: layerIndex,
        values: {
            extent: layerWithExtent.extent,
        },
    })
}

/**
 * COG loaded through a URL param at startup didn't go through the file parser that loads the extent
 * of the COG from the file.
 *
 * This plugin aims to do just that, check if any added COG is missing its extent, and if so run the
 * file parser on it to extract this extent.
 *
 * @param {Vuex.Store} store
 */
export default function loadCOGExtent(store) {
    store.subscribe((mutation) => {
        const addLayerSubscriber = (layer) => {
            if (layer instanceof CloudOptimizedGeoTIFFLayer && !layer.extent) {
                loadExtentAndUpdateLayer(store, layer)
            }
        }
        if (mutation.type === 'addLayer') {
            addLayerSubscriber(mutation.payload.layer)
        }
        if (mutation.type === 'setLayers') {
            mutation.payload.layers?.forEach((layer) => {
                addLayerSubscriber(layer)
            })
        }
    })
}
