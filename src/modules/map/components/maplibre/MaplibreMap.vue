<template>
    <div id="maplibre-map">
        <div v-if="style" class="layers">
            <MaplibreInternalLayer
                v-for="(layer, index) in visibleLayers"
                :key="layer.id"
                :layer-config="layer"
                :z-index="index + (currentBackgroundLayer ? 1 : 0)"
            />
        </div>
        <slot />
    </div>
</template>

<script>
import 'maplibre-gl/dist/maplibre-gl.css'

import { cloneDeep } from 'lodash'
import { Map } from 'maplibre-gl'
import proj4 from 'proj4'
import { mapActions, mapGetters, mapState } from 'vuex'

import { VECTOR_TILES_STYLE_URL } from '@/config.js'
import MaplibreInternalLayer from '@/modules/map/components/maplibre/MaplibreInternalLayer.vue'
import { round } from '@/utils/numberUtils'

export default {
    components: { MaplibreInternalLayer },
    provide: function () {
        return {
            getMap: () => this.map,
            getStyle: () => this.style,
        }
    },
    data() {
        return {
            centerChangeTriggeredByMe: false,
            style: {},
        }
    },
    computed: {
        ...mapState({
            zoom: (state) => state.position.zoom - 1,
            pinLocation: (state) => state.map.pinLocation,
            geolocationActive: (state) => state.geolocation.active,
            geolocationPosition: (state) => state.geolocation.position,
            geolocationAccuracy: (state) => state.geolocation.accuracy,
        }),
        ...mapGetters(['centerEpsg4326', 'visibleLayers', 'currentBackgroundLayer', 'extent']),
    },
    watch: {
        centerEpsg4326: function (newCenter) {
            if (this.map) {
                if (this.centerChangeTriggeredByMe) {
                    this.centerChangeTriggeredByMe = false
                } else {
                    this.map.flyTo({
                        center: newCenter,
                        zoom: this.zoom,
                    })
                }
            }
        },
        zoom: function (newZoom) {
            if (this.map) {
                this.map.flyTo({
                    center: this.centerEpsg4326,
                    zoom: newZoom,
                })
            }
        },
    },
    beforeMount() {
        // copying default style as first style
        this.style = cloneDeep(this.defaultStyle)
    },
    mounted() {
        this.map = new Map({
            container: 'maplibre-map',
            style: VECTOR_TILES_STYLE_URL,
            center: this.centerEpsg4326,
            zoom: this.zoom,
        })

        // Click management
        let mouseDownEvent = 'mousedown'
        let mouseUpEvent = 'mouseup'
        let clickStartTimestamp = 0
        let lastClickDuration = 0
        this.map.on(mouseDownEvent, () => {
            clickStartTimestamp = performance.now()
        })
        this.map.on(mouseUpEvent, () => {
            lastClickDuration = performance.now() - clickStartTimestamp
            clickStartTimestamp = 0
        })
        this.map.on('click', (e) => {
            const clickLocation = proj4(proj4.WGS84, 'EPSG:3857', [
                round(e.lngLat.lng, 6),
                round(e.lngLat.lat, 6),
            ])
            this.click({
                coordinate: clickLocation,
                millisecondsSpentMouseDown: lastClickDuration,
            })
        })

        // position management
        this.map.on('moveend', () => {
            const mapboxCenter = this.map.getCenter()
            this.centerChangeTriggeredByMe = true
            this.setCenter(
                proj4(proj4.WGS84, 'EPSG:3857', [
                    round(mapboxCenter.lng, 6),
                    round(mapboxCenter.lat, 6),
                ])
            )
            const zoom = round(this.map.getZoom(), 3)
            if (zoom && zoom !== this.zoom) {
                this.setZoom(zoom + 1)
            }
        })
    },
    methods: {
        ...mapActions(['setZoom', 'setCenter', 'click']),
    },
}
</script>

<style>
#maplibre-map {
    width: 100%;
    height: 100%;
}
</style>
