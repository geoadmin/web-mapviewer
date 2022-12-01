<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { TILEGRID_EXTENT, TILEGRID_ORIGIN, TILEGRID_RESOLUTIONS, WMS_TILE_SIZE } from '@/config'
import { CoordinateSystems } from '@/utils/coordinateUtils'
import { Image as ImageLayer, Tile as TileLayer } from 'ol/layer'
import { transformExtent } from 'ol/proj'
import ImageWMS from 'ol/source/ImageWMS'
import TileWMS from 'ol/source/TileWMS'
import TileGrid from 'ol/tilegrid/TileGrid'
import proj4 from 'proj4'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'

/** Renders a WMS layer on the map */
export default {
    mixins: [addLayerToMapMixin],
    props: {
        layerId: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        opacity: {
            type: Number,
            default: 1.0,
        },
        projection: {
            type: String,
            default: CoordinateSystems.WEBMERCATOR.epsg,
        },
        zIndex: {
            type: Number,
            default: -1,
        },
        gutter: {
            type: Number,
            default: -1,
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
                projection: this.projection,
                url: this.url,
                gutter: this.gutter,
            })
        } else {
            source = new ImageWMS({
                url: this.url,
                projection: this.projection,
            })
        }
        // If we are using LV95, we can constrain the WMS to only request tiles over Switzerland
        if (this.projection === CoordinateSystems.LV95.epsg) {
            const tileGridLV95 = new TileGrid({
                resolutions: TILEGRID_RESOLUTIONS,
                extent: TILEGRID_EXTENT,
                origin: TILEGRID_ORIGIN,
                tileSize: WMS_TILE_SIZE,
            })

            if (this.gutter !== -1) {
                source = new TileWMS({
                    projection: this.projection,
                    url: this.url,
                    gutter: this.gutter,
                    tileGrid: tileGridLV95,
                })
            } else {
                source = new ImageWMS({
                    projection: this.projection,
                    url: this.url,
                    tileGrid: tileGridLV95,
                })
            }
            // tile grid and  reprojection to WebMercator is done in analogy to WMTS to prevent
            // that the layer appears twice, once in CH and once near New Zealand.
            // see: https://github.com/geoadmin/web-mapviewer/commit/c689f9a650c546c6e52a91fc2086d7cbbf48faa2
            if (this.gutter !== -1) {
                source.setTileGridForProjection(
                    CoordinateSystems.WEBMERCATOR.epsg,
                    new TileGrid({
                        resolutions: TILEGRID_RESOLUTIONS,
                        origin: proj4(
                            CoordinateSystems.LV95.epsg,
                            CoordinateSystems.WEBMERCATOR.epsg,
                            TILEGRID_ORIGIN
                        ),
                        extent: transformExtent(
                            tileGridLV95.getExtent(),
                            CoordinateSystems.LV95.epsg,
                            CoordinateSystems.WEBMERCATOR.epsg
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
