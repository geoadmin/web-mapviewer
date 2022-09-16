<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { CoordinateSystems } from '@/utils/coordinateUtils'
import { Image as ImageLayer, Tile as TileLayer } from 'ol/layer'
import ImageWMS from 'ol/source/ImageWMS'
import TileWMS from 'ol/source/TileWMS'
import TileGrid from 'ol/tilegrid/TileGrid'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'
import { TILEGRID_ORIGIN, TILEGRID_RESOLUTIONS, WMS_TILE_SIZE } from '@/config'

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
        let tileGrid = undefined
        // If we are using LV95, we can constrain the WMS to only request tiles over Switzerland
        if (this.projection === CoordinateSystems.LV95.epsg) {
            tileGrid = new TileGrid({
                resolutions: TILEGRID_RESOLUTIONS,
                extent: TILEGRID_EXTENT,
                origin: TILEGRID_ORIGIN,
            })
        }
        if (this.gutter !== -1) {
            this.layer = new TileLayer({
                id: this.layerId,
                opacity: this.opacity,
                source: new TileWMS({
                    projection: this.projection,
                    url: this.url,
                    gutter: this.gutter,
                    tileGrid,
                }),
            })
        } else {
            this.layer = new ImageLayer({
                id: this.layerId,
                opacity: this.opacity,
                source: new ImageWMS({
                    url: this.url,
                    tileGrid,
                }),
            })
        }
    },
}
</script>
