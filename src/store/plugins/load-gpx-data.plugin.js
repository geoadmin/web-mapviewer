/**
 * Listen to the `addLayer` mutation, and if a GPX is added without data/metadata defined, we load
 * it here
 */

import axios from 'axios'

import GPXLayer from '@/api/layers/GPXLayer.class'
import GPX from '@/utils/GPX'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'load-gpx-data.plugin' }

/**
 * @param {Vuex.Store} store
 * @param {GPXLayer} gpxLayer
 * @returns {Promise<void>}
 */
async function loadGpx(store, gpxLayer) {
    log.debug(`Loading data/metadata for added GPX layer`, gpxLayer)
    try {
        const response = await axios.get(gpxLayer.gpxFileUrl)
        const gpxContent = response.data
        const gpxParser = new GPX()
        const metadata = gpxParser.readMetadata(gpxContent)
        store.dispatch('updateKmlGpxLayer', {
            layerId: gpxLayer.id,
            metadata,
            data: gpxContent,
            ...dispatcher,
        })
    } catch (error) {
        log.error(`Error while fetching GPX data/metadata for layer ${gpxLayer?.id}`)
    }
}

/**
 * Load GPX data and metadata whenever a GPX layer is added (or does nothing if the layer was
 * already processed/loaded)
 *
 * @param {Vuex.Store} store
 */
export default function loadGpxDataAndMetadata(store) {
    store.subscribe((mutation) => {
        const addLayerSubscriber = (layer) => {
            if (layer instanceof GPXLayer && (!layer?.gpxData || !layer?.gpxMetadata)) {
                loadGpx(store, layer)
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
