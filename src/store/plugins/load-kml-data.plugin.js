/**
 * Listen to the `addLayer` mutation, and if a KML is added without data/metadata defined, we load
 * it here
 */

import { loadKmlData, loadKmlMetadata } from '@/api/files.api'
import KMLLayer from '@/api/layers/KMLLayer.class'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'load-kml-data.plugin' }

/**
 * @param {Vuex.Store} store
 * @param {KMLLayer} kmlLayer
 * @returns {Promise<void>}
 */
async function loadMetadata(store, kmlLayer) {
    log.debug(`Loading metadata for added KML layer`, kmlLayer)
    try {
        const metadata = await loadKmlMetadata(kmlLayer)
        store.dispatch('setKmlGpxLayerData', {
            layerId: kmlLayer?.id,
            metadata,
            ...dispatcher,
        })
    } catch (error) {
        log.error(`Error while fetching KML metadata for layer ${kmlLayer?.id}`)
    }
}

/**
 * @param {Vuex.Store} store
 * @param {KMLLayer} kmlLayer
 * @returns {Promise<void>}
 */
async function loadData(store, kmlLayer) {
    log.debug(`Loading data for added KML layer`, kmlLayer)
    try {
        const data = await loadKmlData(kmlLayer)
        store.dispatch('setKmlGpxLayerData', {
            layerId: kmlLayer?.id,
            data,
            ...dispatcher,
        })
    } catch (error) {
        log.error(`Error while fetching KML data for layer ${kmlLayer?.id}: ${error}`)
        store.dispatch('addLayerErrorKey', {
            layerId: kmlLayer.id,
            errorKey: `loading_error_network_failure`,
            ...dispatcher,
        })
    }
}

/**
 * Load KML data and metadata whenever a KML layer is added (or does nothing if the layer was
 * already processed/loaded)
 *
 * @param {Vuex.Store} store
 */
export default function loadKmlDataAndMetadata(store) {
    const addLayerSubscriber = (layer) => {
        if (layer instanceof KMLLayer && (!layer.kmlData || !layer.kmlMetadata)) {
            if (!layer.kmlData) {
                loadData(store, layer)
            }
            if (!layer.kmlMetadata && !layer.isExternal) {
                loadMetadata(store, layer)
            }
        }
    }
    store.subscribe((mutation) => {
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
