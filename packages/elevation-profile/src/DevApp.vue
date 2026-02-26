<script setup lang="ts">
import type { Raw } from 'vue'

import { LV95, WGS84, registerProj4 } from '@swissgeo/coordinates'
import { getLV95ViewConfig, getLV95WMTSTileGrid } from '@swissgeo/coordinates/ol'
import log from '@swissgeo/log'
import {
    Viewer as CesiumViewer,
    CesiumTerrainProvider,
    ImageryLayer as CesiumImageryLayer,
    UrlTemplateImageryProvider as CesiumUrlTemplateImageryProvider,
    Rectangle as CesiumRectangle,
    Cartesian3 as CesiumCartesian3,
    Math as CesiumMath,
} from 'cesium'
import OLTileLayer from 'ol/layer/Tile'
import OLMap from 'ol/Map'
import { register } from 'ol/proj/proj4'
import XYZ from 'ol/source/XYZ'
import OLView from 'ol/View'
import proj4 from 'proj4'
import { markRaw, onMounted } from 'vue'

import { logConfig } from '@/config'
import SwissGeoElevationProfile from '@/SwissGeoElevationProfile.vue'
import SwissGeoElevationProfileCesiumBridge from '@/SwissGeoElevationProfileCesiumBridge.vue'
import SwissGeoElevationProfileOpenLayersBridge from '@/SwissGeoElevationProfileOpenLayersBridge.vue'

registerProj4(proj4)
register(proj4)

let olMap: Raw<OLMap>
let cesiumViewer: Raw<CesiumViewer>

function setupOpenLayers() {
    olMap = markRaw(
        new OLMap({
            target: 'ol-map',
            layers: [
                new OLTileLayer({
                    source: new XYZ({
                        url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/2056/{z}/{x}/{y}.jpeg',
                        projection: LV95.epsg,
                        tileGrid: getLV95WMTSTileGrid(),
                    }),
                }),
            ],
            view: new OLView({
                ...getLV95ViewConfig(),
            }),
        })
    )
}

async function setupCesium() {
    cesiumViewer = markRaw(
        new CesiumViewer('cesium-map', {
            animation: false,
            timeline: false,
            baseLayerPicker: false,
            infoBox: false,
            selectionIndicator: false,
            fullscreenButton: false,
            navigationHelpButton: false,
            homeButton: false,
            sceneModePicker: false,
            geocoder: false,

            terrainProvider: await CesiumTerrainProvider.fromUrl(
                'https://3d.geo.admin.ch/ch.swisstopo.terrain.3d/v1/'
            ),
            baseLayer: new CesiumImageryLayer(
                new CesiumUrlTemplateImageryProvider({
                    url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swisstlm3d-karte-farbe.3d/default/current/3857/{z}/{x}/{y}.jpeg',
                    minimumLevel: 8,
                    maximumLevel: 17,
                    rectangle: CesiumRectangle.fromDegrees(...LV95.getBoundsAs(WGS84).flatten),
                })
            ),
        })
    )
    cesiumViewer.camera.setView({
        destination: CesiumCartesian3.fromDegrees(
            WGS84.bounds.center[0],
            WGS84.bounds.center[1],
            250000
        ),
        orientation: {
            pitch: CesiumMath.toRadians(-90),
        },
    })
}

onMounted(() => {
    setupOpenLayers()
    setupCesium().catch((error) => {
        log.error({
            ...logConfig,
            messages: ['Could not load cesium', error],
        })
    })
})
</script>

<template>
    <div class="absolute top-0 left-0 grid h-full w-full grid-rows-2">
        <SwissGeoElevationProfile
            :locale="'de'"
            :title="'test'"
            :points="[
                [2500000, 1000000],
                [2800000, 1400000],
            ]"
            :projection="LV95.epsg"
        >
            <SwissGeoElevationProfileOpenLayersBridge
                v-if="olMap"
                :ol-instance="olMap"
            />
            <SwissGeoElevationProfileCesiumBridge
                v-if="cesiumViewer"
                :cesium-viewer="cesiumViewer"
                :input-projection="LV95"
            />
        </SwissGeoElevationProfile>
        <div class="grid grow grid-cols-2">
            <div id="ol-map"></div>
            <div
                id="cesium-map"
                class="relative top-0 left-0 h-full w-full"
            ></div>
        </div>
    </div>
</template>

<style>
.cesium-viewer .cesium-widget-credits {
    display: none !important;
}
.cesium-viewer,
.cesium-viewer .cesium-viewer-cesiumWidgetContainer,
.cesium-viewer .cesium-widget,
.cesium-viewer canvas {
    position: relative;
    width: 100% !important;
    height: 100% !important;
}
</style>
