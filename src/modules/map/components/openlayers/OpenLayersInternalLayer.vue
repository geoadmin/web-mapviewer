<script setup>
/**
 * Transforms a layer config (metadata, structures can be found in api/layers/** files) into the
 * correct OpenLayers counterpart depending on the layer type.
 */

import { computed, toRefs } from 'vue'
import { useStore } from 'vuex'

import AbstractLayer from '@/api/layers/AbstractLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import OpenLayersCOGTiffLayer from '@/modules/map/components/openlayers/OpenLayersCOGTiffLayer.vue'
import OpenLayersExternalWMTSLayer from '@/modules/map/components/openlayers/OpenLayersExternalWMTSLayer.vue'
import OpenLayersGeoJSONLayer from '@/modules/map/components/openlayers/OpenLayersGeoJSONLayer.vue'
import OpenLayersGPXLayer from '@/modules/map/components/openlayers/OpenLayersGPXLayer.vue'
import OpenLayersKMLLayer from '@/modules/map/components/openlayers/OpenLayersKMLLayer.vue'
import OpenLayersVectorLayer from '@/modules/map/components/openlayers/OpenLayersVectorLayer.vue'
import OpenLayersWMSLayer from '@/modules/map/components/openlayers/OpenLayersWMSLayer.vue'
import OpenLayersWMTSLayer from '@/modules/map/components/openlayers/OpenLayersWMTSLayer.vue'
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'

const props = defineProps({
    layerConfig: {
        type: AbstractLayer,
        default: null,
    },
    parentLayerOpacity: {
        type: Number,
        default: null,
    },
    zIndex: {
        type: Number,
        default: -1,
    },
})
const { layerConfig, parentLayerOpacity, zIndex } = toRefs(props)

const store = useStore()
const projection = computed(() => store.state.position.projection)
const resolution = computed(() => store.getters.resolution)

function shouldAggregateSubLayerBeVisible(subLayer) {
    // min and max resolution are set in the API file to the lowest/highest possible value if undefined, so we don't
    // have to worry about checking their validity
    return resolution.value >= subLayer.minResolution && resolution.value <= subLayer.maxResolution
}
</script>

<template>
    <div>
        <!--
            Vector layers are only allowed whenever we use the WebMercator projection
            (won't work on LV95 yet, as MapLibre doesn't support other projection systems yet)

            no source exclusion when adding VT layer through here,
            this is only required in the case the layer is under another
            (see OpenLayersMap main component)
        -->
        <OpenLayersVectorLayer
            v-if="projection.epsg === WEBMERCATOR.epsg && layerConfig.type === LayerTypes.VECTOR"
            :vector-layer-config="layerConfig"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <OpenLayersWMTSLayer
            v-if="layerConfig.type === LayerTypes.WMTS && !layerConfig.isExternal"
            :wmts-layer-config="layerConfig"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <OpenLayersExternalWMTSLayer
            v-if="layerConfig.type === LayerTypes.WMTS && layerConfig.isExternal"
            :external-wmts-layer-config="layerConfig"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <!-- as external and internal (geoadmin) WMS layers can be managed the same way,
             we do not have a specific component for external layers but we reuse the one for geoadmin's layers-->
        <OpenLayersWMSLayer
            v-if="layerConfig.type === LayerTypes.WMS"
            :wms-layer-config="layerConfig"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <OpenLayersGeoJSONLayer
            v-if="layerConfig.type === LayerTypes.GEOJSON"
            :geo-json-config="layerConfig"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <div v-if="layerConfig.type === LayerTypes.GROUP">
            <OpenLayersInternalLayer
                v-for="(layer, index) in layerConfig.layers"
                :key="`${layer.id}-${index}`"
                :layer-config="layer"
                :parent-layer-opacity="layerConfig.opacity"
                :z-index="zIndex + index"
            />
        </div>
        <!--
        Aggregate layers are some kind of a edge case where two or more layers are joint together but only one of them
        is visible depending on the map resolution.
        We have to manage aggregate layers straight here otherwise we won't be able to make a recursive call to this
        component in another child (that would be OpenLayersAggregateLayer.vue component, that doesn't work).
        See https://vuejs.org/v2/guide/components-edge-cases.html#Recursive-Components for more info
        -->
        <div v-if="layerConfig.type === LayerTypes.AGGREGATE">
            <!-- we can't v-for and v-if at the same time, so we need to wrap all sub-layers in a <div> -->
            <div
                v-for="aggregateSubLayer in layerConfig.subLayers"
                :key="aggregateSubLayer.subLayerId"
            >
                <OpenLayersInternalLayer
                    v-if="shouldAggregateSubLayerBeVisible(aggregateSubLayer)"
                    :layer-config="aggregateSubLayer.layer"
                    :parent-layer-opacity="layerConfig.opacity"
                    :z-index="zIndex"
                />
            </div>
        </div>
        <OpenLayersKMLLayer
            v-if="layerConfig.type === LayerTypes.KML && layerConfig.kmlData"
            :kml-layer-config="layerConfig"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <OpenLayersGPXLayer
            v-if="layerConfig.type === LayerTypes.GPX"
            :gpx-layer-config="layerConfig"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <OpenLayersCOGTiffLayer
            v-if="layerConfig.type === LayerTypes.COG"
            :geotiff-config="layerConfig"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <slot />
    </div>
</template>
