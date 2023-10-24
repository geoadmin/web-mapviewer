<template>
    <div>
        <slot />
    </div>
</template>

<script>
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import { DEFAULT_PROJECTION } from '@/config'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import { getTimestampFromConfig } from '@/utils/layerUtils'
import { Tile as TileLayer } from 'ol/layer'
import { XYZ as XYZSource } from 'ol/source'
import TileGrid from 'ol/tilegrid/TileGrid'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'

/** Renders a WMTS layer on the map */
export default {
    mixins: [addLayerToMapMixin],
    props: {
        wmtsLayerConfig: {
            type: GeoAdminWMTSLayer,
            required: true,
        },
        previewYear: {
            type: Number,
            default: null,
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
    computed: {
        layerId() {
            return this.wmtsLayerConfig.getID()
        },
        opacity() {
            return this.wmtsLayerConfig.opacity || 1.0
        },
        timestampForPreviewYear() {
            return getTimestampFromConfig(this.wmtsLayerConfig, this.previewYear)
        },
        url() {
            return this.wmtsLayerConfig.getURL(
                this.timestampForPreviewYear,
                this.projection.epsgNumber
            )
        },
    },
    watch: {
        opacity(newOpacity) {
            this.layer.setOpacity(newOpacity)
        },
        url(newUrl) {
            this.layer.getSource().setUrl(newUrl)
        },
        projection() {
            this.layer.setSource(this.createSourceForProjection())
        },
    },
    created() {
        this.layer = new TileLayer({
            id: this.layerId,
            opacity: this.opacity,
            source: this.createSourceForProjection(),
        })
    },
    methods: {
        createSourceForProjection() {
            let tileGrid = null
            if (this.projection instanceof CustomCoordinateSystem) {
                tileGrid = new TileGrid({
                    resolutions: this.projection.getResolutions(),
                    extent: this.projection.bounds.flatten,
                    origin: this.projection.getTileOrigin(),
                })
            }
            return new XYZSource({
                projection: this.projection.epsg,
                url: this.url,
                tileGrid,
            })
        },
    },
}
</script>
