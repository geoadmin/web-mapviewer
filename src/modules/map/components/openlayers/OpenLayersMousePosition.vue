<template>
    <portal to="footer" :order="2">
        <div ref="mousePosition" class="d-flex align-items-center" data-cy="mouse-position">
            <select
                v-model="currentProjectionId"
                class="form-control-xs mx-1"
                data-cy="mouse-position-select"
                @change="onCurrentProjectionChange"
            >
                <option v-for="proj in availableProjections" :key="proj.id" :value="proj.id">
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
            currentProjectionId: CoordinateSystems.LV95.id,
            availableProjections: CoordinateSystems,
        }
    },
    created() {
        // we start by showing LV95 coordinates
        this.mousePositionControl = new MousePosition({
            className: 'mouse-position',
            undefinedHTML: '&nbsp;',
        })
    },
    mounted() {
        const map = this.getMap()
        // see https://portal-vue.linusb.org/guide/caveats.html#refs
        this.$nextTick().then(() => {
            this.$nextTick(() => {
                this.mousePositionControl.setTarget(this.$refs.mousePosition)
                this.mousePositionControl.setCoordinateFormat(CoordinateSystems.LV95.format)
                this.mousePositionControl.setProjection(getProjection(CoordinateSystems.LV95.epsg))
                if (map) {
                    map.addControl(this.mousePositionControl)
                }
            })
        })
    },
    unmounted() {
        const map = this.getMap()
        if (map) {
            map.removeControl(this.mousePositionControl)
        }
    },
    methods: {
        onCurrentProjectionChange: function () {
            const newProjection = CoordinateSystems[this.currentProjectionId]
            this.mousePositionControl.setProjection(getProjection(newProjection.epsg))
            this.mousePositionControl.setCoordinateFormat(newProjection.format)
        },
    },
}
</script>
