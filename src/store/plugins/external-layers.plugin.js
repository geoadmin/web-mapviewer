/**
 * External Layer plugin
 *
 * This plugin listen on the addition of external layers and trigger layer attribute update when a
 * layer has been added from the URL and is missing some attributes that needs to be read from an
 * external resources like the GetCapabilities endpoint of the external layer
 */

import ExternalLayer from '@/api/layers/ExternalLayer.class'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import log from '@/utils/logging'
import { readWmsCapabilities, readWmtsCapabilities } from '@/api/layers/layers-external.api'

/**
 * Load External layers attributes (title, abstract, extent, attributions, ...) on layer added
 *
 * @param {Vuex.Store} store
 */
export default function loadExternalLayerAttributes(store) {
    store.subscribe((mutation, state) => {
        if (
            mutation.type === 'addLayer' &&
            mutation.payload.layer instanceof ExternalLayer &&
            mutation.payload.layer.isLoading
        ) {
            log.debug(
                `Loading state external layer added, trigger attribute updated`,
                mutation,
                state
            )
            updateExternalLayer(store, mutation.payload.layer, state.position.projection)
        }
    })
}

async function updateExternalLayer(store, externalLayer, projection) {
    try {
        let updatedExternalLayer = null
        if (
            externalLayer instanceof ExternalWMSLayer ||
            externalLayer instanceof ExternalGroupOfLayers
        ) {
            updatedExternalLayer = await updatedWMSLayerAttributes(externalLayer, projection)
        } else if (externalLayer instanceof ExternalWMTSLayer) {
            updatedExternalLayer = await updatedWMTSLayerAttributes(externalLayer, projection)
        } else {
            throw Error(`Unsupported type of layer: ${typeof externalLayer}`)
        }

        updatedExternalLayer.isLoading = false
        store.commit('updateLayer', { layer: updatedExternalLayer })
    } catch (error) {
        log.error(`Failed to update external layer: ${error}`)
    }
}

async function updatedWMSLayerAttributes(externalLayer, projection) {
    const capabilities = await readWmsCapabilities(externalLayer.baseURL)

    const layer = capabilities.findLayer(externalLayer.externalLayerId)
    if (!layer) {
        throw Error(`No layer ${externalLayer.externalLayerId} found in Capabilities`)
    }
    const newObject = capabilities.getExternalLayerObject(
        layer,
        projection,
        externalLayer.opacity,
        externalLayer.visible
    )
    if (!newObject) {
        throw Error(
            `Failed to update external layer ${externalLayer.getID()}: no layerId found in get cap`
        )
    }
    return newObject
}

async function updatedWMTSLayerAttributes(externalLayer, projection) {
    const capabilities = await readWmtsCapabilities(externalLayer.baseURL)

    const layer = capabilities.findLayer(externalLayer.externalLayerId)
    if (!layer) {
        throw Error(`No layer ${externalLayer.externalLayerId} found in Capabilities`)
    }
    const newObject = capabilities.getExternalLayerObject(
        layer,
        projection,
        externalLayer.opacity,
        externalLayer.visible
    )
    if (!newObject) {
        throw Error(
            `Failed to update external layer ${externalLayer.getID()}: no layerId found in get cap`
        )
    }
    return newObject
}
