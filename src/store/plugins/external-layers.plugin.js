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
        // Hack for legacy group of external layers, in this case the URL was with WMS|| and
        // in the legacy parameters plugin we have no possibility to differentiate between
        // group of layers and regular WMS layer, therefore if we don't find the layer in the
        // active layers try to find it using the legacy group of layer type
        const legacyGroupOfLayerId = updatedExternalLayer.getID().replace('GRP|', 'WMS|')
        if (store.getters.getActiveLayerById(updatedExternalLayer.getID())) {
            store.dispatch('updateLayer', updatedExternalLayer)
        } else if (store.getters.getActiveLayerById(legacyGroupOfLayerId)) {
            // This is a legacy group of wms layer
            store.dispatch('removeLayer', legacyGroupOfLayerId)
            store.dispatch('addLayer', updatedExternalLayer)
        } else {
            throw new Error(`Layer ${updatedExternalLayer.getID()} not found`)
        }
    } catch (error) {
        log.error(`Failed to update external layer: `, error)
    }
}

async function updatedWMSLayerAttributes(externalLayer, projection) {
    const capabilities = await readWmsCapabilities(externalLayer.baseURL)
    const newObject = capabilities.getExternalLayerObject(
        externalLayer.externalLayerId,
        projection,
        externalLayer.opacity,
        externalLayer.visible
    )
    if (!newObject) {
        throw new Error(
            `Failed to update external layer ${externalLayer.getID()}: no layerId found in get cap`
        )
    }
    return newObject
}

async function updatedWMTSLayerAttributes(externalLayer, projection) {
    const capabilities = await readWmtsCapabilities(externalLayer.baseURL)
    const newObject = capabilities.getExternalLayerObject(
        externalLayer.externalLayerId,
        projection,
        externalLayer.opacity,
        externalLayer.visible
    )
    if (!newObject) {
        throw new Error(
            `Failed to update external layer ${externalLayer.getID()}: no layerId found in get cap`
        )
    }
    return newObject
}
