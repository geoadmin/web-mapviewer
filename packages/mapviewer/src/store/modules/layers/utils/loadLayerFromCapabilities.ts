import type {
    ExternalWMSLayer,
    ExternalWMTSLayer,
    Layer,
    WMSCapabilitiesResponse,
} from '@swissgeo/layers'

import { CapabilitiesError } from '@swissgeo/layers'
import { readWmsCapabilities, readWmtsCapabilities } from '@swissgeo/layers/api'
import { wmsCapabilitiesParser, wmtsCapabilitiesParser } from '@swissgeo/layers/parsers'
import { timeConfigUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'

import type { ActionDispatcher } from '@/store/types'

import useI18nStore from '@/store/modules/i18n'
import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'

/**
 * "Filter" function (that can be used in an array-filter operation) that will keep only the
 * external WMS/WMTS layers that are not yet loaded
 *
 * @param layer
 */
export function isAnExternalLayerRequiringCapabilitesLoading(layer: Layer): boolean {
    return layer.isExternal && layer.isLoading && ['WMS', 'WMTS'].includes(layer.type)
}

/**
 * Load External layers attributes (title, abstract, extent, attributions, ...) after the layer has
 * been added through a URL parameter (at app start-up). When the layer is not added through the
 * import tool, it lacks all information coming from reading its getCapabilities.
 */
export default async function loadLayerFromCapabilities(
    layer: Layer,
    dispatcher: ActionDispatcher
): Promise<void> {
    if (!isAnExternalLayerRequiringCapabilitesLoading(layer)) {
        return
    }

    const i18nStore = useI18nStore()
    const layersStore = useLayersStore()
    const positionStore = usePositionStore()

    let parsedLayer: ExternalWMSLayer | ExternalWMTSLayer | undefined

    try {
        if (layer.type === 'WMS') {
            const capabilities = await readWmsCapabilities(layer.baseUrl, i18nStore.lang)
            parsedLayer = wmsCapabilitiesParser.getExternalLayer(
                capabilities as unknown as WMSCapabilitiesResponse,
                layer.id,
                {
                    outputProjection: positionStore.projection,
                    initialValues: {
                        opacity: layer.opacity,
                        isVisible: layer.isVisible,
                        customAttributes: layer.customAttributes,
                        currentYear: (layer as ExternalWMSLayer).currentYear,
                    },
                }
            )
        } else {
            const capabilities = await readWmtsCapabilities(layer.baseUrl, i18nStore.lang)
            parsedLayer = wmtsCapabilitiesParser.getExternalLayer(capabilities, layer.id, {
                outputProjection: positionStore.projection,
                initialValues: {
                    opacity: layer.opacity,
                    isVisible: layer.isVisible,
                    customAttributes: layer.customAttributes,
                    currentYear: (layer as ExternalWMTSLayer).currentYear,
                },
            })
        }
        if (parsedLayer) {
            if (layer.timeConfig.currentTimeEntry) {
                timeConfigUtils.updateCurrentTimeEntry(
                    parsedLayer.timeConfig,
                    layer.timeConfig.currentTimeEntry
                )
            }
            if (layer.baseUrl) {
                // in some situations, the baseUrl of the capabilities is different from
                //  the one being given by the user. We ensure we keep the
                // same baseUrl so we can pass the baseUrl check in the `setUpdateLayer`
                // later
                parsedLayer.baseUrl = layer.baseUrl
            }
            parsedLayer.isLoading = false
            layersStore.updateLayer<ExternalWMSLayer | ExternalWMTSLayer>(
                parsedLayer.id,
                parsedLayer,
                dispatcher
            )
        } else {
            throw new Error('Failed to parse/find capabilities for a WMS/WMTS layer')
        }
    } catch (error) {
        log.error({
            title: 'Layers store / loadLayerFromCapabilities',
            titleColor: LogPreDefinedColor.Orange,
            messages: ['Error while loading capabilities for a WMS/WMTS layer', layer, error],
        })

        let errorMessage: ErrorMessage
        if (error instanceof CapabilitiesError && error.key) {
            errorMessage = new ErrorMessage(error.key)
        } else if (error instanceof Error) {
            errorMessage = new ErrorMessage(error.message)
        } else {
            errorMessage = new ErrorMessage('error')
        }
        layersStore.addLayerError(
            layer.id,
            {
                isExternal: layer.isExternal,
                baseUrl: layer.baseUrl,
            },
            errorMessage,
            dispatcher
        )
    }
}
