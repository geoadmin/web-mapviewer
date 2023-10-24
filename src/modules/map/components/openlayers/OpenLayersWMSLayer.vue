<template>
    <div>
        <slot />
    </div>
</template>

<script>
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import { DEFAULT_PROJECTION, WMS_TILE_SIZE } from '@/config'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import { getTimestampFromConfig } from '@/utils/layerUtils'
import { Image as ImageLayer, Tile as TileLayer } from 'ol/layer'
import ImageWMS from 'ol/source/ImageWMS'
import TileWMS from 'ol/source/TileWMS'
import TileGrid from 'ol/tilegrid/TileGrid'
import { mapState } from 'vuex'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'

/** Renders a WMS layer on the map */
export default {
    mixins: [addLayerToMapMixin],
    props: {
        wmsLayerConfig: {
            type: [GeoAdminWMSLayer, ExternalWMSLayer],
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
        ...mapState({
            currentLang: (state) => state.i18n.lang,
        }),
        layerId() {
            return this.wmsLayerConfig.geoAdminID || this.wmsLayerConfig.externalLayerId
        },
        opacity() {
            return this.wmsLayerConfig.opacity || 1.0
        },
        wmsVersion() {
            return this.wmsLayerConfig.wmsVersion || '1.3.0'
        },
        format() {
            return this.wmsLayerConfig.format || 'png'
        },
        gutter() {
            return this.wmsLayerConfig.gutter || -1
        },
        url() {
            return this.wmsLayerConfig.getURL()
        },
        timestamp() {
            return getTimestampFromConfig(this.wmsLayerConfig, this.previewYear)
        },
        /**
         * Definition of all relevant URL param for our WMS backends. This is because both
         * https://openlayers.org/en/latest/apidoc/module-ol_source_TileWMS-TileWMS.html and
         * https://openlayers.org/en/latest/apidoc/module-ol_source_ImageWMS-ImageWMS.html have this
         * option.
         *
         * If we let the URL have all the param beforehand (sending all URL param through the url
         * option), most of our wanted params will be doubled, resulting in longer and more
         * difficult to read URLs
         *
         * @returns Object
         */
        wmsUrlParams() {
            return {
                SERVICE: 'WMS',
                REQUEST: 'GetMap',
                TRANSPARENT: true,
                LAYERS: this.layerId,
                FORMAT: `image/${this.format}`,
                LANG: this.currentLang,
                VERSION: this.wmsVersion,
                TIME: this.timestamp,
                CRS: this.projection.epsg,
            }
        },
    },
    watch: {
        url(newUrl) {
            this.layer.getSource().setUrl(newUrl)
        },
        opacity(newOpacity) {
            this.layer.setOpacity(newOpacity)
        },
        projection() {
            this.layer.setSource(this.createSourceForProjection())
        },
    },
    created() {
        if (this.gutter !== -1) {
            this.layer = new TileLayer({
                id: this.layerId,
                opacity: this.opacity,
                source: this.createSourceForProjection(),
            })
        } else {
            this.layer = new ImageLayer({
                id: this.layerId,
                opacity: this.opacity,
                source: this.createSourceForProjection(),
            })
        }
    },
    methods: {
        createSourceForProjection() {
            let source = null
            if (this.gutter !== -1) {
                source = new TileWMS({
                    projection: this.projection.epsg,
                    url: this.url,
                    gutter: this.gutter,
                    params: this.wmsUrlParams,
                })
            } else {
                source = new ImageWMS({
                    url: this.url,
                    projection: this.projection.epsg,
                    params: this.wmsUrlParams,
                })
            }
            if (this.projection instanceof CustomCoordinateSystem) {
                source.tileGrid = new TileGrid({
                    resolutions: this.projection.getResolutions(),
                    extent: this.projection.bounds.flatten,
                    origin: this.projection.getTileOrigin(),
                    tileSize: WMS_TILE_SIZE,
                })
            }
            return source
        },
    },
}
</script>
