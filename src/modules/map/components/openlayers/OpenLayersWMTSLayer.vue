<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { TILEGRID_EXTENT, TILEGRID_ORIGIN, TILEGRID_RESOLUTIONS } from '@/config'
import { CoordinateSystems } from '@/utils/coordinateUtils'
import { Tile as TileLayer } from 'ol/layer'
import { transformExtent } from 'ol/proj'
import { XYZ as XYZSource } from 'ol/source'
import TileGrid from 'ol/tilegrid/TileGrid'
import proj4 from 'proj4'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'

/** Renders a WMTS layer on the map */
export default {
    mixins: [addLayerToMapMixin],
    props: {
        layerId: {
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
        visible: {
            type: Boolean,
            default: true,
        },
        url: {
            type: String,
            required: true,
        },
        zIndex: {
            type: Number,
            default: -1,
        },
    },
    watch: {
        opacity(newOpacity) {
            this.layer.setOpacity(newOpacity)
        },
        visible(newVisibility) {
            this.layer.setVisible(newVisibility)
        },
        url(newUrl) {
            this.layer.getSource().setUrl(newUrl)
        },
    },
    created() {
        let source = new XYZSource({
            projection: this.projection,
            url: this.url,
        })
        if (this.projection === CoordinateSystems.LV95.epsg) {
            // If we are using LV95, we can constrain the WMTS to only request tiles over Switzerland
            // we can also define the resolutions used in the LV95 WMTS pyramid, as it is different from the Mercator pyramid
            // otherwise tiles will be requested at a resolution such as they will appear zoomed in.
            const tileGridLV95 = new TileGrid({
                resolutions: TILEGRID_RESOLUTIONS,
                extent: TILEGRID_EXTENT,
                origin: TILEGRID_ORIGIN,
            })
            // we must redeclare a new instance of XYZ source in this case, see comment below
            source = new XYZSource({
                projection: this.projection,
                url: this.url,
                // the TileGrid for the main projection must be declared at construction, otherwise it won't work as intended
                // (not possible to use setTileGridForProjection with the main TileGrid, it will go to a different class attributes in OL)
                tileGrid: tileGridLV95,
            })
            // declaring the same tile grid, reprojected to WebMercator, specifically for Mercator use
            // if this is not done, the re-projection formula used internally by OL will render our layer
            // two times on the map, at the two extremes of the hemisphere. meaning our map will also be visible near New Zealand...
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
        this.layer = new TileLayer({
            id: this.layerId,
            opacity: this.opacity,
            source,
            visible: this.visible,
        })
    },
}
</script>
