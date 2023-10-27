<template>
    <div>
        <slot />
    </div>
</template>

<script>
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import { YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA } from '@/api/layers/LayerTimeConfigEntry.class'
import { TILEGRID_EXTENT, TILEGRID_ORIGIN, TILEGRID_RESOLUTIONS, WMS_TILE_SIZE } from '@/config'
import { CoordinateSystem, LV95, WEBMERCATOR } from '@/utils/coordinateSystems'
import { Image as ImageLayer, Tile as TileLayer } from 'ol/layer'
import { transformExtent } from 'ol/proj'
import ImageWMS from 'ol/source/ImageWMS'
import TileWMS from 'ol/source/TileWMS'
import TileGrid from 'ol/tilegrid/TileGrid'
import proj4 from 'proj4'
import { mapState } from 'vuex'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'

import { getTimestampFromConfig } from '@/utils/layerUtils'

/** Renders a WMS layer on the map */
export default {
    mixins: [addLayerToMapMixin],
    props: {
        wmsLayerConfig: {
            type: [GeoAdminWMSLayer, ExternalWMSLayer],
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
        gutter() {
            return this.wmsLayerConfig.gutter || -1
        },
        url() {
            return this.wmsLayerConfig.getURL()
        },
        timestamp() {
            return getTimestampFromConfig(this.wmsLayerConfig, this.previewYear)
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
    watch: {
        url(newUrl) {
            this.layer.getSource().setUrl(newUrl)
        },
        opacity(newOpacity) {
            this.layer.setOpacity(newOpacity)
        },
    },
    created() {
        let source = undefined
        if (this.gutter !== -1) {
            source = new TileWMS({
                projection: this.projection.epsg,
                url: this.url,
                gutter: this.gutter,
                params: this.wmsUrlParams,
            })
        } else {
            source = new ImageWMS({
                url: this.url,
                projection: this.projection.epsg,
                params: this.wmsUrlParams,
            })
        }
        // If we are using LV95, we can constrain the WMS to only request tiles over Switzerland
        if (this.projection === LV95) {
            const tileGridLV95 = new TileGrid({
                resolutions: TILEGRID_RESOLUTIONS,
                extent: TILEGRID_EXTENT,
                origin: TILEGRID_ORIGIN,
                tileSize: WMS_TILE_SIZE,
            })

            source.tileGrid = tileGridLV95

            // tile grid and  reprojection to WebMercator is done in analogy to WMTS to prevent
            // that the layer appears twice, once in CH and once near New Zealand.
            // see: https://github.com/geoadmin/web-mapviewer/commit/c689f9a650c546c6e52a91fc2086d7cbbf48faa2
            if (this.gutter !== -1) {
                source.setTileGridForProjection(
                    WEBMERCATOR.epsg,
                    new TileGrid({
                        resolutions: TILEGRID_RESOLUTIONS,
                        origin: proj4(LV95.epsg, WEBMERCATOR.epsg, TILEGRID_ORIGIN),
                        extent: transformExtent(
                            tileGridLV95.getExtent(),
                            LV95.epsg,
                            WEBMERCATOR.epsg
                        ),
                    })
                )
            }
        }
        if (this.gutter !== -1) {
            this.layer = new TileLayer({
                id: this.layerId,
                opacity: this.opacity,
                source,
            })
        } else {
            this.layer = new ImageLayer({
                id: this.layerId,
                opacity: this.opacity,
                source,
            })
        }
    },
}
</script>
