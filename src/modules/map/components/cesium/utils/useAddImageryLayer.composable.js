import { onBeforeUnmount, onMounted, toValue, watch } from 'vue'

/**
 * @param {Viewer} cesiumViewer
 * @param {ImageryProvider} provider
 * @param {Ref<Number>} zIndex
 * @param {Ref<Number>} opacity
 */
export default function useAddImageryLayer(cesiumViewer, provider, zIndex, opacity) {
    let layer

    onMounted(() => {
        layer = cesiumViewer.scene.imageryLayers.addImageryProvider(provider, toValue(zIndex))
        layer.alpha = toValue(opacity)
    })

    onBeforeUnmount(() => {
        layer.show = false
        cesiumViewer.scene.imageryLayers.remove(layer)
        cesiumViewer.scene.requestRender()
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
}
