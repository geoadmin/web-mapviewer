<template>
    <select
        v-model="displayedFormatId"
        class="map-projection form-control-xs"
        data-cy="mouse-position-select"
        @change="setDisplayedFormatWithId"
    >
        <option v-for="format in availableFormats" :key="format.id" :value="format.id">
            {{ format.label }}
        </option>
    </select>
    <div ref="mousePosition" class="mouse-position" data-cy="mouse-position"></div>
</template>
<script>
import { DEFAULT_PROJECTION } from '@/config'
import allFormats, { LV03Format, LV95Format } from '@/utils/coordinates/coordinateFormat'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import log from '@/utils/logging'
import MousePosition from 'ol/control/MousePosition'

export default {
    inject: ['getMap'],
    props: {
        projection: {
            type: CoordinateSystem,
            default: DEFAULT_PROJECTION,
        },
    },
    data() {
        return {
            availableFormats: allFormats,
            displayedFormatId: LV95Format.id,
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
            this.setDisplayedFormatWithId()
        })
    },
    unmounted() {
        this.getMap().removeControl(this.mousePositionControl)
    },
    methods: {
        setDisplayedFormatWithId() {
            const displayedFormat = allFormats.find(
                (format) => format.id === this.displayedFormatId
            )
            if (displayedFormat) {
                this.mousePositionControl.setCoordinateFormat((coordinates) => {
                    if (this.showCoordinateLabel(displayedFormat)) {
                        return `${this.$t('coordinates_label')} ${displayedFormat.format(
                            coordinates,
                            this.projection
                        )}`
                    }
                    return displayedFormat.format(coordinates, this.projection, true)
                })
            } else {
                log.error('Unknown coordinates display format', this.displayedFormatId)
            }
        },
        showCoordinateLabel(displayedFormat) {
            return displayedFormat?.id === LV95Format.id || displayedFormat?.id === LV03Format.id
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
