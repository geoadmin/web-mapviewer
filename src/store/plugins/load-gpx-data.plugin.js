/**
 * Listen to the `addLayer` mutation, and if a GPX is added without data/metadata defined, we load
 * it here
 */

import GPXLayer from '@/api/layers/GPXLayer.class'
import GPXParser from '@/modules/menu/components/advancedTools/ImportFile/parser/GPXParser.class'
import ErrorMessage from '@/utils/ErrorMessage.class'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'load-gpx-data.plugin' }

const gpxParser = new GPXParser()

/**
 * @param {Vuex.Store} store
 * @param {GPXLayer} gpxLayer
 * @returns {Promise<void>}
 */
async function loadGpx(store, gpxLayer) {
    log.debug(`Loading data for added GPX layer`, gpxLayer)
    try {
        const updatedLayer = await gpxParser.parse({
            fileSource: gpxLayer.gpxFileUrl,
            currentProjection: store.state.position.projection,
        })
        store.dispatch('updateLayer', {
            layerId: updatedLayer.id,
            values: updatedLayer,
        })
    } catch (error) {
        log.error(`Error while fetching GPX data for layer ${gpxLayer?.id}`)
        store.dispatch('addLayerError', {
            layerId: gpxLayer.id,
            isExternal: gpxLayer.isExternal,
            baseUrl: gpxLayer.baseUrl,
            error: new ErrorMessage('loading_error_network_failure'),
            ...dispatcher,
        })
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
            if (layer instanceof GPXLayer && !layer.gpxData) {
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
