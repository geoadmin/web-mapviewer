/**
 * External Layer plugin
 *
 * This plugin listen on the addition of external layers and trigger layer attribute update when a
 * layer has been added from the URL and is missing some attributes that needs to be read from an
 * external resources like the GetCapabilities endpoint of the external layer
 */

import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import ExternalLayer from '@/api/layers/ExternalLayer.class'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import { readWmsCapabilities, readWmtsCapabilities } from '@/api/layers/layers-external.api'
import log from '@/utils/logging'

/**
 * Load External layers attributes (title, abstract, extent, attributions, ...) on layer added
 *
 * @param {Vuex.Store} store
 */
export default function loadExternalLayerAttributes(store) {
    store.subscribe((mutation, state) => {
        if (
            mutation.type === 'addLayer' &&
            mutation.payload instanceof ExternalLayer &&
            mutation.payload.isLoading
        ) {
            log.debug(
                `Loading state external layer added, trigger attribute updated`,
                mutation,
                state
            )
            updateExternalLayer(store, mutation.payload, state.position.projection)
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
            throw new Error(`Unsupported type of layer: ${typeof externalLayer}`)
        }

        updatedExternalLayer.isLoading = false
        store.dispatch('updateLayer', updatedExternalLayer)
    } catch (error) {
        log.error(`Failed to update external layer: `, error)
        const erroredLayer = {
            id: externalLayer.getID(),
            errorKey: error.key ? error.key : 'error',
            hasError: true,
        }
        store.dispatch('updateLayer', erroredLayer)
    }
}

async function updatedWMSLayerAttributes(externalLayer, projection) {
    const capabilities = await readWmsCapabilities(externalLayer.baseURL)
    const newObject = capabilities.getExternalLayerObject(
        externalLayer.externalLayerId,
        projection,
        externalLayer.opacity,
        externalLayer.visible,
        false /* throw Error in case of  error */
    )
    return newObject
}

async function updatedWMTSLayerAttributes(externalLayer, projection) {
    const capabilities = await readWmtsCapabilities(externalLayer.baseURL)
    const newObject = capabilities.getExternalLayerObject(
        externalLayer.externalLayerId,
        projection,
        externalLayer.opacity,
        externalLayer.visible,
        false /* throw Error in case of  error */
    )
    return newObject
}
