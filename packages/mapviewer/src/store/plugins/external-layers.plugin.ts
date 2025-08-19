/**
 * External Layer plugin
 *
 * This plugin listen on the addition of external layers and trigger layer attribute update when a
 * layer has been added from the URL and is missing some attributes that needs to be read from an
 * external resources like the GetCapabilities endpoint of the external layer
 */

import type { Layer } from '@geoadmin/layers'
import { LayerType } from '@geoadmin/layers'
import type { WMSCapabilitiesResponse, WMTSCapabilitiesResponse } from '@geoadmin/layers/parsers'
import { readWmsCapabilities, readWmtsCapabilities } from '@geoadmin/layers/api'
import log from '@geoadmin/log'
import { ErrorMessage } from '@geoadmin/log/Message'

import type { ActionDispatcher } from '@/store/types'
import type { PiniaPlugin, PiniaPluginContext } from 'pinia'
import usePositionStore from '@/store/modules/position.store'
import type { SupportedLang } from '@/modules/i18n'
import { useI18nStore } from '@/store/modules/i18n.store.ts'

const dispatcher: ActionDispatcher = { name: 'external-layers.plugin' }

/** Load External layers attributes (title, abstract, extent, attributions, ...) on layer added */
export const loadExternalLayerAttributes: PiniaPlugin = (context: PiniaPluginContext): void => {

    const positionStore = usePositionStore()
    const i18nStore = useI18nStore()

    const externalLayerFilter = (layer: Layer): boolean => layer.isExternal && layer.isLoading &&
        ![LayerType.KML, LayerType.GPX, LayerType.GEOJSON].includes(layer.type)

    context.store.$onAction(({name, args}) => {
        let layers: Layer[] = []
        if (name === 'addLayer' && args[0]?.layer && externalLayerFilter(args[0].layer)) {
            layers.push(args[0].layer)
        }
        if (name === 'setLayers' && args[0]?.layers && args[0].layers.some(externalLayerFilter) {
            layers.push(...args[0].layers.filter(externalLayerFilter))
        }
        if (layers.length > 0) {
            // We get first the capabilities
            const wmsCapabilities = getWMSCapabilitiesForLayers(layers, i18nStore.lang)
            const wmtsCapabilities = getWMTSCapabilitiesForLayers(layers)
            const updatedLayers: Layer[] = []
            layers.forEach((layer) => {
                updatedLayers.push(
                    updateExternalLayer(
                        layer.type === LayerType.WMTS
                            ? wmtsCapabilities[layer.baseUrl]
                            : wmsCapabilities[layer.baseUrl],
                        layer,
                        positionStore.projection
                    )
                )
            })
            store.dispatch('updateLayers', {
                layers: (await Promise.all(updatedLayers)).filter((layer) => !!layer),
                ...dispatcher,
            })
    })
}

function getWMSCapabilitiesForLayers(layers: Layer[], currentLang: SupportedLang): Record<string, Promise<WMSCapabilitiesResponse | undefined>> {
    const capabilities: Record<string, Promise<WMSCapabilitiesResponse | undefined>> = {}
    // here we use a Set to take the unique URL to avoid loading multiple times the get capabilities,
    // for example, when adding several layers from the same source.
    new Set(
        layers
            .filter((layer) => layer.type === LayerType.WMS && layer.isExternal)
            .map((layer) => layer.baseUrl)
    ).forEach((url: string) => {
        capabilities[url] = readWmsCapabilities(url, currentLang)
    })
    return capabilities
}

function getWMTSCapabilitiesForLayers(layers: Layer[], currentLang: SupportedLang): Record<string, Promise<WMTSCapabilitiesResponse | undefined>> {
    const capabilities = {}
    // here we use a Set to take the unique URL to avoid loading multiple times the get capabilities
    // for example when adding several layers from the same source.
    const externalWMTSLayers = layers.filter(
        (layer) => layer.type === LayerType.WMTS && layer.isExternal
    )

    new Set(externalWMTSLayers.map((layer) => layer.baseUrl)).forEach((url) => {
        capabilities[url] = readWmtsCapabilities(url, currentLang)
    })
    return capabilities
}

async function updateExternalLayer(store, capabilities, layer, projection) {
    try {
        const resolvedCapabilities = await capabilities
        log.debug(
            `Update External layer ${layer.id} with capabilities`,
            layer,
            resolvedCapabilities
        )
        const updated = resolvedCapabilities.getExternalLayerObject(
            layer.id,
            projection,
            layer.opacity,
            layer.isVisible,
            layer.currentYear,
            layer.customAttributes,
            false /* throw Error in case of  error */
        )
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
        log.error(`Failed to update external layer ${layer.id}: `, error)
        store.dispatch('addLayerError', {
            layerId: layer.id,
            isExternal: layer.isExternal,
            baseUrl: layer.baseUrl,
            error: new ErrorMessage(error.key ?? 'error'),
            ...dispatcher,
        })
        return null
    }
}
