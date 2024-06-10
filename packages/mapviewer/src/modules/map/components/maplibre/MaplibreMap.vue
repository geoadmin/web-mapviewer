<script setup>
import { WEBMERCATOR, WGS84 } from '@geoadmin/coordinates'
import { round } from '@geoadmin/numbers'
import { Map } from 'maplibre-gl'
import proj4 from 'proj4'
import { computed, onMounted, provide, ref, useTemplateRef, watch } from 'vue'
import { useStore } from 'vuex'

import { getVectorTilesBaseUrl } from '@/config/baseUrl.config'
import { VECTOR_LIGHT_BASE_MAP_STYLE_ID } from '@/config/vectortiles.config'
import MaplibreInternalLayer from '@/modules/map/components/maplibre/MaplibreInternalLayer.vue'

const dispatcher = {
    dispatcher: 'MapLibreMap.vue',
}

const centerChangeTriggeredByMe = ref(false)
const mapLibreMapElement = useTemplateRef('mapLibreContainer')

const store = useStore()

const zoom = computed(() => store.state.position.zoom - 1)
const centerEpsg4326 = computed(() => store.getters.centerEpsg4326)
const visibleLayers = computed(() => store.getters.visibleLayers)

let mapLibreMap

onMounted(() => {
    mapLibreMap = new Map({
        container: mapLibreMapElement.value,
        style: `${getVectorTilesBaseUrl()}styles/${VECTOR_LIGHT_BASE_MAP_STYLE_ID}/testing/poc-terrain/style.json`,
        center: centerEpsg4326.value,
        zoom: zoom.value,
        maxPitch: 75,
    })

    mapLibreMap.once('load', () => {
        store.dispatch('mapModuleReady', dispatcher)
    })

    // Click management
    let clickStartTimestamp = 0
    let lastClickDuration = 0
    mapLibreMap.on('mousedown', () => {
        clickStartTimestamp = performance.now()
    })
    mapLibreMap.on('mouseup', () => {
        lastClickDuration = performance.now() - clickStartTimestamp
        clickStartTimestamp = 0
    })
    mapLibreMap.on('click', (e) => {
        const clickLocation = proj4(WGS84.epsg, WEBMERCATOR.epsg, [
            round(e.lngLat.lng, 6),
            round(e.lngLat.lat, 6),
        ])
        store.dispatch('click', {
            coordinate: clickLocation,
            millisecondsSpentMouseDown: lastClickDuration,
            ...dispatcher,
        })
    })

    // position management
    mapLibreMap.on('moveend', () => {
        if (!mapLibreMap) {
            return
        }
        const mapboxCenter = mapLibreMap.getCenter()
        centerChangeTriggeredByMe.value = true
        store.dispatch('setCenter', {
            center: proj4(WGS84.epsg, WEBMERCATOR.epsg, [
                round(mapboxCenter.lng, 6),
                round(mapboxCenter.lat, 6),
            ]),
            ...dispatcher,
        })
        const newZoom = round(mapLibreMap.getZoom(), 3)
        if (newZoom && newZoom !== zoom.value) {
            store.dispatch('setZoom', {
                zoom: newZoom + 1,
                ...dispatcher,
            })
        }
    })
})

provide('getMapLibreMap', () => mapLibreMap)

watch(centerEpsg4326, (newCenter) => {
    if (mapLibreMap) {
        if (centerChangeTriggeredByMe.value) {
            centerChangeTriggeredByMe.value = false
        } else {
            mapLibreMap.flyTo({
                center: newCenter,
                zoom: zoom.value,
            })
        }
    }
})
watch(zoom, (newZoom) => {
    mapLibreMap?.flyTo({
        center: centerEpsg4326.value,
        zoom: newZoom,
    })
})
</script>

<template>
    <div
        ref="mapLibreContainer"
        class="maplibre-map"
    >
        <MaplibreInternalLayer
            v-for="(layer, index) in visibleLayers.toReversed()"
            :key="layer.id"
            :layer-config="layer"
            :previous-layer-id="index === 0 ? null : visibleLayers[index - 1].id"
        />
        <slot />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

.maplibre-map {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute; // Element must be positioned to set a z-index
    z-index: $zindex-map;
}
</style>
