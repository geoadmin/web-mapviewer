<script setup lang="ts">
import { View } from 'ol'
import OLTileLayer from 'ol/layer/Tile'
import OLMap from 'ol/Map'
import { register } from 'ol/proj/proj4'
import TileWMS from 'ol/source/TileWMS'
import XYZ from 'ol/source/XYZ'
import proj4 from 'proj4'
import { onMounted } from 'vue'

import { getLV95WMTSTileGrid, getLV95ViewConfig, getLV95WMSTileGrid } from '@/ol'
import { LV95 } from '@/proj'
import registerProj4 from '@/registerProj4'

const pixelKarteFarbeURL =
    'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/2056/{z}/{x}/{y}.jpeg'

function setupOpenLayers() {
    registerProj4(proj4)
    register(proj4)

    const pixelKarteFarbe = new OLTileLayer({
        source: new XYZ({
            url: pixelKarteFarbeURL,
            projection: LV95.epsg,
            tileGrid: getLV95WMTSTileGrid(),
        }),
    })

    // a tiled WMS (one that defines a gutter in its layer config in https://api3.geo.admin.ch/rest/services/all/MapServer/layersConfig)
    // It will also require the TileGrid to be properly configured to have the best look (no aliasing, etc...)
    const windEnergieAnlagen = new OLTileLayer({
        source: new TileWMS({
            url: 'https://wms.geo.admin.ch/',
            params: {
                CRS: LV95.epsg,
                FORMAT: 'image/png',
                LAYERS: 'ch.bfe.windenergieanlagen',
                VERSION: '1.3.0',
            },
            gutter: 15,
            tileGrid: getLV95WMSTileGrid(),
        }),
    })

    new OLMap({
        target: 'ol-map',
        layers: [pixelKarteFarbe, windEnergieAnlagen],
        view: new View({
            ...getLV95ViewConfig(),
        }),
    })
}

onMounted(() => {
    setupOpenLayers()
})
</script>

<template>
    <div class="absolute top-0 left-0 grid h-full w-full grid-rows-2">
        <div class="flex flex-col">
            <h2>OpenLayers</h2>
            <div
                id="ol-map"
                class="grow"
            ></div>
        </div>
    </div>
</template>
