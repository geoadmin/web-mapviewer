<template>
    <div ref="mousePosition" class="mouse-position" data-cy="mouse-position"></div>
</template>

<script>
import MousePosition from 'ol/control/MousePosition'
import { get as getProjection } from 'ol/proj'
import { mapState } from 'vuex'
import { CoordinateSystems } from '@/utils/coordinateUtils'

export default {
    inject: ['getMap'],
    computed: {
        ...mapState({
            mapProjectionId: (state) => state.map.projectionId,
        }),
    },
    created() {
        this.mousePositionControl = new MousePosition({
            className: 'mouse-position-inner',
            undefinedHTML: '&nbsp;',
        })
    },
    mounted() {
        this.mousePositionControl.setTarget(this.$refs.mousePosition)
        this.setProjection()

        this.getMap().addControl(this.mousePositionControl)

        this.unsubscribeProjection = this.$store.subscribe((mutation) => {
            if (mutation.type === 'setMapProjection') {
                this.setProjection()
            }
        })
    },
    unmounted() {
        this.getMap().removeControl(this.mousePositionControl)
        this.unsubscribeProjection()
    },
    methods: {
        setProjection() {
            const { format, epsg } = CoordinateSystems[this.mapProjectionId]

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
