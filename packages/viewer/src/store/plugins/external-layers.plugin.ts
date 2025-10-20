import type { CoordinateSystem } from '@swissgeo/coordinates'
import type {
    CapabilitiesParser,
    ExternalWMSLayer,
    ExternalWMTSLayer,
    Layer,
    WMSCapabilitiesResponse,
    WMSCapabilityLayer,
    WMTSCapabilitiesResponse,
    WMTSCapabilityLayer,
} from '@swissgeo/layers'
import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import { CapabilitiesError, LayerType } from '@swissgeo/layers'
import { readWmsCapabilities, readWmtsCapabilities } from '@swissgeo/layers/api'
import { wmsCapabilitiesParser, wmtsCapabilitiesParser } from '@swissgeo/layers/parsers'
import { timeConfigUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { ErrorMessage } from '@swissgeo/log/Message'

import type { SupportedLang } from '@/modules/i18n'
import type { ActionDispatcher } from '@/store/types'

import useI18nStore from '@/store/modules/i18n.store'
import useLayersStore, { LayerStoreActions } from '@/store/modules/layers.store'
import usePositionStore from '@/store/modules/position.store'
import { isEnumValue } from '@/utils/utils'

const dispatcher: ActionDispatcher = { name: 'external-layers.plugin' }

function getCapabilitiesForLayers<
    CapabilitiesResponse extends WMSCapabilitiesResponse | WMTSCapabilitiesResponse,
>(
    layers: Layer[],
    currentLang: SupportedLang,
    layerType: LayerType
): Record<string, Promise<CapabilitiesResponse>> {
    const capabilities: Record<string, Promise<CapabilitiesResponse>> = {}
    const baseUrls = layers
        .filter((layer) => layer.type === layerType && layer.isExternal)
        .map((layer) => layer.baseUrl)
    baseUrls
        // unique filter
        .filter((baseUrl, index) => baseUrls.indexOf(baseUrl) === index)
        .forEach((url: string) => {
            if (layerType === LayerType.WMS) {
                // @ts-expect-error For some reason, the type of the capabilities is not correct here
                capabilities[url] = readWmsCapabilities(url, currentLang)
            } else {
                // @ts-expect-error For some reason, the type of the capabilities is not correct here
                capabilities[url] = readWmtsCapabilities(url, currentLang)
            }
        })
    return capabilities
}

async function updateExternalLayer<
    CapabilitiesResponse extends WMSCapabilitiesResponse | WMTSCapabilitiesResponse,
    CapabilitiesLayerType extends WMSCapabilityLayer | WMTSCapabilityLayer,
    ExternalLayerType extends ExternalWMSLayer | ExternalWMTSLayer,
>(
    capabilities: Promise<CapabilitiesResponse>,
    parser: CapabilitiesParser<CapabilitiesResponse, CapabilitiesLayerType, ExternalLayerType>,
    layer: Layer,
    projection: CoordinateSystem
): Promise<ExternalWMSLayer | ExternalWMTSLayer | undefined> {
    const layersStore = useLayersStore()
    try {
        const resolvedCapabilities = await capabilities
        log.debug({
            title: 'External layers pinia plugin',
            titleColor: LogPreDefinedColor.Emerald,
            messages: [
                `Update External layer ${layer.id} with capabilities`,
                layer,
                resolvedCapabilities,
            ],
        })

        if (!resolvedCapabilities) {
            log.error({
                title: 'External layer pinia plugin',
                titleColor: LogPreDefinedColor.Emerald,
                messages: ['Failed to update external layer, no capabilities found', layer],
            })
            return
        }

        const updated = parser.getExternalLayer(resolvedCapabilities, layer.id, {
            outputProjection: projection,
            initialValues: {
                opacity: layer.opacity,
                isVisible: layer.isVisible,
                customAttributes: layer.customAttributes,
            } as ExternalLayerType, // TODO unsure here
            ignoreErrors: false,
        })
        if (!updated) {
            log.error({
                title: 'External layer pinia plugin',
                titleColor: LogPreDefinedColor.Emerald,
                messages: ['Failed to update external layer, no layer found', layer],
            })
            return
        }
        if (layer.timeConfig.currentTimeEntry) {
            timeConfigUtils.updateCurrentTimeEntry(
                updated.timeConfig,
                layer.timeConfig.currentTimeEntry
            )
        }
        if (layer.baseUrl) {
            // in some situations, the baseUrl of the capabilities is not the
            // same as the one being given by the user. We ensure we keep the
            // same baseUrl so we can pass the baseUrl check in the `setUpdateLayer`
            // later
            updated.baseUrl = layer.baseUrl
        }
        updated.isLoading = false
        return updated
    } catch (error) {
        log.error({
            title: 'External layers pinia plugin',
            titleColor: LogPreDefinedColor.Emerald,
            messages: [`Failed to update external layer ${layer.id}: `, error],
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
            {
                layerId: layer.id,
                isExternal: layer.isExternal,
                baseUrl: layer.baseUrl,
                error: errorMessage,
            },
            dispatcher
        )
        return undefined
    }
}

const externalLayerFilter = (layer: Layer): boolean => {
    return (
        layer.isExternal &&
        layer.isLoading &&
        ![LayerType.KML, LayerType.GPX, LayerType.GEOJSON].includes(layer.type)
    )
}

/** Load External layers attributes (title, abstract, extent, attributions, ...) on layer added */
const registerLoadExternalLayerAttributesWatcher: PiniaPlugin = (
    context: PiniaPluginContext
): void => {
    const { store } = context

    store.$onAction(({ name, args }) => {
        const layers: Layer[] = []

        const layerStore = useLayersStore()
        const positionStore = usePositionStore()
        const i18nStore = useI18nStore()

        if (isEnumValue<LayerStoreActions>(LayerStoreActions.AddLayer, name)) {
            const [payload] = args as Parameters<typeof layerStore.addLayer>

            if (payload.layer && externalLayerFilter(payload.layer)) {
                layers.push(payload.layer)
            }
        } else if (isEnumValue<LayerStoreActions>(LayerStoreActions.SetLayers, name)) {
            const [layerArg] = args as Parameters<typeof layerStore.setLayers>

            const externalLayers = layerArg
                // if it's string, we don't even test for externality
                .filter((layer) => typeof layer !== 'string')
                .filter(externalLayerFilter)

            layers.push(...externalLayers)
        }

        if (layers.length > 0) {
            // We get first the capabilities
            const wmsCapabilities = getCapabilitiesForLayers<WMSCapabilitiesResponse>(
                layers,
                i18nStore.lang,
                LayerType.WMS
            )
            const wmtsCapabilities = getCapabilitiesForLayers<WMTSCapabilitiesResponse>(
                layers,
                i18nStore.lang,
                LayerType.WMTS
            )
            const layerToUpdate: Promise<ExternalWMSLayer | ExternalWMTSLayer | undefined>[] = []
            layers.forEach((layer) => {
                if (layer.type === LayerType.WMTS) {
                    layerToUpdate.push(
                        updateExternalLayer<
                            WMTSCapabilitiesResponse,
                            WMTSCapabilityLayer,
                            ExternalWMTSLayer
                        >(
                            wmtsCapabilities[layer.baseUrl]!,
                            wmtsCapabilitiesParser,
                            layer,
                            positionStore.projection
                        )
                    )
                } else {
                    layerToUpdate.push(
                        updateExternalLayer<
                            WMSCapabilitiesResponse,
                            WMSCapabilityLayer,
                            ExternalWMSLayer
                        >(
                            wmsCapabilities[layer.baseUrl]!,
                            wmsCapabilitiesParser,
                            layer,
                            positionStore.projection
                        )
                    )
                }
            })
            Promise.allSettled(layerToUpdate)
                .then((results) => {
                    const updatedLayer: Layer[] = results
                        .map((layer) => {
                            if (layer.status === 'fulfilled' && layer.value) {
                                return layer.value
                            }
                        })
                        .filter((layer) => !!layer)
                    layerStore.updateLayers(updatedLayer, dispatcher)
                })
                .catch((error) => {
                    log.error({
                        title: 'External layers pinia plugin',
                        titleColor: LogPreDefinedColor.Emerald,
                        messages: ['Error while updating external layers', error],
                    })
                })
        }
    })
}

export default registerLoadExternalLayerAttributesWatcher
