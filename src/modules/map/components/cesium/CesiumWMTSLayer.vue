<template>
    <div>
        <slot />
    </div>
</template>

<script>
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import { DEFAULT_PROJECTION, TILEGRID_EXTENT_EPSG_4326 } from '@/config'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { getTimestampFromConfig } from '@/utils/layerUtils'
import { ImageryLayer, Rectangle, UrlTemplateImageryProvider } from 'cesium'
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
                    alpha: this.opacity,
                }
            )
        },
    },
}
</script>

<style scoped lang="scss"></style>
