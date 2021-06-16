<template>
    <div id="mouse-position" ref="mousePosition">
        <select @change="changeProjection($event.target.value)">
            <option v-for="proj in availableProjections" :key="proj" :value="proj">
                {{ proj }}
            </option>
        </select>
    </div>
</template>

<script>
import MousePosition from 'ol/control/MousePosition'
import { createStringXY, toStringXY, toStringHDMS } from 'ol/coordinate'
import { get as getProjection } from 'ol/proj'

export default {
    inject: ['getMap'],
    data: function () {
        return {
            mousePositionControl: null,
            projection: 'EPSG:3857',
            availableProjections: ['EPSG:3857', 'EPSG:2056', 'EPSG:21781', 'EPSG:4326'],
            mousePositionProjections: {
                'EPSG:2056': {
                    label: 'CH1903+ / LV95',
                    format: function (coord) {
                        return toStringXY(coord, 5)
                    },
                },
                'EPSG:21781': {
                    label: 'CH1903 / LV03',
                    format: function (coord) {
                        return toStringXY(coord, 2)
                    },
                },
                'EPSG:4326': {
                    label: 'WGS1984',
                    format: function (coord) {
                        return toStringHDMS(coord, 2)
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
            this.projection = projCode
            this.mousePositionControl.setProjection(getProjection(projCode))
            console.log(projCode)
            //this.mousePositionControl.setCoordinateFormat(this.createCoordinatesString)
            this.mousePositionControl.setCoordinateFormat(
                this.mousePositionProjections[projCode].format
            )
        },
        createCoordinatesString: function (coord) {
            //console.log(proj)
            return toStringXY(coord, 5)
        },
    },
}
</script>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
@import 'src/scss/variables';
#mouse-position {
    position: absolute;
    // placing Mouse position over the footer to free some map screen space
    bottom: 1rem;
    height: 1rem;
    width: 450px;
    left: 150px;
    // OL Map is at z-index 10
    z-index: 20;
    .ol-mouse-position {
        text-align: center;
        font-weight: bold;
        bottom: 0;
        left: 50;
        font-size: 14px;
        background: rgba(255, 255, 255, 0.6);
        .ol-mouse-position-inner {
            color: $black;
            border: 2px solid $black;
            border-top: none;
        }
    }
}
</style>
