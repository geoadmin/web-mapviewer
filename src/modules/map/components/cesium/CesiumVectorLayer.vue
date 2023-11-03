<template>
    <slot />
</template>

<script>
import GeoAdminVectorLayer, {
    GeoAdminVectorLayerTypes,
} from '@/api/layers/GeoAdminVectorLayer.class'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { Cesium3DTileset } from 'cesium'

export default {
    inject: ['getViewer'],
    props: {
        vectorLayerConfig: {
            type: GeoAdminVectorLayer,
            required: true,
            validator(value) {
                return value?.vectorLayerType === GeoAdminVectorLayerTypes.CESIUM
            },
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
        this.layer = await Cesium3DTileset.fromUrl(this.vectorLayerConfig.getURL(), {
            // skipLevelOfDetail: true,
            // baseScreenSpaceError: 1024,
            // skipScreenSpaceErrorFactor: 16,
            // skipLevels: 1,
            // immediatelyLoadDesiredLevelOfDetail: false,
            loadSiblings: false,
            // cullWithChildrenBounds: true,
        })
        this.getViewer().scene.primitives.add(this.layer)
    },
    beforeUnmount() {
        const viewer = this.getViewer()
        this.layer.show = false
        viewer.scene.primitives.remove(this.layer)
        viewer.scene.requestRender()
    },
}
</script>
