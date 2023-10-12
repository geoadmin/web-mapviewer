<template>
    <div>
        <slot />
    </div>
</template>

<script>
import { VECTOR_TILES_IMAGERY_STYLE_ID } from '@/config'
import log from '@/utils/logging'
import MapLibreLayer from '@geoblocks/ol-maplibre-layer'
import axios from 'axios'
import addLayerToMapMixin from './utils/addLayerToMap-mixins'

/**
 * Renders a Vector layer on the map with MapLibre This component should be heavily modified as soon
 * as https://jira.swisstopo.ch/browse/BGDIINF_SB-2741 can be done (as soon as layers config serves
 * configs for VT layers) Most of the specific code found bellow, plus import of layer ID should be
 * removed then.
 */
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
            id: this.layerId,
            opacity: this.opacity,
            maplibreOptions: {
                style: this.styleUrl,
            },
        })
        this.setMapLibreStyle(this.styleUrl)
    },
    methods: {
        setMapLibreStyle(styleUrl) {
            if (!this.layer?.maplibreMap) {
                log.error('MapLibre instance is not attached to the layer')
                return
            }
            // most of this methods will be edited while doing https://jira.swisstopo.ch/browse/BGDIINF_SB-2741
            if (this.excludeSource) {
                // we load the style on the side in order to be able to filter out some source
                axios
                    .get(styleUrl)
                    .then((response) => {
                        const vectorStyle = response.data
                        vectorStyle.layers = vectorStyle.layers.filter(
                            (layer) => layer.source !== this.excludeSource
                        )
                        // checking if the layer was removed during style fetching
                        if (this.layer?.maplibreMap) {
                            this.layer.maplibreMap.setStyle(vectorStyle)
                        }
                    })
                    .catch((err) => {
                        log.error('Error while fetching MapLibre style', styleUrl, err)
                    })
            } else if (this.layerId === VECTOR_TILES_IMAGERY_STYLE_ID) {
                // special case here, as the imagery is only over Switzerland (for now)
                // we inject a fair-use WMTS that covers the globe under our aerial images
                axios
                    .get(styleUrl)
                    .then((response) => {
                        const vectorStyle = response.data
                        // settings SwissImage to use the tiled WMS instead
                        // otherwise it covers the whole world with white tiles (when no data is present)
                        vectorStyle.sources.swissimage_wmts.tiles = [
                            'https://wms.geo.admin.ch/?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=ch.swisstopo.swissimage&LANG=en&WIDTH=256&HEIGHT=256&CRS=EPSG%3A3857&STYLES=&BBOX={bbox-epsg-3857}',
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
                        this.layer.maplibreMap.setStyle(vectorStyle)
                    })
                    .catch((err) => {
                        log.error('Error while fetching MapLibre style', styleUrl, err)
                    })
            } else {
                this.layer.maplibreMap.setStyle(styleUrl)
            }
        },
    },
}
</script>
