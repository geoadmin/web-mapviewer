<template>
    <div
        ref="profileChartContainer"
        @mouseenter="addHoverPositionOverlay"
        @mouseleave="removeHoverPositionOverlay"
    >
        <LineChart
            ref="chart"
            :data="chartJsData"
            :options="chartJsOptions"
            class="profile-graph"
            data-cy="profile-graph"
            @mouseleave="clearHoverPosition"
            @contextmenu.prevent="resetZoom"
        />
        <div
            v-show="pointBeingHovered && track"
            ref="profileTooltip"
            class="profile-tooltip position-fixed card user-select-none"
            :style="tooltipStyle"
            data-cy="profile-popup-tooltip"
        >
            <div
                v-if="pointBeingHovered && pointBeingHovered.hasElevationData"
                class="profile-tooltip-inner p-1 m-auto"
            >
                <div>
                    <small>
                        <strong>{{ $t('profile_x_label') }}: </strong>
                        <span class="distance">
                            {{ pointBeingHovered.dist }} {{ unitUsedOnDistanceAxis }}
                        </span>
                    </small>
                </div>
                <div>
                    <small>
                        <strong>{{ $t('profile_y_label') }}: </strong>
                        <span v-if="pointBeingHovered.elevation > 0" class="elevation">
                            {{ pointBeingHovered.elevation }} m
                        </span>
                        <span v-else>{{ $t('not_available') }}</span>
                    </small>
                </div>
            </div>
            <div
                ref="profileTooltipArrow"
                class="profile-tooltip-arrow"
                :style="tooltipArrowStyle"
            ></div>
        </div>
    </div>
</template>

<script>
import ElevationProfile from '@/api/profile/ElevationProfile.class'
import { LV95, WEBMERCATOR } from '@/utils/coordinateSystems'
import { FeatureStyleColor } from '@/utils/featureStyleUtils'
import { round } from '@/utils/numberUtils'
import { resetZoom } from 'chartjs-plugin-zoom'
import Overlay from 'ol/Overlay'
import proj4 from 'proj4'
import { Line as LineChart } from 'vue-chartjs'

const GAP_BETWEEN_TOOLTIP_AND_PROFILE = 12 //px

/**
 * @typedef PointBeingHovered
 * @type {object}
 * @property {[Number, Number]} coordinates
 * @property {[Number, Number]} screenPosition
 * @property {Number} dist
 * @property {Number} elevation
 * @property {Boolean} hasElevationData
 */

/**
 * Encapsulate ChartJS profile plot generation.
 *
 * Updates the plot if the profile data changes.
 */
export default {
    components: {
        LineChart,
    },
    inject: ['getMap'],
    props: {
        elevationProfile: {
            type: ElevationProfile,
            required: true,
        },
        trackingPointColor: {
            type: FeatureStyleColor,
            required: true,
        },
    },
    emits: ['update'],
    data() {
        return {
            /**
             * Whether the mouse cursor position on the chart will be tracked, and the tooltip will
             * be visible/generated
             *
             * @type {Boolean}
             */
            track: false,
            /** @type {PointBeingHovered | null} */
            pointBeingHovered: null,
        }
    },
    computed: {
        tooltipStyle() {
            if (this.pointBeingHovered) {
                const tooltipWidth = this.$refs.profileTooltip.clientWidth
                const chartPosition = this.$refs.profileChartContainer.getBoundingClientRect()
                let leftPosition = this.pointBeingHovered.screenPosition[0] - tooltipWidth / 2.0
                if (tooltipWidth !== 0 && leftPosition + tooltipWidth > chartPosition.right) {
                    leftPosition = chartPosition.right - tooltipWidth
                }
                // for the left most check, we leave a 55px gap between the container's border and the tooltip
                // this way the plot Y axis labels will still be visible (not covered by the tooltip)
                if (tooltipWidth !== 0 && leftPosition < chartPosition.left + 55) {
                    leftPosition = chartPosition.left + 55
                }
                return {
                    // tooltip height is 58px (see SCSS style at end of file)
                    // and we leave a gap to place our arrow
                    top: `${
                        this.pointBeingHovered.screenPosition[1] -
                        58 -
                        GAP_BETWEEN_TOOLTIP_AND_PROFILE
                    }px`,
                    left: `${leftPosition}px`,
                }
            }
            return {}
        },
        tooltipArrowStyle() {
            if (this.pointBeingHovered) {
                return {
                    // see tooltipStyle() above, we've given a gap between the tooltip and arrow
                    // we then have to raise the arrow one more pixel so that it overlaps the tooltip
                    // and hide the tooltip's border (giving the impression it is part of the tooltip)
                    top: `${
                        this.pointBeingHovered.screenPosition[1] -
                        GAP_BETWEEN_TOOLTIP_AND_PROFILE -
                        1
                    }px`,
                    // arrow size is 9px
                    left: `${this.pointBeingHovered.screenPosition[0] - 9}px`,
                }
            }
            return {}
        },
        /**
         * If the max distance of the profile is greater than 10'000m, we use kilometer as unit,
         * otherwise meters
         *
         * @returns {string}
         */
        unitUsedOnDistanceAxis() {
            return this.elevationProfile.maxDist >= 10000 ? 'km' : 'm'
        },
        factorToUseForDisplayedDistances() {
            return this.unitUsedOnDistanceAxis === 'km' ? 0.001 : 1.0
        },
        tenPercentOfElevationDelta() {
            return round(
                (this.elevationProfile.maxElevation - this.elevationProfile.minElevation) / 10.0
            )
        },
        /**
         * Defines a buffer of 10% of the elevation delta (with a minimum of 5m), so that there is
         * always some plot/chart below the lowest point (it will not be glued to the X axis line,
         * but drawn a bit above)
         */
        yAxisMinimumValue() {
            return Math.max(
                Math.floor(this.elevationProfile.minElevation) -
                    Math.max(Math.floor(this.tenPercentOfElevationDelta), 5),
                0
            )
        },
        /**
         * Same things as the minimum value, will give a 10% of the elevation delta as buffer, with
         * a minimum of 5meters
         */
        yAxisMaxValue() {
            return (
                Math.ceil(this.elevationProfile.maxElevation) +
                Math.max(Math.ceil(this.tenPercentOfElevationDelta), 5)
            )
        },
        /** Definition of the data ChartJS will show, with some styling configuration too */
        chartJsData() {
            return {
                datasets: [
                    {
                        label: `${this.$t('elevation')}`,
                        data: this.elevationProfile.points,
                        parsing: {
                            xAxisKey: 'dist',
                            yAxisKey: 'elevation',
                        },
                        pointRadius: 1,
                        pointHoverRadius: 3,
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 1,
                        fill: {
                            target: 'origin',
                            above: 'rgba(255, 99, 132, 0.7)',
                        },
                        // smooth up a bit the line (can be removed/reverted to 'default' if we want a sharper line)
                        cubicInterpolationMode: 'monotone',
                    },
                ],
            }
        },
        /** Definition of axis for the profile chart */
        chartJsScalesConfiguration() {
            return {
                x: {
                    type: 'linear',
                    max: this.elevationProfile.maxDist,
                    title: {
                        display: true,
                        text: `${this.$t('distance_label')} [${this.unitUsedOnDistanceAxis}]`,
                        font: {
                            weight: 'bold',
                        },
                        // removing the padding so that we gain a bit of vertical space
                        padding: 0,
                    },
                    ticks: {
                        // processing distance number to be more human-readable
                        callback: (val) => round(val * this.factorToUseForDisplayedDistances, 1),
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: `${this.$t('elevation')} [m]`,
                        font: {
                            weight: 'bold',
                        },
                    },
                    min: this.yAxisMinimumValue,
                    max: this.yAxisMaxValue,
                },
            }
        },
        /** Defines how the mouse-over tooltip will behave */
        chartJsTooltipConfiguration() {
            return {
                enabled: false,
                external: ({ chart, tooltip }) => {
                    if (!tooltip.dataPoints) {
                        return
                    }
                    const tooltipElement = this.$refs.profileTooltip
                    if (!tooltipElement) {
                        return
                    }
                    if (tooltipElement.opacity === 0) {
                        this.clearHoverPosition()
                        return
                    }
                    if (tooltip.dataPoints.length > 0) {
                        const point = tooltip.dataPoints[0]
                        const chartPosition = chart.canvas.getBoundingClientRect()
                        this.pointBeingHovered = {
                            elevation: point.raw.elevation,
                            dist: round(point.raw.dist * this.factorToUseForDisplayedDistances, 2),
                            coordinates: point.raw.coordinate,
                            screenPosition: [
                                round(point.element.x + chartPosition.left),
                                round(point.element.y + chartPosition.top),
                            ],
                            hasElevationData: point.raw.hasElevationData,
                        }
                    } else {
                        this.clearHoverPosition()
                    }
                },
            }
        },
        /** Configuration for the pinch/zoom function */
        chartJsZoomOptions() {
            return {
                limits: {
                    x: {
                        min: 0,
                        max: this.elevationProfile.maxDist,
                        // if we have a profile above 10km, we limit the zoom to a 3km portion (otherwise labels are
                        // all messed up as they are rounded to the nearest km value)
                        // with profile below 10km, we limit the zoom to 100m
                        minRange: this.unitUsedOnDistanceAxis === 'km' ? 3000 : 100,
                    },
                    y: {
                        min: 0,
                        max: this.elevationProfile.maxElevation,
                        minRange: 10,
                    },
                },
                pan: {
                    enabled: true,
                    // no panning on the elevation axis, only on the distance axis
                    mode: 'x',
                    onPanStart: this.stopPositionTracking,
                    onPanComplete: this.startPositionTracking,
                },
                zoom: {
                    pinch: {
                        enabled: true,
                    },
                    wheel: {
                        enabled: true,
                    },
                    drag: {
                        enabled: true,
                        modifierKey: 'shift',
                    },
                    // no zooming on the elevation axis, only on the distance axis
                    mode: 'x',
                    onZoomStart: this.stopPositionTracking,
                    onZoomComplete: this.startPositionTracking,
                },
            }
        },
        chartJsOptions() {
            return {
                animation: true,
                responsive: true,
                plugins: {
                    zoom: this.chartJsZoomOptions,
                    legend: {
                        display: false,
                    },
                    tooltip: this.chartJsTooltipConfiguration,
                    noData: {
                        elevationProfile: this.elevationProfile,
                        noDataText: this.$t('profile_no_data'),
                    },
                },
                scales: this.chartJsScalesConfiguration,
                // setting up interaction so that it will show the point closest to the mouse cursor on the X axis
                // even if the user is not hovering perfectly over the given point
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
            }
        },
    },
    watch: {
        /** Updating the tracking point color if the props with the color is changed */
        trackingPointColor(newColor) {
            this.currentHoverPosOverlay.getElement().style.backgroundColor = newColor.fill
        },
        pointBeingHovered(newPoint) {
            if (newPoint) {
                this.currentHoverPosOverlay.setPosition(
                    proj4(LV95.epsg, WEBMERCATOR.epsg, newPoint.coordinates)
                )
            } else {
                this.currentHoverPosOverlay.setPosition(null)
            }
        },
    },
    mounted() {
        /* Overlay that shows the corresponding position on the map when hovering over the profile
        graph. */
        this.currentHoverPosOverlay = new Overlay({
            element: document.createElement('div'),
            positioning: 'center-center',
            stopEvent: false,
        })
        // setting up a CSS class on the element so that we can style it (see below in the <style> section)
        this.currentHoverPosOverlay.getElement().classList.add('profile-circle-current-hover-pos')
        this.currentHoverPosOverlay.getElement().style.backgroundColor =
            this.trackingPointColor.fill
        this.$nextTick(() => {
            // sending an update event after Vue-ChartJS has been rendered, so that the parent container can be resized
            // to fit the canvas from Vue-ChartJS
            // see FeatureElevationProfile and InfoboxModule height logic for more comprehension
            this.$emit('update')
        })
    },
    unmounted() {
        this.getMap().removeOverlay(this.currentHoverPosOverlay)
    },
    methods: {
        startPositionTracking() {
            this.track = true
        },
        stopPositionTracking() {
            this.track = false
        },
        addHoverPositionOverlay() {
            this.startPositionTracking()
            this.getMap().addOverlay(this.currentHoverPosOverlay)
        },
        removeHoverPositionOverlay() {
            this.stopPositionTracking()
            this.getMap().removeOverlay(this.currentHoverPosOverlay)
        },
        clearHoverPosition() {
            this.pointBeingHovered = null
        },
        resetZoom() {
            resetZoom(this.$refs.chart.chart, 'none')
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';

$arrow-width: 9px;
$tooltip-height: 58px;
$tooltip-width: 170px;

// unscoped/global rule as otherwise it will not reach OpenLayers overlay point placed on the map
:global(.profile-circle-current-hover-pos) {
    height: 20px;
    width: 20px;
    border-radius: 50%;
}

.profile-graph {
    overflow: hidden;
    width: 100%;
    min-height: 145px;
    max-height: 145px;
    pointer-events: auto;
}
.profile-tooltip {
    width: $tooltip-width;
    height: $tooltip-height;
    pointer-events: none;
    user-select: none;
    &-arrow {
        $arrow-width: 9px;
        position: fixed;
        border-width: $arrow-width $arrow-width 0;
        border-style: solid;
        border-color: $border-color transparent;
        &::after {
            $inner-arrow-width: $arrow-width - $border-width;
            content: '';
            position: absolute;
            bottom: 1px;
            left: calc(50% - $inner-arrow-width);
            border-width: $inner-arrow-width $inner-arrow-width 0;
            border-style: solid;
            border-color: #fff transparent;
        }
    }
}
</style>
