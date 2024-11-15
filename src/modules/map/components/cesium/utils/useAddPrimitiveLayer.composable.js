import { onBeforeUnmount, onMounted } from 'vue'

import enhanceLabelStyle from '@/modules/map/components/cesium/utils/enhanceLabelStyle'
import log from '@/utils/logging'

/**
 * @param {Viewer} cesiumViewer
 * @param {Promise<Cesium3DTileset> | Cesium3DTileset} tileSet
 */
export default function useAddPrimitiveLayer(cesiumViewer, tileSet, options = {}) {
    let layer

    const { withEnhancedLabelStyle = false } = options

    onMounted(async () => {
        try {
            const loadedTileSet = await tileSet
            if (withEnhancedLabelStyle) {
                loadedTileSet.style = enhanceLabelStyle
            }
            layer = cesiumViewer.scene.primitives.add(loadedTileSet)
        } catch (error) {
            log.error('Error while loading tileset for', tileSet, error)
        }
    })

    onBeforeUnmount(() => {
        if (layer) {
            layer.show = false
            cesiumViewer.scene.primitives.remove(layer)
            cesiumViewer.scene.requestRender()
        }
    })
}
