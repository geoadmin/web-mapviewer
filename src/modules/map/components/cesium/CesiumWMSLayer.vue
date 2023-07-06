<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { CoordinateSystem, WEBMERCATOR } from '@/utils/coordinateSystems'
import { ImageryLayer, Rectangle, WebMapServiceImageryProvider } from 'cesium'
import { WGS84_EXTENT } from '@/config'
import { mapState } from 'vuex'
import { YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA } from '@/api/layers/LayerTimeConfigEntry.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import addImageryLayerMixins from '@/modules/map/components/cesium/utils/addImageryLayer-mixins'

// todo should we adapt LOD to resolution?
const MAXIMUM_LEVEL_OF_DETAILS = 18

export default {
    mixins: [addImageryLayerMixins],
    props: {
        wmsLayerConfig: {
            type: [GeoAdminWMSLayer],
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
            return this.wmsLayerConfig.getURL(this.previewYear, this.projection.epsgNumber)
        },
        timestamp() {
            if (this.wmsLayerConfig.timeConfig) {
                // if there is a preview year set, we search for the matching timestamp
                if (this.previewYear) {
                    const matchingTimeEntry = this.wmsLayerConfig.getTimeEntryForYear(
                        this.previewYear
                    )
                    if (matchingTimeEntry) {
                        return matchingTimeEntry.timestamp
                    }
                }
                // if a time entry is defined, and is different from 'all'
                // (no need to pass 'all' to our WMS, that's the default timestamp used under the hood)
                if (
                    this.wmsLayerConfig.timeConfig.currentYear !==
                    YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA
                ) {
                    return this.wmsLayerConfig.timeConfig.currentTimestamp
                }
            }
            return ''
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
                    rectangle: Rectangle.fromDegrees(...WGS84_EXTENT),
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
