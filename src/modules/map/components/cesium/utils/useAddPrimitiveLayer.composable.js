import { onBeforeUnmount, onMounted } from 'vue'

/**
 * @param {Viewer} cesiumViewer
 * @param {Promise<Cesium3DTileset> | Cesium3DTileset} tileSet
 */
export default function useAddPrimitiveLayer(cesiumViewer, tileSet) {
    let layer

    onMounted(async () => {
        layer = cesiumViewer.scene.primitives.add(await tileSet)
    })

    onBeforeUnmount(() => {
        layer.show = false
        cesiumViewer.scene.primitives.remove(layer)
        cesiumViewer.scene.requestRender()
    })
}
