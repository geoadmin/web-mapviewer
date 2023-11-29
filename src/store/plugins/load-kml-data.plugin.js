/**
 * Listen to the `addLayer` mutation, and if a KML is added without data/metadata defined, we load
 * it here
 */

import { loadKmlData, loadKmlMetadata } from '@/api/files.api'
import KMLLayer from '@/api/layers/KMLLayer.class'
import log from '@/utils/logging'

/**
 * Load KML data and metadata whenever a KML layer is added (or does nothing if the layer was
 * already processed/loaded)
 *
 * @param {Vuex.Store} store
 */
export default function loadKmlDataAndMetadata(store) {
    store.subscribe((mutation) => {
        if (
            mutation.type === 'addLayer' &&
            mutation.payload instanceof KMLLayer &&
            mutation.payload.isLoading
        ) {
            const kmlLayer = mutation.payload
            log.debug(`Loading data/metadata for added KML layer`, kmlLayer)
            const promises = [loadKmlData(kmlLayer)]
            if (!kmlLayer.kmlMetadata) {
                promises.push(loadKmlMetadata(kmlLayer))
            }
            Promise.all(promises)
                .then((responses) => {
                    const layerCopy = kmlLayer.clone()
                    layerCopy.kmlData = responses[0]

                    if (!kmlLayer.kmlMetadata) {
                        layerCopy.kmlMetadata = responses[1]
                    }

                    layerCopy.isLoading = false
                    store.dispatch('updateLayer', layerCopy)
                })
                .catch((error) => {
                    log.error(`Failed to load kml from ${kmlLayer.kmlFileUrl}`, error)
                })
        }
    })
}
