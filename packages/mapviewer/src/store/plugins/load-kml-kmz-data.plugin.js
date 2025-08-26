/**
 * Listen to the `addLayer` mutation, and if a KML is added without data/metadata defined, we load
 * it here
 */

import log from '@geoadmin/log'
import { ErrorMessage } from '@geoadmin/log/Message'

import { getFileContentThroughServiceProxy } from '@/api/file-proxy.api'
import { checkOnlineFileCompliance, getFileContentFromUrl, loadKmlMetadata } from '@/api/files.api'
import KMLLayer from '@/api/layers/KMLLayer.class'
import generateErrorMessageFromErrorType from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/generateErrorMessageFromErrorType.utils'
import { KMLParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/KMLParser.class'
import KMZParser from '@/modules/menu/components/advancedTools/ImportFile/parser/KMZParser.class'

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
        if (kmlLayer.adminId) {
            store.dispatch('setShowDrawingOverlay', {
                show: true,
                ...dispatcher,
            })
        }
        // if admin id dispatch open drawing
    } catch (error) {
        // ajouter error message here
        if (kmlLayer?.adminId) {
            //kmlLayer.adminId = null
            kmlLayer.addErrorMessage(
                new ErrorMessage(
                    'BONJOUR EDITEUR',
                    { layerName: kmlLayer.name ?? kmlLayer.id },
                    kmlLayer.id
                )
            )
        }
        // TODO set admin Id to null
        log.error(`Error while fetching KML metadata for layer ${kmlLayer?.id}`, error)
    }
}

/**
 * @param store
 * @param {KMLLayer} layer
 */
function sendLayerToStore(store, layer) {
    store.dispatch('updateLayer', {
        layerId: layer.id,
        values: {
            name: layer.name,
            kmlData: layer.kmlData,
            extent: layer.extent,
            extentProjection: layer.extentProjection,
            linkFiles: layer.linkFiles,
            isLoading: false,
        },
        ...dispatcher,
    })
}

/**
 * @param {Vuex.Store} store
 * @param {KMLLayer} kmlLayer
 * @returns {Promise<void>}
 */
async function loadData(store, kmlLayer) {
    log.debug(`[load-kml-kmz-data] Loading data for added KML layer`, kmlLayer)

    // to avoid having 2 HEAD and 2 GET request in case the file is a KML, we load this data here (instead of letting each file parser load it for itself)
    let complianceCheck = null
    try {
        complianceCheck = await checkOnlineFileCompliance(kmlLayer.kmlFileUrl)
    } catch (error) {
        log.error(
            `[load-kml-kmz-data] Error while checking online file compliance for ${kmlLayer.kmlFileUrl}`,
            error
        )
        throw error
    }

    const { mimeType, supportsCORS, supportsHTTPS } = complianceCheck
    let loadedContent = null
    try {
        if (supportsCORS && supportsHTTPS) {
            loadedContent = await getFileContentFromUrl(kmlLayer.kmlFileUrl)
        } else if (mimeType) {
            loadedContent = await getFileContentThroughServiceProxy(kmlLayer.kmlFileUrl)
        }
    } catch (error) {
        log.error(
            '[load-kml-kmz-data] error while loading file content for',
            kmlLayer.kmlFileUrl,
            error
        )
    }
    if (!mimeType && !loadedContent) {
        log.error('[load-kml-kmz-data] could not get content for KML', kmlLayer.kmlFileUrl)
        const errorMessage = new ErrorMessage(
            kmlLayer.isExternal ? 'loading_error_network_failure' : 'loading_error_file_deleted',
            {},
            kmlLayer.id
        )
        store.dispatch('addLayerError', {
            layerId: kmlLayer.id,
            isExternal: kmlLayer.isExternal,
            baseUrl: kmlLayer.baseUrl,
            error: errorMessage,
            ...dispatcher,
        })
        store.dispatch('addErrors', { errors: [errorMessage] }, dispatcher)
        // stopping there, there won't be anything to do with this file
        return
    }
    try {
        const kmz = await kmzParser.parse(
            {
                fileSource: kmlLayer.kmlFileUrl,
                currentProjection: store.state.position.projection,
            },
            {
                mimeType,
                loadedContent,
            }
        )
        sendLayerToStore(store, kmz)
        // avoiding going below in the KML parsing
        return
    } catch (error) {
        // not a KMZ layer, we proceed below to check if it is a KML
        log.debug('[load-kml-kmz-data] error while parsing KMZ file', error)
    }

    try {
        const kml = await kmlParser.parse(
            {
                fileSource: kmlLayer.kmlFileUrl,
                currentProjection: store.state.position.projection,
            },
            {
                mimeType,
                loadedContent,
            }
        )
        sendLayerToStore(store, kml)
    } catch (error) {
        log.error(
            `[load-kml-kmz-data] Error while fetching KML data for layer ${kmlLayer?.id}: ${error}`
        )
        const errorMessage = generateErrorMessageFromErrorType(error, kmlLayer)
        store.dispatch('addLayerError', {
            layerId: kmlLayer.id,
            isExternal: kmlLayer.isExternal,
            baseUrl: kmlLayer.baseUrl,
            error: errorMessage,
            ...dispatcher,
        })
        store.dispatch('addErrors', [errorMessage], dispatcher)
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
