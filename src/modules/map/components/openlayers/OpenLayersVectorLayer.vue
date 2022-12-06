<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { TILEGRID_EXTENT, VECTOR_TILES_IMAGERY_STYLE_ID } from '@/config'
import { CoordinateSystems } from '@/utils/coordinateUtils'
import MapLibreLayer from '@geoblocks/ol-maplibre-layer'
import axios from 'axios'
import proj4 from 'proj4'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'

/** Renders a Vector layer on the map with MapLibre */
export default {
    mixins: [addLayerToMapMixin],
    props: {
        layerId: {
            type: String,
            required: true,
        },
        styleUrl: {
            type: String,
            required: true,
        },
        opacity: {
            type: Number,
            default: 1.0,
        },
        zIndex: {
            type: Number,
            default: -1,
        },
        excludeSource: {
            type: String,
            default: null,
        },
    },
    computed: {
        mapLibreInstance() {
            return this.layer?.maplibreMap
        },
    },
    watch: {
        opacity(newOpacity) {
            this.layer.setOpacity(newOpacity)
        },
        styleUrl(newStyleUrl) {
            this.setMapLibreStyle(newStyleUrl)
        },
    },
    created() {
        this.layer = new MapLibreLayer({
            opacity: this.opacity,
            maplibreOptions: {
                style: this.styleUrl,
            },
        })
        this.setMapLibreStyle(this.styleUrl)
    },
    methods: {
        setMapLibreStyle(styleUrl) {
            if (this.excludeSource) {
                // we load the style on the side in order to be able to filter out some source
                axios.get(styleUrl).then((response) => {
                    const vectorStyle = response.data
                    vectorStyle.layers = vectorStyle.layers.filter(
                        (layer) => layer.source !== this.excludeSource
                    )
                    this.mapLibreInstance.setStyle(vectorStyle)
                })
            } else if (this.layerId === VECTOR_TILES_IMAGERY_STYLE_ID) {
                // special case here, as the imagery is only over Switzerland (for now)
                // we inject a fair-use WMTS that covers the globe under our aerial images
                axios.get(styleUrl).then((response) => {
                    const vectorStyle = response.data
                    // settings bounds for swissimage, otherwise it covers the whole world with white tiles
                    vectorStyle.sources.swissimage_wmts.bounds = [
                        ...proj4(CoordinateSystems.LV95.epsg, CoordinateSystems.WGS84.epsg, [
                            TILEGRID_EXTENT[0] + 50000,
                            TILEGRID_EXTENT[1],
                        ]),
                        ...proj4(CoordinateSystems.LV95.epsg, CoordinateSystems.WGS84.epsg, [
                            TILEGRID_EXTENT[2] - 20000,
                            TILEGRID_EXTENT[3],
                        ]),
                    ]
                    // setting up Sentinel2 WMTS to cover the globe outside of Switzerland
                    vectorStyle.sources['sentinel2_wmts'] = {
                        minzoom: 0,
                        maxzoom: 22,
                        tileSize: 256,
                        type: 'raster',
                        tiles: [
                            'https://tiles.maps.eox.at/wmts?layer=s2cloudless-2020_3857&style=default&tilematrixset=g&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix={z}&TileCol={x}&TileRow={y}',
                        ],
                    }
                    vectorStyle.layers.splice(1, 0, {
                        id: 'sentinel2',
                        source: 'sentinel2_wmts',
                        type: 'raster',
                    })
                    this.mapLibreInstance.setStyle(vectorStyle)
                })
            } else {
                this.mapLibreInstance.setStyle(styleUrl)
            }
        },
    },
}
</script>
