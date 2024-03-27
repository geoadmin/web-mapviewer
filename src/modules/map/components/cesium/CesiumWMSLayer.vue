<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { ImageryLayer, Rectangle, WebMapServiceImageryProvider } from 'cesium'
import { mapState } from 'vuex'

import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import { DEFAULT_PROJECTION } from '@/config'
import addImageryLayerMixins from '@/modules/map/components/cesium/utils/addImageryLayer-mixins'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { getTimestampFromConfig } from '@/utils/layerUtils'

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
            required: true,
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
            return this.wmsLayerConfig.technicalName || this.wmsLayerConfig.externalLayerId
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
            return this.wmsLayerConfig.baseUrl
        },
        timestamp() {
            return getTimestampFromConfig(this.wmsLayerConfig, this.previewYear)
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
                    layers: this.wmsLayerConfig.geoAdminId,
                    maximumLevel: MAXIMUM_LEVEL_OF_DETAILS,
                    rectangle: Rectangle.fromDegrees(
                        ...DEFAULT_PROJECTION.getBoundsAs(WGS84).flatten
                    ),
                }),
                {
                    show: this.wmsLayerConfig.visible,
                    alpha: this.opacity,
                }
            )
        },
    },
}
</script>
