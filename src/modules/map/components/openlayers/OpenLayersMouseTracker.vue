<template>
    <select
        v-model="displayedProjectionId"
        class="map-projection form-control-xs"
        data-cy="mouse-position-select"
        @change="setDisplayedProjectionWithId"
    >
        <option
            v-for="projection in availableProjections"
            :key="projection.id"
            :value="projection.id"
        >
            {{ projection.label }}
        </option>
    </select>
    <div ref="mousePosition" class="mouse-position" data-cy="mouse-position"></div>
</template>
<script>
import allCoordinateSystems, { LV95 } from '@/utils/coordinateSystems'
import MousePosition from 'ol/control/MousePosition'
import { get as getProjection } from 'ol/proj'

export default {
    inject: ['getMap'],
    data() {
        return {
            availableProjections: allCoordinateSystems,
            displayedProjection: LV95,
            displayedProjectionId: LV95.id,
        }
    },
    created() {
        this.mousePositionControl = new MousePosition({
            className: 'mouse-position-inner',
            undefinedHTML: '&nbsp;',
        })
    },
    mounted() {
        this.mousePositionControl.setTarget(this.$refs.mousePosition)
        this.getMap().addControl(this.mousePositionControl)
        // we wait for the next cycle to set the projection, otherwise the info can
        // sometimes be lost (and we end up with a different projection in the position display)
        this.$nextTick(() => {
            this.changeCoordinateFormat()
        })
    },
    unmounted() {
        this.getMap().removeControl(this.mousePositionControl)
    },
    methods: {
        setDisplayedProjectionWithId() {
            this.displayedProjection = allCoordinateSystems.find(
                (coordinateSystem) => coordinateSystem.id === this.displayedProjectionId
            )
            this.changeCoordinateFormat()
        },
        changeCoordinateFormat() {
            const { id, format, epsg } = this.displayedProjection

            const displayFormat = id.startsWith('LV')
                ? (coordinate) => `${this.$t('coordinates_label')} ${format(coordinate)}`
                : format

            this.mousePositionControl.setCoordinateFormat(displayFormat)
            this.mousePositionControl.setProjection(getProjection(epsg))
        },
    },
}
</script>

<style lang="scss" scoped>
.mouse-position {
    display: none;
    min-width: 10em;
    text-align: left;
    white-space: nowrap;
}
@media (any-hover: hover) {
    .mouse-position {
        display: block;
    }
}
</style>
