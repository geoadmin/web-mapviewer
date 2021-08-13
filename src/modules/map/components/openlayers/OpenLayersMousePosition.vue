<template>
    <div id="mouse-position" ref="mousePosition">
        <select data-cy="mouse-position-select" @change="changeProjection($event.target.value)">
            <option v-for="proj in availableDisplayProjections" :key="proj" :value="proj">
                {{ proj }}
            </option>
        </select>
    </div>
</template>

<script>
import MousePosition from 'ol/control/MousePosition'
import { createStringXY, toStringXY, toStringHDMS } from 'ol/coordinate'
import { get as getProjection } from 'ol/proj'
import { forward as LLtoMGRS, LLtoUTM } from '@/utils/militaryGridProjection'
import { formatThousand } from '@/utils/numberUtils'

export default {
    inject: ['getMap'],
    data: function () {
        return {
            mousePositionControl: null,
            projection: 'EPSG:3857',
            availableDisplayProjections: ['LV95', 'LV03', 'MGRS', 'UTM', 'WGS1984'],
            mousePositionProjections: {
                LV95: {
                    epsg: 'EPSG:2056',
                    label: 'CH1903+ / LV95',
                    format: function (coord) {
                        return toStringXY(coord, 5)
                    },
                },
                LV03: {
                    epsg: 'EPSG:21781',
                    label: 'CH1903 / LV03',
                    format: function (coord) {
                        return toStringXY(coord, 2)
                    },
                },
                WGS1984: {
                    epsg: 'EPSG:4326',
                    label: 'WGS1984',
                    format: function (coord) {
                        return toStringHDMS(coord, 2)
                    },
                },
                UTM: {
                    epsg: 'EPSG:4326',
                    label: 'UTM',
                    format: function (coord) {
                        let c = LLtoUTM({ lat: coord[1], lon: coord[0] })
                        return `${c.zoneNumber}${c.zoneLetter} ${formatThousand(c.easting)}
                        ${formatThousand(c.northing)}`
                    },
                },
                MGRS: {
                    epsg: 'EPSG:4326',
                    label: 'MGRS',
                    format: function (coord) {
                        return LLtoMGRS(coord, 5)
                    },
                },
            },
        }
    },
    mounted() {
        const map = this.getMap()
        if (!this.mousePositionControl) {
            this.mousePositionControl = new MousePosition({
                coordinateFormat: createStringXY(0),
                projection: this.projection,
                target: this.$refs.mousePosition,
                undefinedHTML: '&nbsp;',
            })
        }
        if (map) {
            map.addControl(this.mousePositionControl)
        }
    },
    destroyed() {
        const map = this.getMap()
        if (map) {
            map.removeControl(this.mousePositionControl)
        }
    },
    methods: {
        changeProjection: function (projCode) {
            this.projection = this.mousePositionProjections[projCode].epsg
            this.mousePositionControl.setProjection(getProjection(this.projection))
            this.mousePositionControl.setCoordinateFormat(
                this.mousePositionProjections[projCode].format
            )
        },
        createCoordinatesString: function (coord) {
            return toStringXY(coord, 5)
        },
    },
}
</script>

<style lang="scss">
@import 'src/scss/bootstrap-theme';
@import 'src/scss/variables';
#mouse-position {
    position: absolute;
    // placing Mouse position over the footer to free some map screen space
    bottom: 1rem;
    height: 1rem;
    width: 450px;
    left: 150px;
    font-size: 12px;
    select {
        height: auto;
        min-height: inherit;
        width: auto;
        font-size: inherit;
        padding: 5px;
        color: #555;
        background-color: #fff;
        background-image: none;
        border: 1px solid #ccc;
        box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
    }
    // OL Map is at z-index 10
    z-index: 20;
    .ol-mouse-position {
        text-align: center;
        font-weight: normal;
        bottom: 0;
        left: 50;
        font-size: 12px;
        background: rgba(255, 255, 255, 0.6);
        .ol-mouse-position-inner {
            color: $black;
            border: 2px solid $black;
            border-top: none;
        }
    }
}
</style>
