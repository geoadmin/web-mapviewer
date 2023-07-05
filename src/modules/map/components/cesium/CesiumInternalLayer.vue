<template>
    <div>
        <CesiumWMTSLayer
            v-if="layerConfig.type === LayerTypes.WMTS && !layerConfig.isExternal"
            :wmts-layer-config="layerConfig"
            :preview-year="previewYear"
            :projection="WEBMERCATOR"
            :z-index="zIndex"
        />
        <slot />
    </div>
</template>

<script>
import AbstractLayer from '@/api/layers/AbstractLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { LV95, WEBMERCATOR } from '@/utils/coordinateSystems'
import CesiumWMTSLayer from '@/modules/map/components/cesium/CesiumWMTSLayer.vue'

/**
 * Transforms a layer config (metadata, structures can be found in api/layers/** files) into the
 * correct Cesium counterpart depending on the layer type.
 */
export default {
    components: {
        CesiumWMTSLayer,
    },
    props: {
        layerConfig: {
            type: AbstractLayer,
            default: null,
        },
        zIndex: {
            type: Number,
            default: -1,
        },
        previewYear: {
            type: Number,
            default: null,
        },
    },
    data() {
        return {
            LayerTypes,
            LV95,
            WEBMERCATOR,
        }
    },
}
</script>
