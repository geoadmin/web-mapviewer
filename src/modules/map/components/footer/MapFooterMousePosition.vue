<template>
    <div ref="mousePosition" class="mouse-position" data-cy="mouse-position"></div>
</template>

<script>
import MousePosition from 'ol/control/MousePosition'
import { get as getProjection } from 'ol/proj'
import { CoordinateSystems } from '@/utils/coordinateUtils'

export default {
    inject: ['getMap'],
    props: {
        displayedProjectionId: {
            type: String,
            required: true,
        },
    },
    watch: {
        displayedProjectionId: function () {
            this.setProjection()
        },
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
            this.setProjection()
        })
    },
    unmounted() {
        this.getMap().removeControl(this.mousePositionControl)
    },
    methods: {
        setProjection() {
            const { format, epsg } = CoordinateSystems[this.displayedProjectionId]

            this.mousePositionControl.setCoordinateFormat(format)
            this.mousePositionControl.setProjection(getProjection(epsg))
        },
    },
}
</script>

<style lang="scss" scoped>
.mouse-position {
    min-width: 10em;
    flex-grow: 1;
    text-align: left;
    white-space: nowrap;
}
</style>
