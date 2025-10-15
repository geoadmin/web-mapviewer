import type { ImageryProvider } from 'cesium'
import type { MaybeRef } from 'vue'

import { ImageryLayer, Viewer } from 'cesium'
import { onBeforeUnmount, onMounted, toRef, toValue, watch } from 'vue'

type ProviderFactoryFunction = () => ImageryProvider | undefined

interface UseAddImageryLayerExports {
    refreshLayer: () => void
}

/**
 * Will create a Cesium layer with the provider coming from `createProvider` function call and add
 * it to the cesiumViewer.
 *
 * If opacity or zIndex changes, it will alter the corresponding Cesium layer accordingly.
 *
 * Will remove the layer when unmounted.
 *
 * In case the provider needs to be changed (edited), call the exposed function `refreshLayer` so
 * that the layer will be removed and re-added with a new call to `createProvider` function.
 */
export default function useAddImageryLayer(
    cesiumViewer: MaybeRef<Viewer>,
    createProvider: MaybeRef<ProviderFactoryFunction>,
    zIndex: MaybeRef<number>,
    opacity: MaybeRef<number> = 1.0
): UseAddImageryLayerExports {
    let layer: ImageryLayer | undefined

    function refreshLayer() {
        if (layer) {
            toValue(cesiumViewer).scene.imageryLayers.remove(layer)
        }
        const providerFactory = toValue(createProvider)
        if (providerFactory) {
            const provider = providerFactory()
            if (provider) {
                layer = toValue(cesiumViewer).scene.imageryLayers.addImageryProvider(
                    provider,
                    toValue(zIndex)
                )
            }
        }
    }

    onMounted(() => {
        refreshLayer()
        if (layer) {
            layer.alpha = toValue(opacity)
        }
    })

    onBeforeUnmount(() => {
        if (layer) {
            layer.show = false
            toValue(cesiumViewer).scene.imageryLayers.remove(layer)
            toValue(cesiumViewer).scene.requestRender()
        }
    })

    watch(toRef(opacity), () => {
        if (layer) {
            layer.alpha = toValue(opacity)
            toValue(cesiumViewer).scene.requestRender()
        }
    })
    watch(toRef(zIndex), () => {
        if (layer) {
            const index = toValue(cesiumViewer).scene.imageryLayers.indexOf(layer)
            const indexDiff = Math.abs(toValue(zIndex) - index)
            for (let i = indexDiff; i !== 0; i--) {
                if (index > toValue(zIndex)) {
                    toValue(cesiumViewer).scene.imageryLayers.lower(layer)
                } else {
                    toValue(cesiumViewer).scene.imageryLayers.raise(layer)
                }
            }
        }
    })

    return {
        refreshLayer,
    }
}
