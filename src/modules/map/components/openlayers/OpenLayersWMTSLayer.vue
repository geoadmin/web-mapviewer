<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { CoordinateSystems } from '@/utils/coordinateUtils'
import { Tile as TileLayer } from 'ol/layer'
import { XYZ as XYZSource } from 'ol/source'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'
import TileGrid from "ol/tilegrid/TileGrid";
import {TILEGRID_EXTENT, TILEGRID_ORIGIN, TILEGRID_RESOLUTIONS} from "@/config";

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
        let tileGrid = undefined
        // If we are using LV95, we can constrain the WMTS to only request tiles over Switzerland
        // we can also define the resolutions used in the LV95 WMTS pyramid, as it is different from the Mercator pyramid
        // otherwise tiles will be requested at a resolution such as they will appear zoomed in.
        if (this.projection === CoordinateSystems.LV95.epsg) {
            tileGrid = new TileGrid({
                resolutions: TILEGRID_RESOLUTIONS,
                extent: TILEGRID_EXTENT,
                origin: TILEGRID_ORIGIN,
            })
        }
        this.layer = new TileLayer({
            id: this.layerId,
            opacity: this.opacity,
            source: new XYZSource({
                projection: this.projection,
                url: this.url,
                tileGrid,
            }),
            visible: this.visible,
        })
    },
}
</script>
