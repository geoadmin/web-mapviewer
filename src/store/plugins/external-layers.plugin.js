/**
 * External Layer plugin
 *
 * This plugin listen on the addition of external layers and trigger layer attribute update when a
 * layer has been added from the URL and is missing some attributes that needs to be read from an
 * external resources like the GetCapabilities endpoint of the external layer
 */

import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import { readWmsCapabilities, readWmtsCapabilities } from '@/api/layers/layers-external.api'
import log from '@/utils/logging'

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
                (layer instanceof ExternalWMSLayer ||
                    layer instanceof ExternalGroupOfLayers ||
                    layer instanceof ExternalWMTSLayer)
        )
        // We get first the capabilities
        const wmsCapabilities = getWMSCababilitiesForLayers(externalLayers)
        const wmtsCapabilities = getWMTSCababilitiesForLayers(externalLayers)
        const updatedLayers = []
        externalLayers.forEach((layer) => {
            updatedLayers.push(
                updateExternalLayer(
                    store,
                    layer instanceof ExternalWMTSLayer
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
            .filter(
                (layer) =>
                    layer instanceof ExternalWMSLayer || layer instanceof ExternalGroupOfLayers
            )
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
    new Set(
        layers.filter((layer) => layer instanceof ExternalWMTSLayer).map((layer) => layer.baseUrl)
    ).forEach((url) => {
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
            layer.externalLayerId,
            projection,
            layer.opacity,
            layer.visible,
            false /* throw Error in case of  error */
        )
        updated.isLoading = false
        return updated
    } catch (error) {
        log.error(`Failed to update external layer ${layer.id}: `, error)
        store.dispatch('setLayerErrorKey', {
            layerId: layer.id,
            errorKey: error.key ? error.key : 'error',
            ...dispatcher,
        })
        return null
    }
}
