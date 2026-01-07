<script setup lang="ts">
import OLTileLayer from 'ol/layer/Tile'
import OLMap from 'ol/Map'
import XYZ from 'ol/source/XYZ'
import { onMounted } from 'vue'

import { getLV95TileGrid, getLV95View, registerSwissGeoProjections as registerOL } from '@/ol'
import { LV95 } from '@/proj'

const pixelKarteFarbeURL = 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/2056/{z}/{x}/{y}.jpeg'

function setupOpenLayers() {

    registerOL()

    const pixelKarteFarbe = new OLTileLayer({
        source: new XYZ({
            url: pixelKarteFarbeURL,
            projection: LV95.epsg,
            tileGrid: getLV95TileGrid()
        })
    })

    new OLMap({
        target: 'ol-map',
        layers: [pixelKarteFarbe],
        view: getLV95View()
    })
}

onMounted(() => {
    setupOpenLayers()
})
</script>

<template>
    <div class="dev-app">
        <div class="map-container">
            <h2>OpenLayers</h2>
            <div
                id="ol-map"
                class="map-container-element"
            ></div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.dev-app {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: 1fr 1fr;
}
.map-container {
    display: flex;
    flex-direction: column;
    &-element {
        flex-grow: 1;
    }
}
</style>
