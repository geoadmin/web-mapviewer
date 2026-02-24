<script setup lang="ts">
/**
 * Transforms a layer config (metadata, structures can be found in api/layers/** files) into the
 * correct OpenLayers counterpart depending on the layer type.
 */

import type {
    CloudOptimizedGeoTIFFLayer,
    ExternalWMSLayer,
    ExternalWMTSLayer,
    GeoAdminAggregateLayer,
    GeoAdminGeoJSONLayer,
    GeoAdminGroupOfLayers,
    GeoAdminVectorLayer,
    GeoAdminWMSLayer,
    GeoAdminWMTSLayer,
    GPXLayer,
    KMLLayer,
    Layer,
} from '@swissgeo/layers'

import { WEBMERCATOR } from '@swissgeo/coordinates'
import { LayerType } from '@swissgeo/layers'
import { computed } from 'vue'

import OpenLayersCOGTiffLayer from '@/modules/map/components/openlayers/OpenLayersCOGTiffLayer.vue'
import OpenLayersExternalWMTSLayer from '@/modules/map/components/openlayers/OpenLayersExternalWMTSLayer.vue'
import OpenLayersGeoJSONLayer from '@/modules/map/components/openlayers/OpenLayersGeoJSONLayer.vue'
import OpenLayersGPXLayer from '@/modules/map/components/openlayers/OpenLayersGPXLayer.vue'
import OpenLayersKMLLayer from '@/modules/map/components/openlayers/OpenLayersKMLLayer.vue'
import OpenLayersVectorLayer from '@/modules/map/components/openlayers/OpenLayersVectorLayer.vue'
import OpenLayersWMSLayer from '@/modules/map/components/openlayers/OpenLayersWMSLayer.vue'
import OpenLayersWMTSLayer from '@/modules/map/components/openlayers/OpenLayersWMTSLayer.vue'
import usePositionStore from '@/store/modules/position'

const {
    layerConfig,
    parentLayerOpacity,
    zIndex = -1,
} = defineProps<{
    layerConfig: Layer
    parentLayerOpacity?: number
    zIndex?: number
}>()

const positionStore = usePositionStore()
const projection = computed(() => positionStore.projection)
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
            v-if="projection.epsg === WEBMERCATOR.epsg && layerConfig?.type === LayerType.VECTOR"
            :vector-layer-config="layerConfig as GeoAdminVectorLayer"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <OpenLayersWMTSLayer
            v-if="layerConfig?.type === LayerType.WMTS && !layerConfig?.isExternal"
            :wmts-layer-config="layerConfig as GeoAdminWMTSLayer"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <OpenLayersExternalWMTSLayer
            v-if="layerConfig?.type === LayerType.WMTS && layerConfig?.isExternal"
            :external-wmts-layer-config="layerConfig as ExternalWMTSLayer"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <!-- as external and internal (geoadmin) WMS layers can be managed the same way,
             we do not have a specific component for external layers but we reuse the one for geoadmin's layers-->
        <OpenLayersWMSLayer
            v-if="layerConfig?.type === LayerType.WMS"
            :wms-layer-config="
                layerConfig.isExternal
                    ? (layerConfig as ExternalWMSLayer)
                    : (layerConfig as GeoAdminWMSLayer)
            "
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <OpenLayersGeoJSONLayer
            v-if="layerConfig?.type === LayerType.GEOJSON"
            :geo-json-config="layerConfig as GeoAdminGeoJSONLayer"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <div v-if="layerConfig?.type === LayerType.GROUP">
            <OpenLayersInternalLayer
                v-for="(layer, index) in (layerConfig as GeoAdminGroupOfLayers).layers"
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
        <div v-if="layerConfig?.type === LayerType.AGGREGATE">
            <!-- Aggregate layers requires a different management.
                 They are not OpenLayers layers per-se, but rather an ensemble of other layers.
                 This component will loop through all the layer contained by this aggregate layer
                 and draw them with this component (recursive-call)
                 All layers metadata information (visible, opacity, etc...) should be inherited from the parent -->
            <OpenLayersInternalLayer
                v-for="(subLayer, index) in (layerConfig as GeoAdminAggregateLayer).subLayers"
                :key="`child-layer-${layerConfig.id}-${index}`"
                :layer-config="subLayer.layer"
                :parent-layer-opacity="parentLayerOpacity"
                :z-index="zIndex"
            />
        </div>
        <OpenLayersKMLLayer
            v-if="
                layerConfig &&
                    layerConfig.type === LayerType.KML &&
                    (layerConfig as KMLLayer).kmlData &&
                    !(layerConfig as KMLLayer).isEdited
            "
            :kml-layer-config="layerConfig as KMLLayer"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <OpenLayersGPXLayer
            v-if="layerConfig?.type === LayerType.GPX"
            :gpx-layer-config="layerConfig as GPXLayer"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <OpenLayersCOGTiffLayer
            v-if="layerConfig?.type === LayerType.COG"
            :geotiff-config="layerConfig as CloudOptimizedGeoTIFFLayer"
            :parent-layer-opacity="parentLayerOpacity"
            :z-index="zIndex"
        />
        <slot />
    </div>
</template>
