<template>
    <portal to="footer" :order="2">
        <div ref="mousePosition" class="d-flex">
            <select
                v-model="projection"
                class="form-control from-select-sm mx-1"
                data-cy="mouse-position-select"
            >
                <option v-for="proj in availableProjections" :key="proj.id" :value="proj">
                    {{ proj.label }}
                </option>
            </select>
            <!-- Here OpenLayers will inject a div with the class mouse-position -->
        </div>
    </portal>
</template>

<script>
import MousePosition from 'ol/control/MousePosition'
import { get as getProjection } from 'ol/proj'
import { CoordinateSystems } from '@/utils/coordinateUtils'

export default {
    inject: ['getMap'],
    data: function () {
        return {
            mousePositionControl: new MousePosition({
                coordinateFormat: CoordinateSystems.LV95.format,
                projection: getProjection(CoordinateSystems.LV95.epsg),
                className: 'mouse-position',
                undefinedHTML: '&nbsp;',
            }),
            // we start by showing LV95 coordinates
            projection: CoordinateSystems.LV95,
            availableProjections: CoordinateSystems,
        }
    },
    watch: {
        projection: function (newProj) {
            this.mousePositionControl.setProjection(getProjection(newProj.epsg))
            this.mousePositionControl.setCoordinateFormat(newProj.format)
        },
    },
    mounted() {
        const map = this.getMap()
        // see https://portal-vue.linusb.org/guide/caveats.html#refs
        this.$nextTick().then(() => {
            this.$nextTick(() => {
                this.mousePositionControl.setTarget(this.$refs.mousePosition)
                if (map) {
                    map.addControl(this.mousePositionControl)
                }
            })
        })
    },
    destroyed() {
        const map = this.getMap()
        if (map) {
            map.removeControl(this.mousePositionControl)
        }
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/bootstrap-theme';
</style>
