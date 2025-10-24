/**
 * Listen to the `addLayer` mutation, and if a KML is added without data/metadata defined, we load
 * it here
 */

import type { KMLLayer, Layer } from '@swissgeo/layers'
import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import { LayerType } from '@swissgeo/layers'
import log from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'

import { getFileContentThroughServiceProxy } from '@/api/file-proxy.api'
import { checkOnlineFileCompliance, getFileContentFromUrl, loadKmlMetadata } from '@/api/files.api'
import generateErrorMessageFromErrorType from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/generateErrorMessageFromErrorType.utils'
import { KMLParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/KMLParser.class'
import KMZParser from '@/modules/menu/components/advancedTools/ImportFile/parser/KMZParser.class'
import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'

const dispatcher = { name: 'load-kml-kmz-data.plugin' }

const kmzParser = new KMZParser()
const kmlParser = new KMLParser()

async function loadMetadata(kmlLayer: KMLLayer): Promise<void> {
    log.debug({
        title: 'load-kml-kmz-data',
        messages: [`Loading metadata for added KML layer`, kmlLayer],
    })

    const layersStore = useLayersStore()

    try {
        const metadata = await loadKmlMetadata(kmlLayer)
        layersStore.updateLayer<KMLLayer>(
            kmlLayer.id,
            {
                kmlMetadata: metadata,
            },
            dispatcher
        )
    } catch (error) {
        log.error({
            title: 'load-kml-kmz-data',
            messages: [`Error while fetching KML metadata for layer ${kmlLayer?.id}`, error],
        })
    }
}

function sendLayerToStore(layer: KMLLayer): void {
    const layersStore = useLayersStore()

    layersStore.updateLayer<KMLLayer>(
        layer.id,
        {
            name: layer.name,
            kmlData: layer.kmlData,
            extent: layer.extent,
            extentProjection: layer.extentProjection,
            linkFiles: layer.linkFiles,
            isLoading: false,
        },
        dispatcher
    )
}

async function loadData(kmlLayer: KMLLayer): Promise<void> {
    const layersStore = useLayersStore()
    const positionStore = usePositionStore()

    log.debug({
        title: 'load-kml-kmz-data',
        messages: [`Loading data for added KML layer`, kmlLayer],
    })

    // to avoid having 2 HEAD and 2 GET request in case the file is a KML, we load this data here (instead of letting each file parser load it for itself)
    let complianceCheck = null
    try {
        complianceCheck = await checkOnlineFileCompliance(kmlLayer.kmlFileUrl)
    } catch (error) {
        log.error({
            title: 'load-kml-kmz-data',
            messages: [
                `Error while checking online file compliance for ${kmlLayer.kmlFileUrl}`,
                error,
            ],
        })
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
        log.error({
            title: 'load-kml-kmz-data',
            messages: ['error while loading file content for', kmlLayer.kmlFileUrl, error],
        })
    }
    if (!mimeType && !loadedContent) {
        log.error({
            title: 'load-kml-kmz-data',
            messages: ['[load-kml-kmz-data] could not get content for KML', kmlLayer.kmlFileUrl],
        })
        layersStore.addLayerError(
            kmlLayer.id,
            {
                isExternal: kmlLayer.isExternal,
                baseUrl: kmlLayer.baseUrl,
            },
            new ErrorMessage(
                kmlLayer.isExternal ? 'loading_error_network_failure' : 'loading_error_file_deleted'
            ),
            dispatcher
        )
        // stopping there, there won't be anything to do with this file
        return
    }
    try {
        const kmz = await kmzParser.parse(
            {
                fileSource: kmlLayer.kmlFileUrl,
                currentProjection: positionStore.projection,
            },
            {
                fileCompliance: complianceCheck,
                loadedContent: loadedContent ?? undefined,
            }
        )
        sendLayerToStore(kmz)
        // avoiding going below in the KML parsing
        return
    } catch (error) {
        // not a KMZ layer, we proceed below to check if it is a KML
        log.debug({
            title: 'load-kml-kmz-data',
            messages: ['error while parsing KMZ file', error],
        })
    }

    try {
        const kml = await kmlParser.parse(
            {
                fileSource: kmlLayer.kmlFileUrl,
                currentProjection: positionStore.projection,
            },
            {
                fileCompliance: complianceCheck,
                loadedContent: loadedContent ?? undefined,
            }
        )
        sendLayerToStore(kml)
    } catch (error) {
        log.error({
            title: 'load-kml-kmz-data',
            messages: [`Error while fetching KML data for layer ${kmlLayer?.id}:`, error],
        })
        if (error instanceof Error) {
            layersStore.addLayerError(
                kmlLayer.id,
                {
                    isExternal: kmlLayer.isExternal,
                    baseUrl: kmlLayer.baseUrl,
                },
                generateErrorMessageFromErrorType(error),
                dispatcher
            )
        }
    }
}

function addLayerSubscriber(layer: KMLLayer): void {
    if (!layer.kmlData || !layer.kmlMetadata) {
        if (!layer.kmlData) {
            loadData(layer).catch((error) => {
                log.error({
                    title: 'load-kml-kmz-data',
                    messages: ['Error while loading KML data for layer', layer, error],
                })
            })
        }
        if (!layer.kmlMetadata && !layer.isExternal) {
            loadMetadata(layer).catch((error) => {
                log.error({
                    title: 'load-kml-kmz-data',
                    messages: ['Error while loading KML metadata for layer', layer, error],
                })
            })
        }
    }
}

/**
 * Load KML data and metadata whenever a KML layer is added (or does nothing if the layer was
 * already processed/loaded)
 */
const loadKmlDataAndMetadata: PiniaPlugin = (context: PiniaPluginContext) => {
    const { store } = context

    // it is used to get the type of the action arguments

    const layersStore = useLayersStore()

    store.$onAction(({ name, args }) => {
        if (name === 'addLayer') {
            const [input] = args as Parameters<typeof layersStore.addLayer>

            let layer: Layer | undefined
            if (typeof input === 'string') {
                layer = layersStore.getLayerConfigById(input)
            } else {
                layer = input as Layer
            }
            if (layer && layer.type === LayerType.KML) {
                addLayerSubscriber(layer as KMLLayer)
            }
        } else if (name === 'setLayers') {
            const [layers] = args as Parameters<typeof layersStore.setLayers>
            for (const layer of layers) {
                if (layer.type === LayerType.KML) {
                    addLayerSubscriber(layer as KMLLayer)
                }
            }
        }
    })
}

export default loadKmlDataAndMetadata
