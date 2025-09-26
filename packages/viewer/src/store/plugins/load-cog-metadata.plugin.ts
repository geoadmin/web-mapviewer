import { toValue } from 'vue'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import type { CloudOptimizedGeoTIFFLayer, Layer } from '@swissgeo/layers'
import { LayerType } from '@swissgeo/layers'

import { CloudOptimizedGeoTIFFParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/CloudOptimizedGeoTIFFParser.class'
import type { PiniaPlugin, PiniaPluginContext } from 'pinia'
import useLayersStore from '@/store/modules/layers.store'
import type { ActionDispatcher } from '@/store/types'
import usePositionStore from '@/store/modules/position.store'

const cogParser = new CloudOptimizedGeoTIFFParser()
const dispatcher: ActionDispatcher = { name: 'load-cog-metadata.plugin' }

async function loadCOGMetadataAndUpdateLayer(layer: CloudOptimizedGeoTIFFLayer): Promise<void> {
    const layersStore = useLayersStore()
    const positionStore = usePositionStore()

    if (!layer.fileSource) {
        log.error({
            title: 'Load COG metadata plugin',
            titleColor: LogPreDefinedColor.Green,
            messages: ['Layer file source is required', layer],
        })
        throw new Error('Layer file source is required')
    }

    const layerWithExtent = await cogParser.parse({
        fileSource: layer.fileSource,
        currentProjection: toValue(positionStore.projection),
    })
    layersStore.updateLayer(
        {
            layerId: layer.id,
            values: {
                extent: layerWithExtent.extent,
            },
        },
        dispatcher
    )
}

async function addLayerSubscriber(layer: Layer): Promise<void> {
    if (layer.type === LayerType.COG && !layer.extent) {
        await loadCOGMetadataAndUpdateLayer(layer as CloudOptimizedGeoTIFFLayer)
    }
}

/**
 * COG loaded through a URL param at startup didn't go through the file parser that loads the
 * extent, no data value, and other metadata of the COG from the file.
 *
 * This plugin aims to do just that, check if any added COG is missing its metadata, and if so run
 * the file parser on it to extract this extent.
 */
const loadCOGMetadataPlugin: PiniaPlugin = (context: PiniaPluginContext) => {
    const { store } = context
    store.$onAction(({ name, args }) => {
        const payload = args[0]

        if (name === 'addLayer' && 'layer' in payload) {
            addLayerSubscriber(payload.layer).catch((error) => {
                log.error({
                    title: 'Load COG metadata plugin',
                    titleColor: LogPreDefinedColor.Green,
                    messages: ['Error while adding a COG layer', payload, error],
                })
            })
        }
        if (name === 'setLayers' && 'layers' in payload && Array.isArray(payload.layers)) {
            payload.layers.forEach((layer: Layer) => {
                addLayerSubscriber(layer).catch((error) => {
                    log.error({
                        title: 'Load COG metadata plugin',
                        titleColor: LogPreDefinedColor.Green,
                        messages: ['Error while editing a COG layer', payload, error],
                    })
                })
            })
        }
    })
}

export default loadCOGMetadataPlugin
