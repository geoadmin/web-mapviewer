<template>
    <div>
        <slot />
    </div>
</template>

<script>
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import {
    DEFAULT_PROJECTION,
    TILEGRID_EXTENT,
    TILEGRID_ORIGIN,
    TILEGRID_RESOLUTIONS,
} from '@/config'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { LV95, WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'
import { getTimestampFromConfig } from '@/utils/layerUtils'
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
    watch: {
        opacity(newOpacity) {
            this.layer.setOpacity(newOpacity)
        },
        url(newUrl) {
            this.layer.getSource().setUrl(newUrl)
        },
        projection() {
            this.layer.setSource(this.createSourceForProjection())
        },
    },
    created() {
        this.layer = new TileLayer({
            id: this.layerId,
            opacity: this.opacity,
            source: this.createSourceForProjection(),
        })
    },
    methods: {
        createSourceForProjection() {
            let source = new XYZSource({
                projection: this.projection.epsg,
                url: this.url,
            })
            // If we are using LV95, we can constrain the WMTS to only request tiles over Switzerland
            // we can also define the resolutions used in the LV95 WMTS pyramid, as it is different from the Mercator pyramid
            // otherwise tiles will be requested at a resolution such as they will appear zoomed in.
            const tileGridLV95 = new TileGrid({
                resolutions: TILEGRID_RESOLUTIONS,
                extent: TILEGRID_EXTENT,
                origin: TILEGRID_ORIGIN,
            })
            if (this.projection.epsg === LV95.epsg) {
                // we must redeclare a new instance of XYZ source in this case, see comment below
                source = new XYZSource({
                    projection: this.projection.epsg,
                    url: this.url,
                    // the TileGrid for the main projection must be declared at construction, otherwise it won't work as intended
                    // (not possible to use setTileGridForProjection with the main TileGrid, it will go to a different class attributes in OL)
                    tileGrid: tileGridLV95,
                })
            } else if (this.projection.epsg === WEBMERCATOR.epsg) {
                // declaring the same tile grid, reprojected to WebMercator, specifically for Mercator use
                // if this is not done, the re-projection formula used internally by OL will render our layer
                // two times on the map, at the two extremes of the hemisphere. meaning our map will also be visible near New Zealand...
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
            return source
        },
    },
}
</script>
