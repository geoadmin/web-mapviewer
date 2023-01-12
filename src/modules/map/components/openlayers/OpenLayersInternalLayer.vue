<template>
    <div>
        <!-- no source exclusion when adding VT layer through here, this is only required in the case the layer is under
             another (see OpenLayersMap main component)-->
        <OpenLayersVectorLayer
            v-if="layerConfig.type === LayerTypes.VECTOR"
            :z-index="zIndex"
            :layer-id="layerConfig.getID()"
            :opacity="layerConfig.opacity"
            :style-url="layerConfig.getURL()"
        />
        <OpenLayersWMTSLayer
            v-if="layerConfig.type === LayerTypes.WMTS && !layerConfig.isExternal"
            :layer-id="layerConfig.getID()"
            :opacity="layerConfig.opacity"
            :url="layerConfig.getURL(LV95.epsgNumber)"
            :z-index="zIndex"
            :projection="LV95.epsg"
        />
        <OpenLayersExternalWMTSLayer
            v-if="layerConfig.type === LayerTypes.WMTS && layerConfig.isExternal"
            :layer-id="layerConfig.externalLayerId"
            :opacity="layerConfig.opacity"
            :get-capabilities-url="layerConfig.getURL()"
            :z-index="zIndex"
        />
        <!-- we have to pass the geoAdminID as ID here in order to support external WMS layers -->
        <!-- as external and internal (geoadmin) WMS layers can be managed the same way,
             we do not have a specific component for external layers but we reuse the one for geoadmin's layers-->
        <OpenLayersWMSLayer
            v-if="layerConfig.type === LayerTypes.WMS"
            :layer-id="layerConfig.geoAdminID ?? layerConfig.externalLayerId"
            :opacity="layerConfig.opacity"
            :url="layerConfig.getURL(LV95.epsgNumber)"
            :wms-version="layerConfig.wmsVersion"
            :time-config="layerConfig.timeConfig"
            :format="layerConfig.format"
            :gutter="layerConfig.gutter"
            :z-index="zIndex"
            :projection="LV95.epsg"
        />
        <OpenLayersGeoJSONLayer
            v-if="layerConfig.type === LayerTypes.GEOJSON"
            :layer-id="layerConfig.getID()"
            :opacity="layerConfig.opacity"
            :geojson-url="layerConfig.geoJsonUrl"
            :style-url="layerConfig.styleUrl"
            :z-index="zIndex"
        />
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
                <open-layers-internal-layer
                    v-if="shouldAggregateSubLayerBeVisible(aggregateSubLayer)"
                    :layer-config="aggregateSubLayer.layer"
                    :z-index="zIndex"
                />
            </div>
        </div>
        <OpenLayersKMLLayer
            v-if="layerConfig.type === LayerTypes.KML"
            :layer-id="layerConfig.getID()"
            :opacity="layerConfig.opacity"
            :url="layerConfig.getURL()"
            :z-index="zIndex"
        />
        <slot />
    </div>
</template>

<script>
import AbstractLayer from '@/api/layers/AbstractLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import OpenLayersExternalWMTSLayer from '@/modules/map/components/openlayers/OpenLayersExternalWMTSLayer.vue'
import OpenLayersKMLLayer from '@/modules/map/components/openlayers/OpenLayersKMLLayer.vue'
import { CoordinateSystems } from '@/utils/coordinateUtils'
import OpenLayersGeoJSONLayer from './OpenLayersGeoJSONLayer.vue'
import OpenLayersVectorLayer from './OpenLayersVectorLayer.vue'
import OpenLayersWMSLayer from './OpenLayersWMSLayer.vue'
import OpenLayersWMTSLayer from './OpenLayersWMTSLayer.vue'

/**
 * Transforms a layer config (metadata, structures can be found in api/layers/** files) into the
 * correct OpenLayers counterpart depending on the layer type.
 */
export default {
    // So that we can recursively call ourselves in the template for aggregate layers
    name: 'OpenLayersInternalLayer',
    components: {
        OpenLayersExternalWMTSLayer,
        OpenLayersKMLLayer,
        OpenLayersGeoJSONLayer,
        OpenLayersWMSLayer,
        OpenLayersWMTSLayer,
        OpenLayersVectorLayer,
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
        // In order to be able to manage aggregate layers we need to know the current map resolution
        currentMapResolution: {
            type: Number,
            default: -1,
        },
    },
    data() {
        return {
            LayerTypes,
            LV95: CoordinateSystems.LV95,
        }
    },
    methods: {
        shouldAggregateSubLayerBeVisible(subLayer) {
            // min and max resolution are set in the API file to the lowest/highest possible value if undefined, so we don't
            // have to worry about checking their validity
            return (
                this.currentMapResolution >= subLayer.minResolution &&
                this.currentMapResolution <= subLayer.maxResolution
            )
        },
    },
}
</script>
