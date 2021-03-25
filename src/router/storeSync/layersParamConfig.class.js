import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'
import layersParamParser from '@/router/storeSync/layersParamParser'

function transformLayerIntoUrlString(layer, defaultLayerConfig) {
    let layerUrlString = layer.id
    if (!layer.visible) {
        layerUrlString += `,f`
    }
    if (layer.opacity !== defaultLayerConfig.opacity) {
        if (layer.visible) {
            layerUrlString += ','
        }
        layerUrlString += `,${layer.opacity}`
    }
    // TODO: handle custom param
    return layerUrlString
}

function dispatchLayersFromUrlIntoStore(store, urlParamValue) {
    const parsedLayers = layersParamParser(urlParamValue)
    const promisesForAllDispatch = []
    // going through layers that are already present to set opacity / visibility
    store.state.layers.activeLayers.forEach((activeLayer) => {
        const matchingLayerMetadata = parsedLayers.find((layer) => layer.id === activeLayer.id)
        if (matchingLayerMetadata) {
            if (matchingLayerMetadata.opacity) {
                if (activeLayer.opacity !== matchingLayerMetadata.opacity) {
                    promisesForAllDispatch.push(
                        store.dispatch('setLayerOpacity', {
                            layerId: activeLayer.id,
                            opacity: matchingLayerMetadata.opacity,
                        })
                    )
                }
            } else {
                // checking if this active layer's opacity matches the default opacity from the config
                const configForThisLayer = store.getters.getLayerForId(activeLayer.id)
                if (configForThisLayer.opacity !== activeLayer.opacity) {
                    promisesForAllDispatch.push(
                        store.dispatch('setLayerOpacity', {
                            layerId: activeLayer.id,
                            opacity: configForThisLayer.opacity,
                        })
                    )
                }
            }
            if (activeLayer.visible !== matchingLayerMetadata.visible) {
                promisesForAllDispatch.push(store.dispatch('toggleLayerVisibility', activeLayer.id))
            }
        } else {
            // this layer has to be removed (not present in the URL anymore)
            promisesForAllDispatch.push(store.dispatch('removeLayer', activeLayer.id))
        }
    })
    // adding any layer that is not present yet
    parsedLayers.forEach((layer) => {
        if (!store.state.layers.activeLayers.find((activeLayer) => activeLayer.id === layer.id)) {
            promisesForAllDispatch.push(store.dispatch('addLayer', layer.id))
            if (layer.opacity) {
                promisesForAllDispatch.push(
                    store.dispatch('setLayerOpacity', {
                        layerId: layer.id,
                        opacity: layer.opacity,
                    })
                )
            }
            if (!layer.visible) {
                promisesForAllDispatch.push(store.dispatch('toggleLayerVisibility', layer.id))
            }
        }
    })
    return Promise.all(promisesForAllDispatch)
}

function generateLayerUrlParamFromStoreValues(store) {
    return store.state.layers.activeLayers
        .map((layer) =>
            transformLayerIntoUrlString(
                layer,
                store.state.layers.config.find((config) => config.id === layer.id)
            )
        )
        .join(';')
}

export default class LayerParamConfig extends AbstractParamConfig {
    constructor() {
        super(
            'layers',
            'toggleLayerVisibility,addLayer,removeLayer,moveActiveLayerFromIndexToIndex,setLayerOpacity',
            dispatchLayersFromUrlIntoStore,
            generateLayerUrlParamFromStoreValues,
            String
        )
    }
}
