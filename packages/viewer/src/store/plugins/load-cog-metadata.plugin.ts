import type { CloudOptimizedGeoTIFFLayer, Layer } from '@swissgeo/layers'
import type { PiniaPlugin } from 'pinia'

import { LayerType } from '@swissgeo/layers'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { toValue } from 'vue'

import type { ActionDispatcher } from '@/store/types'

import { CloudOptimizedGeoTIFFParser } from '@/modules/menu/components/advancedTools/ImportFile/parser/CloudOptimizedGeoTIFFParser.class'
import useLayersStore, { LayerStoreActions } from '@/store/modules/layers.store'
import usePositionStore from '@/store/modules/position.store'
import { isEnumValue } from '@/utils/utils'

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
const loadCOGMetadataPlugin: PiniaPlugin = () => {
    const layersStore = useLayersStore()

    layersStore.$onAction(({ name, args }) => {
        if (isEnumValue<LayerStoreActions>(LayerStoreActions.AddLayer, name)) {
            const [payload] = args as Parameters<typeof layersStore.addLayer>
            if (payload.layer) {
                addLayerSubscriber(payload.layer).catch((error) => {
                    log.error({
                        title: 'Load COG metadata plugin',
                        titleColor: LogPreDefinedColor.Green,
                        messages: ['Error while adding a COG layer', args, error],
                    })
                })
            }
        } else if (isEnumValue<LayerStoreActions>(LayerStoreActions.SetLayers, name)) {
            const [layers] = args as Parameters<typeof layersStore.setLayers>
            // sometimes the setLayers can receive strings. This can't work
            // with anything in here, so let's filter this away
            const nonStringLayers = layers.filter((layer) => !(typeof layer === 'string'))

            for (const layer of nonStringLayers) {
                addLayerSubscriber(layer).catch((error) => {
                    log.error({
                        title: 'Load COG metadata plugin',
                        titleColor: LogPreDefinedColor.Green,
                        messages: ['Error while editing a COG layer', args, error],
                    })
                })
            }
        }
    })
}

export default loadCOGMetadataPlugin
