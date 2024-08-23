<template>
    <slot />
</template>

<script>
import { ImageryLayer, Rectangle, WebMapServiceImageryProvider } from 'cesium'
import { cloneDeep } from 'lodash'
import { mapState } from 'vuex'

import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import { ALL_YEARS_TIMESTAMP } from '@/api/layers/LayerTimeConfigEntry.class'
import { DEFAULT_PROJECTION } from '@/config/map.config'
import addImageryLayerMixins from '@/modules/map/components/cesium/utils/addImageryLayer-mixins'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { getTimestampFromConfig } from '@/utils/layerUtils'

const MAXIMUM_LEVEL_OF_DETAILS = 18

export default {
    mixins: [addImageryLayerMixins],
    props: {
        wmsLayerConfig: {
            type: [GeoAdminWMSLayer, ExternalWMSLayer],
            required: true,
        },
        projection: {
            type: CoordinateSystem,
            required: true,
        },
        zIndex: {
            type: Number,
            default: -1,
        },
        isTimeSliderActive: {
            type: Boolean,
            default: false,
        },
        parentLayerOpacity: {
            type: Number,
            default: null,
        },
    },
    computed: {
        ...mapState({
            currentLang: (state) => state.i18n.lang,
        }),
        layerId() {
            return this.wmsLayerConfig.technicalName ?? this.wmsLayerConfig.id
        },
        opacity() {
            return this.parentLayerOpacity ?? this.wmsLayerConfig.opacity ?? 1.0
        },
        wmsVersion() {
            return this.wmsLayerConfig.wmsVersion ?? '1.3.0'
        },
        format() {
            return this.wmsLayerConfig.format ?? 'png'
        },
        url() {
            return this.wmsLayerConfig.baseUrl
        },
        timestamp() {
            return getTimestampFromConfig(this.wmsLayerConfig)
        },
        customAttributes() {
            return cloneDeep(this.wmsLayerConfig.customAttributes)
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
            let params = {
                SERVICE: 'WMS',
                REQUEST: 'GetMap',
                TRANSPARENT: true,
                LAYERS: this.layerId,
                FORMAT: `image/${this.format}`,
                LANG: this.currentLang,
                VERSION: this.wmsVersion,
            }
            if (this.timestamp && this.timestamp !== ALL_YEARS_TIMESTAMP) {
                params.TIME = this.timestamp
            }
            if (this.customAttributes) {
                params = { ...params, ...this.customAttributes }
            }
            return params
        },
    },
    watch: {
        wmsUrlParams() {
            this.updateLayer()
        },
    },
    methods: {
        createImagery(url) {
            return new ImageryLayer(
                new WebMapServiceImageryProvider({
                    url: url,
                    parameters: this.wmsUrlParams,
                    layers: this.layerId,
                    maximumLevel: MAXIMUM_LEVEL_OF_DETAILS,
                    enablePickFeatures: false,
                    rectangle: Rectangle.fromDegrees(
                        ...DEFAULT_PROJECTION.getBoundsAs(WGS84).flatten
                    ),
                }),
                {
                    alpha: this.opacity,
                }
            )
        },
    },
}
</script>
