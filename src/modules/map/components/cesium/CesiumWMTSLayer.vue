<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { ImageryLayer, Rectangle, UrlTemplateImageryProvider } from 'cesium'

import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import { DEFAULT_PROJECTION } from '@/config'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { getTimestampFromConfig } from '@/utils/layerUtils'

import addImageryLayerMixins from './utils/addImageryLayer-mixins'

const MAXIMUM_LEVEL_OF_DETAILS = 18

export default {
    mixins: [addImageryLayerMixins],
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
            required: true,
        },
        zIndex: {
            type: Number,
            default: -1,
        },
    },
    computed: {
        layerId() {
            return this.wmtsLayerConfig.id
        },
        opacity() {
            return this.wmtsLayerConfig.opacity || 1.0
        },
        timestampForPreviewYear() {
            return getTimestampFromConfig(this.wmtsLayerConfig, this.previewYear)
        },
        url() {
            return this.wmtsLayerConfig.getURL(
                this.projection.epsgNumber,
                this.timestampForPreviewYear
            )
        },
    },
    methods: {
        createImagery(url) {
            return new ImageryLayer(
                new UrlTemplateImageryProvider({
                    rectangle: Rectangle.fromDegrees(
                        ...DEFAULT_PROJECTION.getBoundsAs(WGS84).flatten
                    ),
                    maximumLevel: MAXIMUM_LEVEL_OF_DETAILS,
                    url: url,
                }),
                {
                    show: this.wmtsLayerConfig.visible,
                    alpha: this.opacity,
                }
            )
        },
    },
}
</script>
