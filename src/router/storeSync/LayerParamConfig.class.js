import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { API_SERVICE_KML_BASE_URL } from '@/config'
import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'
import layersParamParser from '@/router/storeSync/layersParamParser'
import log from '@/utils/logging'

/**
 * Transform a layer metadata into a string. This value can then be used in the URL to describe a
 * layer and its state (visibility, opacity, etc...)
 *
 * @param {AbstractLayer} layer
 * @param {GeoAdminLayer} [defaultLayerConfig]
 * @returns {string}
 */
export function transformLayerIntoUrlString(layer, defaultLayerConfig) {
    let layerUrlString = layer.getID()
    if (layer.timeConfig && layer.timeConfig.timeEntries.length > 1) {
        layerUrlString += `@year=${layer.timeConfig.currentYear}`
    }
    if (!layer.visible) {
        layerUrlString += `,f`
    }
    // if no default layers config (e.g. external layers) or if the opacity is not the same as the default one
    if (!defaultLayerConfig || layer.opacity !== defaultLayerConfig.opacity) {
        if (layer.visible) {
            layerUrlString += ','
        }
        layerUrlString += `,${layer.opacity}`
    }
    return layerUrlString
}

/**
 * Parse layers such as described in
 * https://github.com/geoadmin/web-mapviewer/blob/develop/adr/2021_03_16_url_param_structure.md#layerid
 *
 * @param {ActiveLayerConfig} parsedLayer
 * @returns {KMLLayer | ExternalWMTSLayer | ExternalWMSLayer | null} Will return an instance of the
 *   corresponding layer if the given layer is an external one, otherwise returns `null`
 */
export function createLayerObject(parsedLayer) {
    let layer = parsedLayer
    // format is KML|FILE_URL|LAYER_NAME
    if (parsedLayer.id.startsWith('KML|') && parsedLayer.id.split('|').length === 3) {
        const splitLayerId = parsedLayer.id.split('|')
        const kmlUrl = splitLayerId[1]
        layer = new KMLLayer(
            kmlUrl,
            parsedLayer.visible,
            parsedLayer.opacity,
            null, // fileId, null := parsed from url
            parsedLayer.customAttributes.adminId,
            splitLayerId[2], // name
            null, // kmlMetadata will be loaded whenever the layer is added to the map
            false, // no tooltip
            kmlUrl.indexOf(API_SERVICE_KML_BASE_URL) === -1,
            true // isLoading, as we need to load this layer's metadata dans file data before adding it
        )
    }
    // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID
    else if (parsedLayer.id.startsWith('WMTS|')) {
        const [_externalLayerType, wmtsServerGetCapabilitiesUrl, wmtsLayerId] =
            parsedLayer.id.split('|')
        layer = new ExternalWMTSLayer(
            wmtsLayerId,
            parsedLayer.opacity,
            parsedLayer.visible,
            wmtsServerGetCapabilitiesUrl,
            wmtsLayerId
        )
    }
    // format is : WMS|BASE_URL|LAYER_ID
    else if (parsedLayer.id.startsWith('WMS|')) {
        const [_externalLayerType, wmsServerBaseURL, wmsLayerId] = parsedLayer.id.split('|')
        layer = new ExternalWMSLayer(
            wmsLayerId,
            parsedLayer.opacity,
            parsedLayer.visible,
            wmsServerBaseURL,
            wmsLayerId
        )
    }
    // format is : GRP|BASE_URL|LAYER_ID
    else if (parsedLayer.id.startsWith('GRP|')) {
        const [_externalLayerType, serverBaseURL, layerId] = parsedLayer.id.split('|')
        layer = new ExternalGroupOfLayers(
            layerId,
            parsedLayer.opacity,
            parsedLayer.visible,
            serverBaseURL,
            layerId
        )
    }
    return layer
}

function dispatchLayersFromUrlIntoStore(store, urlParamValue) {
    const parsedLayers = layersParamParser(urlParamValue)
    const promisesForAllDispatch = []
    log.debug(
        `Dispatch Layers from URL into store: ${urlParamValue}`,
        store.state.layers.activeLayers,
        parsedLayers
    )
    // going through layers that are already present to set opacity / visibility
    store.state.layers.activeLayers.forEach((activeLayer) => {
        const matchingLayerMetadata = parsedLayers.find((layer) => layer.id === activeLayer.getID())
        if (matchingLayerMetadata) {
            log.debug(
                `  Update layer ${activeLayer.getID()} parameters (visible, opacity,...); new:`,
                matchingLayerMetadata,
                `current:`,
                activeLayer
            )
            if (matchingLayerMetadata.opacity) {
                if (activeLayer.opacity !== matchingLayerMetadata.opacity) {
                    promisesForAllDispatch.push(
                        store.dispatch('setLayerOpacity', {
                            layerId: activeLayer.getID(),
                            opacity: matchingLayerMetadata.opacity,
                        })
                    )
                }
            } else {
                // checking if this active layer's opacity matches the default opacity from the config
                const configForThisLayer = store.getters.getLayerConfigById(activeLayer.getID())
                if (configForThisLayer && configForThisLayer.opacity !== activeLayer.opacity) {
                    promisesForAllDispatch.push(
                        store.dispatch('setLayerOpacity', {
                            layerId: activeLayer.getID(),
                            opacity: configForThisLayer.opacity,
                        })
                    )
                }
            }
            if (activeLayer.visible !== matchingLayerMetadata.visible) {
                promisesForAllDispatch.push(
                    store.dispatch('setLayerVisibility', {
                        layerId: activeLayer.getID(),
                        visible: matchingLayerMetadata.visible,
                    })
                )
            }
        } else {
            // this layer has to be removed (not present in the URL anymore)
            log.debug(`  Remove layer ${activeLayer.getID()} from active layers`)
            promisesForAllDispatch.push(store.dispatch('removeLayer', activeLayer.getID()))
        }
    })
    // adding any layer that is not present yet
    parsedLayers.forEach((parsedLayer) => {
        if (
            !store.state.layers.activeLayers.find(
                (activeLayer) => activeLayer.getID() === parsedLayer.id
            )
        ) {
            const layerObject = createLayerObject(parsedLayer)
            if (layerObject.type === LayerTypes.KML && layerObject.adminId) {
                promisesForAllDispatch.push(store.commit('setShowDrawingOverlay', true))
            }
            log.debug(`  Add layer ${parsedLayer.id} to active layers`, layerObject)
            promisesForAllDispatch.push(store.dispatch('addLayer', layerObject))
        }
    })
    // setting year fore timed layers if specified in the URL
    parsedLayers
        .filter((layer) => layer.customAttributes && layer.customAttributes.year)
        .forEach((timedLayer) => {
            log.debug(`  Set year to timed layer ${timedLayer.id}`, timedLayer)
            promisesForAllDispatch.push(
                store.dispatch('setTimedLayerCurrentYear', {
                    layerId: timedLayer.id,
                    year: timedLayer.customAttributes.year,
                })
            )
        })
    return Promise.all(promisesForAllDispatch)
}

function generateLayerUrlParamFromStoreValues(store) {
    return store.state.layers.activeLayers
        .map((layer) =>
            transformLayerIntoUrlString(
                layer,
                store.state.layers.config.find((config) => config.getID() === layer.getID())
            )
        )
        .join(';')
}

export default class LayerParamConfig extends AbstractParamConfig {
    constructor() {
        super(
            'layers',
            [
                'toggleLayerVisibility',
                'addLayer',
                'removeLayerWithId',
                'clearLayers',
                'moveActiveLayerFromIndexToIndex',
                'setLayerOpacity',
                'setLayerYear',
            ].join(','),
            dispatchLayersFromUrlIntoStore,
            generateLayerUrlParamFromStoreValues,
            true,
            String
        )
    }
}
