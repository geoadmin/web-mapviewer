<template>
    <div>
        <slot />
    </div>
</template>

<script>
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import { CoordinateSystem, WEBMERCATOR } from '@/utils/coordinateSystems'
import { ImageryLayer, Rectangle, UrlTemplateImageryProvider } from 'cesium'
import { WGS84_EXTENT } from '@/config'
import addImageryLayerMixins from './utils/addImageryLayer-mixins'

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
            if (
                this.previewYear &&
                this.wmtsLayerConfig.timeConfig &&
                this.wmtsLayerConfig.timeConfig.years.includes(this.previewYear)
            ) {
                return this.wmtsLayerConfig.timeConfig.getTimeEntryForYear(this.previewYear)
                    .timestamp
            }
            return null
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
                    rectangle: Rectangle.fromDegrees(...WGS84_EXTENT),
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
