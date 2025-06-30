/**
 * External Layer plugin
 *
 * This plugin listen on the addition of external layers and trigger layer attribute update when a
 * layer has been added from the URL and is missing some attributes that needs to be read from an
 * external resources like the GetCapabilities endpoint of the external layer
 */

import { LayerType } from '@geoadmin/layers'
import log from '@geoadmin/log'
import { ErrorMessage } from '@geoadmin/log/Message'

import { readWmsCapabilities, readWmtsCapabilities } from '@/api/layers/layers-external.api'

const dispatcher = { dispatcher: 'external-layers.plugin' }

/**
 * Load External layers attributes (title, abstract, extent, attributions, ...) on layer added
 *
 * @param {Vuex.Store} store
 */
export default function loadExternalLayerAttributes(store) {
    const layersSubscriber = async (layers, state) => {
        const externalLayers = layers.filter(
            (layer) =>
                layer.isLoading &&
                layer.isExternal &&
                ![LayerType.KML, LayerType.GPX, LayerType.GEOJSON].includes(layer.type)
        )
        if (externalLayers.length > 0) {
            // We get first the capabilities
            const wmsCapabilities = getWMSCababilitiesForLayers(externalLayers)
            const wmtsCapabilities = getWMTSCababilitiesForLayers(externalLayers)
            const updatedLayers = []
            externalLayers.forEach((layer) => {
                updatedLayers.push(
                    updateExternalLayer(
                        store,
                        layer.type === LayerType.WMTS
                            ? wmtsCapabilities[layer.baseUrl]
                            : wmsCapabilities[layer.baseUrl],
                        layer,
                        state.position.projection
                    )
                )
            })
            store.dispatch('updateLayers', {
                layers: (await Promise.all(updatedLayers)).filter((layer) => !!layer),
                ...dispatcher,
            })
        }
    }
    store.subscribe((mutation, state) => {
        if (mutation.type === 'addLayer') {
            layersSubscriber([mutation.payload.layer], state)
        }
        if (mutation.type === 'setLayers') {
            layersSubscriber(mutation.payload.layers, state)
        }
    })
}

function getWMSCababilitiesForLayers(layers) {
    const capabilities = {}
    // here we use a Set to take the unique URL to avoid loading multiple times the get capabilities
    // for example when adding several layers from the same source.
    new Set(
        layers
            .filter((layer) => layer.type === LayerType.WMS && layer.isExternal)
            .map((layer) => layer.baseUrl)
    ).forEach((url) => {
        capabilities[url] = readWmsCapabilities(url)
    })
    return capabilities
}

function getWMTSCababilitiesForLayers(layers) {
    const capabilities = {}
    // here we use a Set to take the unique URL to avoid loading multiple times the get capabilities
    // for example when adding several layers from the same source.
    const externalWMTSLayers = layers.filter(
        (layer) => layer.type === LayerType.WMTS && layer.isExternal
    )

    new Set(externalWMTSLayers.map((layer) => layer.baseUrl)).forEach((url) => {
        capabilities[url] = readWmtsCapabilities(url)
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
            layer.visible,
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
