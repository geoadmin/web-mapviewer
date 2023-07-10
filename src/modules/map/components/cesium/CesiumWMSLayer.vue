<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { CoordinateSystem, WEBMERCATOR } from '@/utils/coordinateSystems'
import { ImageryLayer, Rectangle, WebMapServiceImageryProvider } from 'cesium'
import { TILEGRID_EXTENT_EPSG_4326 } from '@/config'
import { mapState } from 'vuex'
import { YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA } from '@/api/layers/LayerTimeConfigEntry.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import addImageryLayerMixins from '@/modules/map/components/cesium/utils/addImageryLayer-mixins'
import { getWMSTimestampFromConfig } from '@/utils/wmsLayerUtils'

// todo should we adapt LOD to resolution?
const MAXIMUM_LEVEL_OF_DETAILS = 18

export default {
    mixins: [addImageryLayerMixins],
    props: {
        wmsLayerConfig: {
            type: GeoAdminWMSLayer,
            required: true,
        },
        previewYear: {
            type: Number,
            default: null,
        },
        projection: {
            type: CoordinateSystem,
            default: WEBMERCATOR.epsg,
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
        url() {
            return this.wmsLayerConfig.getURL()
        },
        timestamp() {
            return getWMSTimestampFromConfig(this.wmsLayerConfig)
        },
        /**
         * Definition of all relevant URL param for our WMS backends. Passes as parameters to
         * https://cesium.com/learn/cesiumjs/ref-doc/WebMapServiceImageryProvider.html#.ConstructorOptions
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
            }
        },
    },
    methods: {
        createImagery(url) {
            return new ImageryLayer(
                new WebMapServiceImageryProvider({
                    url: url,
                    parameters: this.wmsUrlParams,
                    subdomains: '0123',
                    layers: this.wmsLayerConfig.geoAdminID,
                    maximumLevel: MAXIMUM_LEVEL_OF_DETAILS,
                    rectangle: Rectangle.fromDegrees(...TILEGRID_EXTENT_EPSG_4326),
                }),
                {
                    show: this.wmsLayerConfig.visible,
                }
            )
        },
    },
}
</script>

<style scoped lang="scss"></style>
