import { LayerType } from '@geoadmin/layers'
import { toValue } from 'vue'

import { CloudOptimizedGeoTIFFParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/CloudOptimizedGeoTIFFParser'

const cogParser = new CloudOptimizedGeoTIFFParser()

async function loadCOGMetadataAndUpdateLayer(store, layer) {
    const layerWithExtent = await cogParser.parse({
        fileSource: layer.fileSource,
        currentProjection: toValue(store.state.position.projection),
    })
    store.dispatch('updateLayer', {
        layerId: layer.id,
        values: {
            extent: layerWithExtent.extent,
        },
    })
}

/**
 * COG loaded through a URL param at startup didn't go through the file parser that loads the
 * extent, no data value, and other metadata of the COG from the file.
 *
 * This plugin aims to do just that, check if any added COG is missing its metadata, and if so run
 * the file parser on it to extract this extent.
 *
 * @param {Vuex.Store} store
 */
export default function loadCOGMetadata(store) {
    store.subscribe((mutation) => {
        const addLayerSubscriber = (layer) => {
            if (layer.type === LayerType.COG && !layer.extent) {
                loadCOGMetadataAndUpdateLayer(store, layer)
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
