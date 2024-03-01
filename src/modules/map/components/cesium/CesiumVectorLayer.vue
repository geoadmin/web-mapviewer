<template>
    <slot />
</template>

<script>
import GeoAdmin3DLayer from '@/api/layers/GeoAdmin3DLayer.class'
import { loadTileSetAndApplyStyle } from '@/modules/map/components/cesium/utils/primitiveLayerUtils'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'

export default {
    inject: ['getViewer'],
    props: {
        layerConfig: {
            type: GeoAdmin3DLayer,
            required: true,
        },
        previewYear: {
            type: Number,
            default: null,
        },
        projection: {
            type: CoordinateSystem,
            required: true,
        },
        zIndex: {
            type: Number,
            default: -1,
        },
    },
    async mounted() {
        this.layer = this.getViewer().scene.primitives.add(
            await loadTileSetAndApplyStyle(
                this.layerConfig.getURL(),
                this.layerConfig.id === 'ch.swisstopo.swissnames3d.3d'
            )
        )
    },
    beforeUnmount() {
        const viewer = this.getViewer()
        this.layer.show = false
        viewer.scene.primitives.remove(this.layer)
        viewer.scene.requestRender()
    },
}
</script>
