import type { ImageryLayer, ImageryProvider, Viewer } from 'cesium'
import type { MaybeRef } from 'vue'

import { onBeforeUnmount, onMounted, toValue, watch } from 'vue'

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
        if (!viewerInstance || viewerInstance.isDestroyed()) {
            return
        }

        if (layer) {
            viewerInstance.scene.imageryLayers.remove(layer)
            layer = undefined
        }
        if (createProvider) {
            const provider = createProvider()
            if (provider) {
                // Validate zIndex is within bounds of imagery layer collection
                const requestedIndex = toValue(zIndex)
                const maxIndex = viewerInstance.scene.imageryLayers.length
                const validIndex = Math.max(0, Math.min(requestedIndex, maxIndex))
                layer = viewerInstance.scene.imageryLayers.addImageryProvider(provider, validIndex)
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
        if (!viewerInstance || viewerInstance.isDestroyed()) {
            layer = undefined
            return
        }
        if (layer) {
            layer.show = false
            viewerInstance.scene.imageryLayers.remove(layer)
            layer = undefined
            if (!viewerInstance.isDestroyed()) {
                viewerInstance.scene.requestRender()
            }
        }
    })

    watch(
        () => toValue(opacity),
        () => {
            const viewerInstance = toValue(cesiumViewer)
            if (!viewerInstance || viewerInstance.isDestroyed() || !layer) {
                return
            }
            layer.alpha = toValue(opacity)
            if (!viewerInstance.isDestroyed()) {
                viewerInstance.scene.requestRender()
            }
        }
    )

    watch(
        () => toValue(zIndex),
        () => {
            const viewerInstance = toValue(cesiumViewer)
            if (!viewerInstance || viewerInstance.isDestroyed() || !layer) {
                return
            }
            const index = viewerInstance.scene.imageryLayers.indexOf(layer)
            if (index === -1) {
                return // Layer not in collection
            }
            const indexDiff = Math.abs(toValue(zIndex) - index)
            for (let i = indexDiff; i !== 0; i--) {
                if (viewerInstance.isDestroyed()) {
                    return // Stop if viewer was destroyed during loop
                }
                if (index > toValue(zIndex)) {
                    viewerInstance.scene.imageryLayers.lower(layer)
                } else {
                    viewerInstance.scene.imageryLayers.raise(layer)
                }
            }
        }
    )

    return {
        refreshLayer,
    }
}
