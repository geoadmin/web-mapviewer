import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import GPXLayer from '@/api/layers/GPXLayer.class.js'
import KMLLayer from '@/api/layers/KMLLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import AbstractParamConfig, {
    STORE_DISPATCHER_ROUTER_PLUGIN,
} from '@/router/storeSync/abstractParamConfig.class'
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
 * @param {ActiveLayerConfig} parsedLayer Layer config parsed from URL
 * @param {AbstractLayer | null} currentLayer Current layer if it is found in active layers
 * @returns {KMLLayer | ExternalWMTSLayer | ExternalWMSLayer | null} Will return an instance of the
 *   corresponding layer if the given layer is an external one, otherwise returns `null`
 */
export function createLayerObject(parsedLayer, currentLayer) {
    let layer = parsedLayer
    const [layerType, url, id] = parsedLayer.id.split('|')
    if (['KML', 'GPX', 'WMTS', 'WMS'].includes(layerType) && currentLayer) {
        // the layer is already present in the active layers, so simply update it instead of
        // replacing it. This allow to avoid reloading the data of the layer (e.g. KML name, external
        // layer display name) when using the browser history navigation.
        layer = currentLayer.clone()
        layer.visible = parsedLayer.visible
        layer.opacity = parsedLayer.opacity
        if (parsedLayer.customAttributes?.adminId) {
            layer.adminId = parsedLayer.customAttributes.adminId
        }
    } else if (layerType === 'KML') {
        // format is KML|FILE_URL
        if (url.startsWith('http')) {
            layer = new KMLLayer(
                url,
                parsedLayer.visible,
                parsedLayer.opacity,
                parsedLayer.customAttributes.adminId
            )
        } else {
            // If the url does not start with http, then it is a local file and we don't add it
            // to the layer list upon start as we cannot load it anymore.
            layer = null
        }
    }
    // format is GPX|FILE_URL
    else if (layerType === 'GPX') {
        if (url.startsWith('http')) {
            layer = new GPXLayer(url, parsedLayer.visible, parsedLayer.opacity)
        } else {
            // we can't re-load GPX files loaded through a file import; this GPX file is ignored
            layer = null
        }
    }
    // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID
    else if (layerType === 'WMTS') {
        layer = new ExternalWMTSLayer(id, parsedLayer.opacity, parsedLayer.visible, url, id)
    }
    // format is : WMS|BASE_URL|LAYER_ID
    else if (layerType === 'WMS') {
        // here we assume that is a regular WMS layer, upon parsing of the WMS get capabilities
        // the layer might be updated to an external group of layers if needed.
        layer = new ExternalWMSLayer(id, parsedLayer.opacity, parsedLayer.visible, url, id)
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

    const layers = parsedLayers.map((parsedLayer) => {
        // First check if we already have the layer in the active layers
        const currentLayer = store.getters.getActiveLayerById(parsedLayer.id)
        const layerObject = createLayerObject(parsedLayer, currentLayer)
        if (layerObject) {
            if (layerObject.type === LayerTypes.KML && layerObject.adminId) {
                promisesForAllDispatch.push(
                    store.dispatch('setShowDrawingOverlay', {
                        showDrawingOverlay: true,
                        dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN,
                    })
                )
            }
            log.debug(`  Add layer ${parsedLayer.id} to active layers`, layerObject)
        }
        return layerObject
    })
    promisesForAllDispatch.push(
        store.dispatch('setLayers', { layers: layers, dispatcher: STORE_DISPATCHER_ROUTER_PLUGIN })
    )

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
                'setLayers',
            ].join(','),
            dispatchLayersFromUrlIntoStore,
            generateLayerUrlParamFromStoreValues,
            true,
            String
        )
    }
}
