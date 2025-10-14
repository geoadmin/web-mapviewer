/**
 * Listen to the `addLayer` mutation, and if a GPX is added without data/metadata defined, we load
 * it here
 */

import type { PiniaPlugin } from 'pinia'

import { LayerType, type GPXLayer } from '@swissgeo/layers'
import log from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'

import type { ActionDispatcher } from '@/store/types'

import GPXParser from '@/modules/menu/components/advancedTools/ImportFile/parser/GPXParser.class'
import useLayersStore from '@/store/modules/layers.store'
import usePositionStore from '@/store/modules/position.store'

const gpxParser = new GPXParser()

/**
 * Load GPX data and metadata whenever a GPX layer is added (or does nothing if the layer was
 * already processed/loaded)
 *
 * @param {Vuex.Store} store
 */
const loadGpxDataAndMetadataPlugin: PiniaPlugin = () => {
    const dispatcher: ActionDispatcher = { name: 'layers-gpx-data.plugin' }

    const layerStore = useLayersStore()
    const positionStore = usePositionStore()

    /**
     * @param {Vuex.Store} store
     * @param {GPXLayer} gpxLayer
     * @returns {Promise<void>}
     */
    async function loadGpx(gpxLayer: GPXLayer) {
        log.debug(`Loading data for added GPX layer`, gpxLayer)
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

    layerStore.$onAction(({ args, name }) => {
        const addLayerSubscriber = (layer: GPXLayer) => {
            if (layer.type === LayerType.GPX && !layer.gpxData) {
                loadGpx(layer).catch((error) => {
                    log.error({
                        messages: [`Unable to add gpx layer from plugin`, error],
                    })
                })
            }
        }

        if (name === 'addLayer' && args[0].layer) {
            if (args[0].layer.type === LayerType.GPX) {
                addLayerSubscriber(args[0].layer)
            }
        }

        if (name === 'setLayers') {
            for (const layer of args[0]) {
                if (typeof layer === 'string') {
                    log.debug(`Not adding ${layer} in GPX plugin because it's a string`)
                } else if (layer.type === LayerType.GPX) {
                    addLayerSubscriber(layer)
                }
            }
        }
    })
}

export default loadGpxDataAndMetadataPlugin
