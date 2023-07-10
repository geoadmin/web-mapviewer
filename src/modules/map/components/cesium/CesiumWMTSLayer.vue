<template>
    <div>
        <slot />
    </div>
</template>

<script>
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import { CoordinateSystem, WEBMERCATOR } from '@/utils/coordinateSystems'
import { ImageryLayer, Rectangle, UrlTemplateImageryProvider } from 'cesium'
import { TILEGRID_EXTENT_EPSG_4326 } from '@/config'
import addImageryLayerMixins from './utils/addImageryLayer-mixins'
import { getTimestampForPreviewLayer } from '@/utils/wmtsLayerUtils'

// todo should we adapt LOD to resolution?
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
            default: WEBMERCATOR,
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
            return getTimestampForPreviewLayer(this.previewYear, this.wmtsLayerConfig)
        },
        url() {
            return this.wmtsLayerConfig.getURL(
                this.timestampForPreviewYear,
                this.projection.epsgNumber
            )
        },
    },
    methods: {
        createImagery(url) {
            return new ImageryLayer(
                new UrlTemplateImageryProvider({
                    rectangle: Rectangle.fromDegrees(...TILEGRID_EXTENT_EPSG_4326),
                    maximumLevel: MAXIMUM_LEVEL_OF_DETAILS,
                    url: url,
                }),
                {
                    show: this.wmtsLayerConfig.visible,
                }
            )
        },
    },
}
</script>

<style scoped lang="scss"></style>
