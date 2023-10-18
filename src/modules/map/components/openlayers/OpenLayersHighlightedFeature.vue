<template>
    <div>
        <OpenLayersMarker
            v-if="!doesFeatureHaveAGeometry && !feature.isEditable"
            :position="feature.lastCoordinate"
            :marker-style="markerStyles.FEATURE"
            :z-index="zIndex"
        />
        <slot />
    </div>
</template>

<script>
import { SelectableFeature } from '@/api/features.api'
import { DEFAULT_PROJECTION } from '@/config'
import OpenLayersMarker, {
    highlightedFill,
    highlightedStroke,
    highlightPointStyle,
    markerStyles,
} from '@/modules/map/components/openlayers/OpenLayersMarker.vue'
import addLayerToMapMixin from '@/modules/map/components/openlayers/utils/addLayerToMap-mixins'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import OpenLayersFeature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import { Vector as VectorSource } from 'ol/source'
import Style from 'ol/style/Style'

const geoJsonStyleFunction = (olFeature) => {
    const geoJsonType = olFeature.get('geometry').getType()
    switch (geoJsonType) {
        case 'LineString':
        case 'MultiLineString':
            return new Style({
                stroke: highlightedStroke,
            })
        case 'Polygon':
        case 'MultiPolygon':
        case 'Circle':
        case 'GeometryCollection':
            return new Style({
                stroke: highlightedStroke,
                fill: highlightedFill,
            })
        case 'Point':
        case 'MultiPoint':
            return highlightPointStyle
        default:
            return null
    }
}

/** Renders a feature geometry on the map with a highlighted style */
export default {
    components: { OpenLayersMarker },
    mixins: [addLayerToMapMixin],
    props: {
        feature: {
            type: SelectableFeature,
            required: true,
        },
        projection: {
            type: CoordinateSystem,
            default: DEFAULT_PROJECTION,
        },
        zIndex: {
            type: Number,
            default: -1,
        },
    },
    data() {
        return {
            markerStyles,
            layer: null,
        }
    },
    computed: {
        doesFeatureHaveAGeometry() {
            return this.feature?.geometry
        },
        openLayersGeoJsonGeometry() {
            if (this.doesFeatureHaveAGeometry) {
                return new GeoJSON().readGeometry(this.feature.geometry, {
                    dataProject: this.projection.epsg,
                })
            }
            return null
        },
    },
    watch: {
        'feature.geometry'() {
            if (this.doesFeatureHaveAGeometry) {
                this.addFeatureToLayer()
            }
        },
    },
    created() {
        // if the feature has a geometry, we add it through a new vector layer, otherwise a marker will be added in the template above
        if (this.doesFeatureHaveAGeometry) {
            this.geometry = new OpenLayersFeature({
                id: `geometry-feature-${this.feature.id}`,
                geometry: this.openLayersGeoJsonGeometry,
            })
            this.layer = new VectorLayer({
                id: `geometry-layer-feature-${this.feature.id}`,
                style: geoJsonStyleFunction,
            })
            this.addFeatureToLayer()
        }
    },
    methods: {
        addFeatureToLayer() {
            this.layer?.setSource(
                new VectorSource({
                    features: [this.geometry],
                })
            )
        },
    },
}
</script>
