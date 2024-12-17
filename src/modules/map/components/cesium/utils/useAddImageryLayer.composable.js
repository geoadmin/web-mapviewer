import { onBeforeUnmount, onMounted, toValue, watch } from 'vue'

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
 *
 * @param {Viewer} cesiumViewer
 * @param {Function<ImageryProvider>} createProvider
 * @param {Ref<Number>} zIndex
 * @param {Ref<Number>} opacity
 * @returns {{ refreshLayer: Function }}
 */
export default function useAddImageryLayer(cesiumViewer, createProvider, zIndex, opacity) {
    let layer

    function refreshLayer() {
        if (layer) {
            cesiumViewer.scene.imageryLayers.remove(layer)
        }
        const provider = createProvider()
        if (provider) {
            layer = cesiumViewer.scene.imageryLayers.addImageryProvider(provider, toValue(zIndex))
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
            cesiumViewer.scene.imageryLayers.remove(layer)
            cesiumViewer.scene.requestRender()
        }
    })

    watch(opacity, () => {
        if (layer) {
            layer.alpha = toValue(opacity)
            cesiumViewer.scene.requestRender()
        }
    })
    watch(zIndex, () => {
        if (layer) {
            const index = cesiumViewer.scene.imageryLayers.indexOf(layer)
            const indexDiff = Math.abs(toValue(zIndex) - index)
            for (let i = indexDiff; i !== 0; i--) {
                if (index > zIndex) {
                    cesiumViewer.scene.imageryLayers.lower(layer)
                } else {
                    cesiumViewer.scene.imageryLayers.raise(layer)
                }
            }
        }
    })

    return {
        refreshLayer,
    }
}
