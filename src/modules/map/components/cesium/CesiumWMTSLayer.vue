<template>
    <div>
        <slot />
    </div>
</template>

<script>
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import { CoordinateSystem, WEBMERCATOR, WGS84 } from '@/utils/coordinateSystems'
import { Credit, ImageryLayer, Rectangle, UrlTemplateImageryProvider } from 'cesium'
import proj4 from 'proj4'
import { LV95_EXTENT } from '@/config'

// The rectangle of the layer. This rectangle limits the visible portion of the imagery provider.
const WMTS_LIMITS_RECTANGLE = Rectangle.fromDegrees(
    ...proj4(WEBMERCATOR.epsg, WGS84.epsg, [LV95_EXTENT[0], LV95_EXTENT[1]]),
    ...proj4(WEBMERCATOR.epsg, WGS84.epsg, [LV95_EXTENT[2], LV95_EXTENT[3]])
)

// todo should we adapt LOD to resolution?
const MAXIMUM_LEVEL_OF_DETAILS = 18

export default {
    inject: ['getViewer'],
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
    data() {
        return {
            isPresentOnMap: false,
        }
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
    mounted() {
        if (this.layer && !this.isPresentOnMap) {
            this.addLayer(this.zIndex, this.layer)
        }
    },
    unmounted() {
        if (this.layer && this.isPresentOnMap) {
            this.removeLayer(this.layer)
        }

        delete this.layer
    },
    methods: {
        addLayer(zIndex, layer) {
            const viewer = this.getViewer()
            viewer.scene.imageryLayers.add(layer, zIndex)
            this.isPresentOnMap = true
        },
        removeLayer(layer) {
            this.getViewer().scene.imageryLayers.remove(layer)
            this.isPresentOnMap = false
        },
    },
    watch: {
        opacity(newOpacity) {
            this.layer.alpha = newOpacity
            this.getViewer().scene.render()
        },
        url(newUrl) {
            const viewer = this.getViewer()
            const index = viewer.scene.imageryLayers.indexOf(this.layer)
            viewer.scene.imageryLayers.remove(this.layer)
            this.layer = new ImageryLayer(
                new UrlTemplateImageryProvider({
                    rectangle: WMTS_LIMITS_RECTANGLE,
                    maximumLevel: MAXIMUM_LEVEL_OF_DETAILS,
                    url: newUrl,
                }),
                {
                    show: this.wmtsLayerConfig.visible,
                }
            )
            viewer.scene.imageryLayers.add(this.layer, index)
        },
        zIndex(zIndex) {
            if (this.layer) {
                const imageryLayers = this.getViewer().scene.imageryLayers
                const index = imageryLayers.indexOf(this.layer)
                const indexDiff = Math.abs(zIndex - index)
                for (let i = indexDiff; i !== 0; i--) {
                    if (index > zIndex) {
                        imageryLayers.lower(this.layer)
                    } else {
                        imageryLayers.raise(this.layer)
                    }
                }
            }
        },
    },
    created() {
        this.layer = new ImageryLayer(
            new UrlTemplateImageryProvider({
                rectangle: WMTS_LIMITS_RECTANGLE,
                maximumLevel: MAXIMUM_LEVEL_OF_DETAILS,
                url: this.url,
            }),
            {
                show: this.wmtsLayerConfig.visible,
            }
        )
    },
}
</script>

<style scoped lang="scss"></style>
