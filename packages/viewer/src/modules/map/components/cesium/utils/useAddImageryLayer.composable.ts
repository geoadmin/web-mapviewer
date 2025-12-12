import type { ImageryProvider } from 'cesium'
import type { ImageryLayer, Viewer } from 'cesium'
import type { MaybeRef } from 'vue'

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
    cesiumViewer: MaybeRef<Viewer | undefined>,
    createProvider: ProviderFactoryFunction,
    zIndex: MaybeRef<number>,
    opacity: MaybeRef<number> = 1.0
): UseAddImageryLayerExports {
    let layer: ImageryLayer | undefined

    function refreshLayer() {
        const viewerInstance = toValue(cesiumViewer)
        if (!viewerInstance) {
            return
        }

        if (layer) {
            viewerInstance.scene.imageryLayers.remove(layer)
        }
        if (createProvider) {
            const provider = createProvider()
            if (provider) {
                layer = viewerInstance.scene.imageryLayers.addImageryProvider(
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
        const viewerInstance = toValue(cesiumViewer)
        if (layer && viewerInstance) {
            layer.show = false
            viewerInstance.scene.imageryLayers.remove(layer)
            viewerInstance.scene.requestRender()
        }
    })

    watch(toRef(opacity), () => {
        const viewerInstance = toValue(cesiumViewer)
        if (layer && viewerInstance) {
            layer.alpha = toValue(opacity)
            viewerInstance.scene.requestRender()
        }
    })
    watch(toRef(zIndex), () => {
        const viewerInstance = toValue(cesiumViewer)
        if (layer && viewerInstance) {
            const index = viewerInstance.scene.imageryLayers.indexOf(layer)
            const indexDiff = Math.abs(toValue(zIndex) - index)
            for (let i = indexDiff; i !== 0; i--) {
                if (index > toValue(zIndex)) {
                    viewerInstance.scene.imageryLayers.lower(layer)
                } else {
                    viewerInstance.scene.imageryLayers.raise(layer)
                }
            }
        }
    })

    return {
        refreshLayer,
    }
}
