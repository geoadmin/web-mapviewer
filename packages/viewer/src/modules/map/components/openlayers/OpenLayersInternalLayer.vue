<script setup lang="ts">
/**
 * Transforms a layer config (metadata, structures can be found in api/layers/** files) into the
 * correct OpenLayers counterpart depending on the layer type.
 */

import { LayerType, type GeoAdminAggregateLayer, type GeoAdminGroupOfLayers, type KMLLayer, type Layer } from '@swissgeo/layers'

import { WEBMERCATOR } from '@swissgeo/coordinates'
import { computed } from 'vue'
import OpenLayersCOGTiffLayer from '@/modules/map/components/openlayers/OpenLayersCOGTiffLayer.vue'
import OpenLayersExternalWMTSLayer from '@/modules/map/components/openlayers/OpenLayersExternalWMTSLayer.vue'
import OpenLayersGeoJSONLayer from '@/modules/map/components/openlayers/OpenLayersGeoJSONLayer.vue'
import OpenLayersGPXLayer from '@/modules/map/components/openlayers/OpenLayersGPXLayer.vue'
import OpenLayersKMLLayer from '@/modules/map/components/openlayers/OpenLayersKMLLayer.vue'
import OpenLayersVectorLayer from '@/modules/map/components/openlayers/OpenLayersVectorLayer.vue'
import OpenLayersWMSLayer from '@/modules/map/components/openlayers/OpenLayersWMSLayer.vue'
import OpenLayersWMTSLayer from '@/modules/map/components/openlayers/OpenLayersWMTSLayer.vue'
import usePositionStore from '@/store/modules/position.store'

interface Props {
    layerConfig?: Layer
    parentLayerOpacity?: number
    zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
    layerConfig: undefined,
    parentLayerOpacity: undefined,
    zIndex: -1,
})

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
            v-if="projection.epsg === WEBMERCATOR.epsg && props.layerConfig?.type === LayerType.VECTOR"
            :vector-layer-config="props.layerConfig"
            :parent-layer-opacity="props.parentLayerOpacity"
            :z-index="props.zIndex"
        />
        <OpenLayersWMTSLayer
            v-if="props.layerConfig?.type === LayerType.WMTS && !props.layerConfig?.isExternal"
            :wmts-layer-config="props.layerConfig"
            :parent-layer-opacity="props.parentLayerOpacity"
            :z-index="props.zIndex"
        />
        <OpenLayersExternalWMTSLayer
            v-if="props.layerConfig?.type === LayerType.WMTS && props.layerConfig?.isExternal"
            :external-wmts-layer-config="props.layerConfig"
            :parent-layer-opacity="props.parentLayerOpacity"
            :z-index="props.zIndex"
        />
        <!-- as external and internal (geoadmin) WMS layers can be managed the same way,
             we do not have a specific component for external layers but we reuse the one for geoadmin's layers-->
        <OpenLayersWMSLayer
            v-if="props.layerConfig?.type === LayerType.WMS"
            :wms-layer-config="props.layerConfig"
            :parent-layer-opacity="props.parentLayerOpacity"
            :z-index="props.zIndex"
        />
        <OpenLayersGeoJSONLayer
            v-if="props.layerConfig?.type === LayerType.GEOJSON"
            :geo-json-config="props.layerConfig"
            :parent-layer-opacity="props.parentLayerOpacity"
            :z-index="props.zIndex"
        />
        <div v-if="props.layerConfig?.type === LayerType.GROUP">
            <OpenLayersInternalLayer
                v-for="(layer, index) in (props.layerConfig as GeoAdminGroupOfLayers).layers"
                :key="`${layer.id}-${index}`"
                :layer-config="layer"
                :parent-layer-opacity="props.layerConfig.opacity"
                :z-index="props.zIndex + index"
            />
        </div>
        <!--
        Aggregate layers are some kind of a edge case where two or more layers are joint together but only one of them
        is visible depending on the map resolution.
        We have to manage aggregate layers straight here otherwise we won't be able to make a recursive call to this
        component in another child (that would be OpenLayersAggregateLayer.vue component, that doesn't work).
        See https://vuejs.org/v2/guide/components-edge-cases.html#Recursive-Components for more info
        -->
        <div v-if="props.layerConfig?.type === LayerType.AGGREGATE">
            <!-- Aggregate layers requires a different management.
                 They are not OpenLayers layers per-se, but rather an ensemble of other layers.
                 This component will loop through all the layer contained by this aggregate layer
                 and draw them with this component (recursive-call)
                 All layers metadata information (visible, opacity, etc...) should be inherited from the parent -->
            <OpenLayersInternalLayer
                v-for="(subLayer, index) in (props.layerConfig as GeoAdminAggregateLayer)
                    .subLayers"
                :key="`child-layer-${props.layerConfig.id}-${index}`"
                :layer-config="subLayer.layer"
                :parent-layer-opacity="props.parentLayerOpacity"
                :z-index="props.zIndex"
            />
        </div>
        <OpenLayersKMLLayer
            v-if="props.layerConfig?.type === LayerType.KML && (props.layerConfig as KMLLayer)?.kmlData"
            :kml-layer-config="props.layerConfig as KMLLayer"
            :parent-layer-opacity="props.parentLayerOpacity"
            :z-index="props.zIndex"
        />
        <OpenLayersGPXLayer
            v-if="props.layerConfig?.type === LayerType.GPX"
            :gpx-layer-config="props.layerConfig"
            :parent-layer-opacity="props.parentLayerOpacity"
            :z-index="props.zIndex"
        />
        <OpenLayersCOGTiffLayer
            v-if="props.layerConfig?.type === LayerType.COG"
            :geotiff-config="props.layerConfig"
            :parent-layer-opacity="props.parentLayerOpacity"
            :z-index="props.zIndex"
        />
        <slot />
    </div>
</template>
