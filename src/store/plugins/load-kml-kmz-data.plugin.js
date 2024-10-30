/**
 * Listen to the `addLayer` mutation, and if a KML is added without data/metadata defined, we load
 * it here
 */

import { getContentThroughServiceProxy } from '@/api/file-proxy.api'
import { getFileMimeType, loadKmlMetadata } from '@/api/files.api'
import KMLLayer from '@/api/layers/KMLLayer.class'
import generateErrorMessageFromErrorType from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/generateErrorMessageFromErrorType.utils'
import { KMLParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/KMLParser.class'
import KMZParser from '@/modules/menu/components/advancedTools/ImportFile/parser/KMZParser.class'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'load-kml-kmz-data.plugin' }

const kmzParser = new KMZParser()
const kmlParser = new KMLParser()

/**
 * @param {Vuex.Store} store
 * @param {KMLLayer} kmlLayer
 * @returns {Promise<void>}
 */
async function loadMetadata(store, kmlLayer) {
    log.debug(`Loading metadata for added KML layer`, kmlLayer)
    try {
        const metadata = await loadKmlMetadata(kmlLayer)
        store.dispatch('updateLayer', {
            layerId: kmlLayer.id,
            values: {
                kmlMetadata: metadata,
            },
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
    // to avoid having 2 HEAD and 2 GET request in case the file is a KML, we load this data here (instead of letting each file parser load it for itself)

    let mimeType = null
    try {
        mimeType = await getFileMimeType(kmlLayer.kmlFileUrl)
    } catch (error) {
        log.debug(
            '[load-kml-kmz-data] could not get MIME type for KML',
            kmlLayer.kmlFileUrl,
            'trying getting data through service-proxy'
        )
    }
    let loadedContent = null
    if (!mimeType) {
        try {
            loadedContent = await getContentThroughServiceProxy(kmlLayer.kmlFileUrl)
        } catch (error) {
            log.error(
                '[load-kml-kmz-data] could not get content for KML',
                kmlLayer.kmlFileUrl,
                'through service-proxy'
            )
            store.dispatch('addLayerError', {
                layerId: kmlLayer.id,
                isExternal: kmlLayer.isExternal,
                baseUrl: kmlLayer.baseUrl,
                error: generateErrorMessageFromErrorType(error),
                ...dispatcher,
            })
            // stopping there, there won't be anything to do with this file (no MIME type, no data through service-proxy)
            return
        }
    }
    try {
        const kmz = await kmzParser.parse(
            {
                fileSource: kmlLayer.kmlFileUrl,
                currentProjection: store.state.position.projection,
            },
            {
                allowServiceProxy: false,
                mimeType,
                loadedContent,
            }
        )
        store.dispatch('updateLayer', {
            layerId: kmlLayer.id,
            values: kmz,
            ...dispatcher,
        })
        // avoiding going below in the KML parsing
        return
    } catch (error) {
        // not a KMZ layer, we proceed below to check if it is a KML
    }

    try {
        const kml = await kmlParser.parse(
            {
                fileSource: kmlLayer.kmlFileUrl,
                currentProjection: store.state.position.projection,
            },
            {
                allowServiceProxy: false,
                mimeType,
                loadedContent,
            }
        )
        store.dispatch('updateLayer', {
            layerId: kmlLayer.id,
            values: {
                ...kml,
                // we have to pass the adminId (when defined) as it won't be read by the KML parser
                // meaning it will be updated to null if it was previously defined
                adminId: kmlLayer.adminId,
            },
            ...dispatcher,
        })
    } catch (error) {
        log.error(`Error while fetching KML data for layer ${kmlLayer?.id}: ${error}`)
        store.dispatch('addLayerError', {
            layerId: kmlLayer.id,
            isExternal: kmlLayer.isExternal,
            baseUrl: kmlLayer.baseUrl,
            error: generateErrorMessageFromErrorType(error),
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
