import type { KMLLayer } from '@swissgeo/layers'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'

import type { ActionDispatcher } from '@/store/types'

import { getFileContentThroughServiceProxy } from '@/api/file-proxy.api'
import { checkOnlineFileCompliance, getFileContentFromUrl, loadKmlMetadata } from '@/api/files.api'
import generateErrorMessageFromErrorType from '@/modules/menu/components/advancedTools/ImportFile/parser/errors/generateErrorMessageFromErrorType.utils'
import { KMLParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/KMLParser.class'
import KMZParser from '@/modules/menu/components/advancedTools/ImportFile/parser/KMZParser.class'
import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'
import useUIStore from '@/store/modules/ui'

const LOADING_BAR_REQUEST_NAME = 'load-kml-kmz-data'

const kmzParser = new KMZParser()
const kmlParser = new KMLParser()

async function loadMetadata(kmlLayer: KMLLayer, dispatcher: ActionDispatcher): Promise<void> {
    log.debug({
        title: 'Layer store / loadKmlKmzData',
        titleColor: LogPreDefinedColor.Indigo,
        messages: [`Loading metadata for added KML layer`, kmlLayer],
    })

    const layersStore = useLayersStore()
    const uiStore = useUIStore()

    uiStore.setLoadingBarRequester(`${LOADING_BAR_REQUEST_NAME}/metadata`, dispatcher)

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
            title: 'Layer store / loadKmlKmzData',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [`Error while fetching KML metadata for layer ${kmlLayer?.id}`, error],
        })
    } finally {
        uiStore.clearLoadingBarRequester(`${LOADING_BAR_REQUEST_NAME}/metadata`, dispatcher)
    }
}

async function loadData(kmlLayer: KMLLayer, dispatcher: ActionDispatcher): Promise<void> {
    const layersStore = useLayersStore()
    const positionStore = usePositionStore()
    const uiStore = useUIStore()

    log.debug({
        title: 'Layer store / loadKmlKmzData',
        titleColor: LogPreDefinedColor.Indigo,
        messages: [`Loading data for added KML layer`, kmlLayer],
    })

    // to avoid having 2 HEAD and 2 GET request in case the file is a KML, we load this data here (instead of letting each file parser load it for itself)
    let complianceCheck = null
    uiStore.setLoadingBarRequester(`${LOADING_BAR_REQUEST_NAME}/compliance`, dispatcher)
    try {
        complianceCheck = await checkOnlineFileCompliance(kmlLayer.kmlFileUrl)
    } catch (error) {
        log.error({
            title: 'Layer store / loadKmlKmzData',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [
                `Error while checking online file compliance for ${kmlLayer.kmlFileUrl}`,
                error,
            ],
        })
        throw error
    } finally {
        uiStore.clearLoadingBarRequester(`${LOADING_BAR_REQUEST_NAME}/compliance`, dispatcher)
    }

    const { mimeType, supportsCORS, supportsHTTPS } = complianceCheck
    let loadedContent: ArrayBuffer | undefined

    uiStore.setLoadingBarRequester(`${LOADING_BAR_REQUEST_NAME}/content`, dispatcher)
    try {
        if (supportsCORS && supportsHTTPS) {
            loadedContent = await getFileContentFromUrl(kmlLayer.kmlFileUrl)
        } else if (mimeType) {
            loadedContent = await getFileContentThroughServiceProxy(kmlLayer.kmlFileUrl)
        }
    } catch (error) {
        log.error({
            title: 'Layer store / loadKmlKmzData',
            titleColor: LogPreDefinedColor.Indigo,
            messages: ['error while loading file content for', kmlLayer.kmlFileUrl, error],
        })
    } finally {
        uiStore.clearLoadingBarRequester(`${LOADING_BAR_REQUEST_NAME}/content`, dispatcher)
    }
    if (!mimeType && !loadedContent) {
        log.error({
            title: 'Layer store / loadKmlKmzData',
            titleColor: LogPreDefinedColor.Indigo,
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

    let updateKmlLayer: KMLLayer | undefined

    try {
        updateKmlLayer = await kmzParser.parse(
            {
                fileSource: kmlLayer.kmlFileUrl,
                currentProjection: positionStore.projection,
            },
            {
                fileCompliance: complianceCheck,
                loadedContent: loadedContent ?? undefined,
            }
        )
    } catch (error) {
        // not a KMZ layer, we proceed below to check if it is a KML
        log.debug({
            title: 'Layer store / loadKmlKmzData',
            titleColor: LogPreDefinedColor.Indigo,
            messages: ['error while parsing KMZ file', error],
        })
    }

    if (!updateKmlLayer) {
        try {
            updateKmlLayer = await kmlParser.parse(
                {
                    fileSource: kmlLayer.kmlFileUrl,
                    currentProjection: positionStore.projection,
                },
                {
                    fileCompliance: complianceCheck,
                    loadedContent: loadedContent ?? undefined,
                }
            )
        } catch (error) {
            log.error({
                title: 'Layer store / loadKmlKmzData',
                titleColor: LogPreDefinedColor.Indigo,
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
    if (updateKmlLayer) {
        layersStore.updateLayer<KMLLayer>(
            kmlLayer.id,
            {
                name: updateKmlLayer.name,
                kmlData: updateKmlLayer.kmlData,
                extent: updateKmlLayer.extent,
                extentProjection: updateKmlLayer.extentProjection,
                linkFiles: updateKmlLayer.linkFiles,
                isLoading: false,
            },
            dispatcher
        )
    } else {
        log.error({
            title: 'Layer store / loadKmlKmzData',
            titleColor: LogPreDefinedColor.Indigo,
            messages: ['Error while updating KML layer, no layer found/parsed', kmlLayer],
        })
        layersStore.addLayerError(
            kmlLayer,
            new ErrorMessage('loading_error_network_failure'),
            dispatcher
        )
    }
}
export default async function loadKmlKmzData(
    layer: KMLLayer,
    dispatcher: ActionDispatcher
): Promise<void> {
    if (!layer.kmlData || !layer.kmlMetadata) {
        if (!layer.kmlData) {
            await loadData(layer, dispatcher)
        }
        if (!layer.kmlMetadata && !layer.isExternal) {
            await loadMetadata(layer, dispatcher)
        }
    }
}
