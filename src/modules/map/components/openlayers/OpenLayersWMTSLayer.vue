<template>
    <div>
        <slot />
    </div>
</template>

<script>
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
            default: 'EPSG:3857',
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
        this.layer = new TileLayer({
            id: this.layerId,
            opacity: this.opacity,
            source: new XYZSource({
                projection: this.projection,
                url: this.url,
                tileGrid: new TileGrid({
                    resolutions: TILEGRID_RESOLUTIONS,
                    extent: TILEGRID_EXTENT,
                    origin: TILEGRID_ORIGIN,
                })
            }),
            visible: this.visible,
        })
    },
}
</script>
