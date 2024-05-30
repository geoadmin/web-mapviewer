<template>
    <div>
        <slot />
    </div>
</template>

<script>
import {
    ImageryLayer,
    Rectangle,
    UrlTemplateImageryProvider,
    WebMapTileServiceImageryProvider,
} from 'cesium'
import { isEqual } from 'lodash'
import { mapActions } from 'vuex'

import ExternalWMTSLayer, { WMTSEncodingTypes } from '@/api/layers/ExternalWMTSLayer.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import { DEFAULT_PROJECTION } from '@/config'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import { getWmtsXyzUrl } from '@/utils/layerUtils'
import { getTimestampFromConfig } from '@/utils/layerUtils'
import log from '@/utils/logging'

import addImageryLayerMixins from './utils/addImageryLayer-mixins'

const dispatcher = { dispatcher: 'CesiumWMTSLayer.vue' }

const MAXIMUM_LEVEL_OF_DETAILS = 18

const threeDErrorKey = '3d_unsupported_projection'

export default {
    mixins: [addImageryLayerMixins],
    props: {
        wmtsLayerConfig: {
            type: [GeoAdminWMTSLayer, ExternalWMTSLayer],
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
        layerId() {
            return this.wmtsLayerConfig.id
        },
        opacity() {
            return this.parentLayerOpacity ?? this.wmtsLayerConfig.opacity ?? 1.0
        },
        url() {
            return getWmtsXyzUrl(this.wmtsLayerConfig, this.projection, {
                addTimestamp: true,
                previewYear: this.previewYear,
                isTimeSliderActive: this.isTimeSliderActive,
            })
        },
        tileMatrixSet() {
            const set =
                this.wmtsLayerConfig.tileMatrixSets.find(
                    (set) => set.projection.epsg === this.projection.epsg
                ) ?? null
            if (!set) {
                log.error(
                    `External layer ${this.wmtsLayerConfig.id} does not support ${this.projection.epsg}`
                )
                this.addLayerErrorKey({
                    layerId: this.wmtsLayerConfig.id,
                    errorKey: threeDErrorKey,
                    ...dispatcher,
                })
            }
            return set
        },
        tileMatrixSetId() {
            return this.tileMatrixSet?.id ?? ''
        },
        dimensions() {
            const dimensions = {}
            this.wmtsLayerConfig.dimensions?.reduce((acc, dimension) => {
                if (dimension.current) {
                    acc[dimension.id] = 'current'
                } else {
                    acc[dimension.id] = dimension.values[0]
                }
            }, dimensions)
            if (this.wmtsLayerConfig.hasMultipleTimestamps) {
                // if we have a time config use it as dimension
                const timestamp =
                    getTimestampFromConfig(
                        this.wmtsLayerConfig,
                        this.previewYear,
                        this.isTimeSliderActive
                    ) ?? 'current'
                // overwrite any Time, TIME or time dimension
                const timeDimension = Object.entries(dimensions).find(
                    (e) => e[0].toLowerCase() === 'time'
                )
                if (timeDimension) {
                    dimensions[timeDimension[0]] = timestamp
                }
            }

            return dimensions
        },
    },
    watch: {
        dimensions(newDimension, oldDimension) {
            if (!isEqual(newDimension, oldDimension)) {
                log.debug(`layer dimension have been updated`, oldDimension, newDimension)
                this.updateLayer()
            }
        },
    },
    unmounted() {
        if (this.wmtsLayerConfig.hasErrorKey(threeDErrorKey)) {
            this.removeLayerErrorKey({
                layerId: this.wmtsLayerConfig.id,
                errorKey: threeDErrorKey,
                ...dispatcher,
            })
        }
    },
    methods: {
        ...mapActions(['addLayerErrorKey', 'removeLayerErrorKey']),
        createImagery(url) {
            const options = {
                alpha: this.opacity,
            }
            if (this.wmtsLayerConfig instanceof ExternalWMTSLayer && this.tileMatrixSetId) {
                return new ImageryLayer(
                    new WebMapTileServiceImageryProvider({
                        url:
                            this.wmtsLayerConfig.getTileEncoding === WMTSEncodingTypes.KVP
                                ? this.wmtsLayerConfig.baseUrl
                                : this.wmtsLayerConfig.urlTemplate,
                        layer: this.wmtsLayerConfig.id,
                        style: this.wmtsLayerConfig.style,
                        tileMatrixSetID: this.tileMatrixSetId,
                        dimensions: this.dimensions,
                    }),
                    options
                )
            } else if (this.wmtsLayerConfig instanceof GeoAdminWMTSLayer) {
                return new ImageryLayer(
                    new UrlTemplateImageryProvider({
                        rectangle: Rectangle.fromDegrees(
                            ...DEFAULT_PROJECTION.getBoundsAs(WGS84).flatten
                        ),
                        maximumLevel: MAXIMUM_LEVEL_OF_DETAILS,
                        url: url,
                    }),
                    options
                )
            }
            return null
        },
    },
}
</script>
