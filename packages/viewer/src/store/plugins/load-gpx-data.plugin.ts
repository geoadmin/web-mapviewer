/**
 * Listen to the `addLayer` mutation, and if a GPX is added without data/metadata defined, we load
 * it here
 */

import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import { type GPXLayer, LayerType } from '@swissgeo/layers'
import log from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'

import type { ActionDispatcher } from '@/store/types'

import GPXParser from '@/modules/menu/components/advancedTools/ImportFile/parser/GPXParser.class'
import { LayerStoreActions } from '@/store/actions'
import useLayersStore from '@/store/modules/layers.store'
import usePositionStore from '@/store/modules/position'
import { isEnumValue } from '@/utils/utils'

const gpxParser = new GPXParser()

const dispatcher: ActionDispatcher = { name: 'layers-gpx-data.plugin' }

async function loadGpx(gpxLayer: GPXLayer): Promise<void> {
    log.debug({
        title: 'load-gpx-data',
        messages: [`Loading data for added GPX layer`, gpxLayer],
    })

    const layerStore = useLayersStore()
    const positionStore = usePositionStore()

    try {
        const updatedLayer = await gpxParser.parse({
            fileSource: gpxLayer.gpxFileUrl || '',
            currentProjection: positionStore.projection,
        })

        layerStore.updateLayer(
            {
                layerId: updatedLayer.id,
                values: updatedLayer,
            },
            dispatcher
        )
    } catch (error) {
        log.error({
            title: 'load-gpx-data',
            messages: [`Error while fetching GPX data for layer ${gpxLayer?.id}`, error],
        })

        layerStore.addLayerError(
            {
                layerId: gpxLayer.id,
                isExternal: gpxLayer.isExternal,
                baseUrl: gpxLayer.baseUrl,
                error: new ErrorMessage('loading_error_network_failure'),
            },
            dispatcher
        )
    }
}

function addLayerSubscriber(layer: GPXLayer): void {
    if (layer.type === LayerType.GPX && !layer.gpxData) {
        loadGpx(layer).catch((error) => {
            log.error({
                title: 'load-gpx-data',
                messages: [`Unable to add gpx layer from plugin`, error],
            })
        })
    }
}

/**
 * Load GPX data and metadata whenever a GPX layer is added (or does nothing if the layer was
 * already processed/loaded)
 */
const loadGpxDataAndMetadataPlugin: PiniaPlugin = (context: PiniaPluginContext) => {
    const { store } = context

    // it is used to get the type of the action arguments
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const layersStore = useLayersStore()

    store.$onAction(({ args, name }) => {
        if (isEnumValue<LayerStoreActions>(LayerStoreActions.AddLayer, name)) {
            const [payload] = args as Parameters<typeof layersStore.addLayer>
            if (payload.layer?.type === LayerType.GPX) {
                addLayerSubscriber(payload.layer)
            }
        } else if (isEnumValue<LayerStoreActions>(LayerStoreActions.SetLayers, name)) {
            const [layers] = args as Parameters<typeof layersStore.setLayers>
            for (const layer of layers) {
                if (layer.type === LayerType.GPX) {
                    addLayerSubscriber(layer)
                }
            }
        }
    })
}

export default loadGpxDataAndMetadataPlugin
