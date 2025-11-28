import type { CloudOptimizedGeoTIFFLayer } from '@swissgeo/layers'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { toValue } from 'vue'

import type { ActionDispatcher } from '@/store/types'

import { CloudOptimizedGeoTIFFParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/CloudOptimizedGeoTIFFParser.class'
import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'
import useUIStore from '@/store/modules/ui'

const LOADING_BAR_REQUEST_NAME = 'load-cog-metadata'

const cogParser = new CloudOptimizedGeoTIFFParser()

export default async function loadCOGMetadataAndUpdateLayer(
    layer: CloudOptimizedGeoTIFFLayer,
    dispatcher: ActionDispatcher
): Promise<void> {
    const layersStore = useLayersStore()
    const positionStore = usePositionStore()
    const uiStore = useUIStore()

    if (!layer.fileSource) {
        log.error({
            title: 'Load COG metadata plugin',
            titleColor: LogPreDefinedColor.Green,
            messages: ['Layer file source is required', layer],
        })
        throw new Error('Layer file source is required')
    }

    uiStore.setLoadingBarRequester(LOADING_BAR_REQUEST_NAME, dispatcher)
    try {
        const layerWithExtent = await cogParser.parse({
            fileSource: layer.fileSource,
            currentProjection: toValue(positionStore.projection),
        })
        layersStore.updateLayer(
            layer.id,
            {
                extent: layerWithExtent.extent,
            },
            dispatcher
        )
    } catch (error) {
        log.error({
            title: 'Load COG metadata plugin',
            titleColor: LogPreDefinedColor.Green,
            messages: ['Error while loading COG metadata', layer, error],
        })
    } finally {
        uiStore.clearLoadingBarRequester(LOADING_BAR_REQUEST_NAME, dispatcher)
    }
}
