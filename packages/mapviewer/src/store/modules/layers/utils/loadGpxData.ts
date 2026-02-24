import type { GPXLayer } from '@swissgeo/layers'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'

import type { ActionDispatcher } from '@/store/types'

import GPXParser from '@/modules/menu/components/advancedTools/ImportFile/parser/GPXParser.class'
import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'
import useUIStore from '@/store/modules/ui'

const LOADING_BAR_REQUEST_NAME = 'load-gpx-data'

const gpxParser = new GPXParser()

export default async function loadGpxData(
    gpxLayer: GPXLayer,
    dispatcher: ActionDispatcher
): Promise<void> {
    log.debug({
        title: 'load-gpx-data',
        titleColor: LogPreDefinedColor.Indigo,
        messages: [`Loading data for added GPX layer`, gpxLayer],
    })

    const layerStore = useLayersStore()
    const positionStore = usePositionStore()
    const uiStore = useUIStore()

    try {
        uiStore.setLoadingBarRequester(LOADING_BAR_REQUEST_NAME, dispatcher)
        const updatedLayer = await gpxParser.parse(
            {
                fileSource: gpxLayer.gpxFileUrl || '',
                currentProjection: positionStore.projection,
            },
            {
                loadedContent: gpxLayer.gpxData,
            }
        )

        layerStore.updateLayer(updatedLayer.id, updatedLayer, dispatcher)
    } catch (error) {
        log.error({
            title: 'load-gpx-data',
            titleColor: LogPreDefinedColor.Indigo,
            messages: [`Error while fetching GPX data for layer ${gpxLayer?.id}`, error],
        })

        layerStore.addLayerError(
            gpxLayer.id,
            {
                isExternal: gpxLayer.isExternal,
                baseUrl: gpxLayer.baseUrl,
            },
            new ErrorMessage('loading_error_network_failure'),
            dispatcher
        )
    } finally {
        uiStore.clearLoadingBarRequester(LOADING_BAR_REQUEST_NAME, dispatcher)
    }
}
