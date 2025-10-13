<script setup lang="ts">
/**
 * Renders a Vector layer on the map with MapLibre.
 *
 * This component should be heavily modified as soon as
 * https://jira.swisstopo.ch/browse/BGDIINF_SB-2741 can be done (as soon as layers config serves
 * configs for VT layers)
 *
 * Most of the specific code found bellow, plus import of layer ID should be removed then.
 */

import type { Map } from 'ol'
import log from '@swissgeo/log'
import { MapLibreLayer } from '@geoblocks/ol-maplibre-layer'
import axios from 'axios'
import { computed, inject, watch } from 'vue'

import type { GeoAdminVectorLayer } from '@swissgeo/layers'
import { VECTOR_TILES_IMAGERY_STYLE_ID } from '@/config/vectortiles.config'
import useAddLayerToMap from '@/modules/map/components/openlayers/utils/useAddLayerToMap.composable'

interface Props {
    vectorLayerConfig: GeoAdminVectorLayer
    parentLayerOpacity?: number
    zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
    parentLayerOpacity: undefined,
    zIndex: -1,
})

// extracting useful info from what we've linked so far
const layerId = computed(() => props.vectorLayerConfig.id)
const opacity = computed(() => props.parentLayerOpacity ?? props.vectorLayerConfig.opacity)
const styleUrl = computed(() => `${props.vectorLayerConfig.baseUrl}styles/${layerId.value}/style.json`)

const layer = new MapLibreLayer({
    properties: {
        id: layerId.value,
        uuid: props.vectorLayerConfig.uuid,
    },
    opacity: opacity.value,
    mapLibreOptions: {
        style: styleUrl.value,
    },
})
setMapLibreStyle(styleUrl.value)

const olMap = inject<Map>('olMap')!
useAddLayerToMap(layer, olMap, props.zIndex)

watch(opacity, (newOpacity) => layer.setOpacity(newOpacity))
watch(styleUrl, (newStyleUrl) => setMapLibreStyle(newStyleUrl))
function setMapLibreStyle(styleUrl: string): void {
    if (!layer?.mapLibreMap) {
        log.error('MapLibre instance is not attached to the layer')
        return
    }
    // most of this methods will be edited while doing https://jira.swisstopo.ch/browse/BGDIINF_SB-2741
    if (layerId.value === VECTOR_TILES_IMAGERY_STYLE_ID) {
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
                if (layer.mapLibreMap) {
                    layer.mapLibreMap.setStyle(vectorStyle)
                }
            })
            .catch((err: unknown) => {
                log.error('Error while fetching MapLibre style', styleUrl, err as string)
            })
    } else {
        if (layer.mapLibreMap) {
            layer.mapLibreMap.setStyle(styleUrl)
        }
    }
}
</script>

<template>
    <slot />
</template>
