<script setup>
import { resetZoom } from 'chartjs-plugin-zoom'
import { computed, onMounted, onUnmounted, ref, toRefs } from 'vue'
import { Line as LineChart } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import ElevationProfile from '@/api/profile/ElevationProfile.class'
import FeatureElevationProfilePlotCesiumBridge from '@/modules/infobox/FeatureElevationProfilePlotCesiumBridge.vue'
import FeatureElevationProfilePlotOpenLayersBridge from '@/modules/infobox/FeatureElevationProfilePlotOpenLayersBridge.vue'
import { FeatureStyleColor } from '@/utils/featureStyleUtils'
import { round } from '@/utils/numberUtils'

const GAP_BETWEEN_TOOLTIP_AND_PROFILE = 12 // px

/**
 * @typedef PointBeingHovered
 * @type {object}
 * @property {[Number, Number]} coordinates
 * @property {[Number, Number]} screenPosition
 * @property {Number} dist
 * @property {Number} elevation
 * @property {Boolean} hasElevationData
 */
const dispatcher = { dispatcher: 'FeatureElevationProfilePlot.vue' }

// data
const track = ref(false)
const pointBeingHovered = ref(null)
// refs
const profileChartContainer = ref(null)
const profileTooltip = ref(null)
const chart = ref(null)
// props
const props = defineProps({
    elevationProfile: {
        type: ElevationProfile,
        required: true,
    },
    trackingPointColor: {
        type: FeatureStyleColor,
        required: true,
    },
    animation: { type: Boolean, default: true },
})

const { elevationProfile, trackingPointColor, animation } = toRefs(props)
const store = useStore()
const i18n = useI18n()
// computed
const is3dActive = computed(() => store.state.cesium.active)
const tooltipStyle = computed(() => {
    if (!pointBeingHovered.value) {
        return {}
    }
    const tooltipWidth = profileTooltip.value.clientWidth
    const chartPosition = profileChartContainer.value.getBoundingClientRect()
    let leftPosition = pointBeingHovered.value.screenPosition[0] - tooltipWidth / 2.0
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
            pointBeingHovered.value.screenPosition[1] - 58 - GAP_BETWEEN_TOOLTIP_AND_PROFILE
        }px`,
        left: `${leftPosition}px`,
    }
})
const tooltipArrowStyle = computed(() => {
    if (!pointBeingHovered.value) {
        return {}
    }
    return {
        // see tooltipStyle() above, we've given a gap between the tooltip and arrow
        // we then have to raise the arrow one more pixel so that it overlaps the tooltip
        // and hide the tooltip's border (giving the impression it is part of the tooltip)
        top: `${pointBeingHovered.value.screenPosition[1] - GAP_BETWEEN_TOOLTIP_AND_PROFILE - 1}px`,
        // arrow size is 9px
        left: `${pointBeingHovered.value.screenPosition[0] - 9}px`,
    }
})
/**
 * If the max distance of the profile is greater than 10'000m, we use kilometer as unit, otherwise
 * meters
 */
const unitUsedOnDistanceAxis = computed(() =>
    elevationProfile.value.maxDist >= 10000 ? 'km' : 'm'
)
const factorToUseForDisplayedDistances = computed(() =>
    unitUsedOnDistanceAxis.value === 'km' ? 0.001 : 1.0
)
const tenPercentOfElevationDelta = computed(() =>
    round((elevationProfile.value.maxElevation - elevationProfile.value.minElevation) / 10.0)
)
/**
 * Defines a buffer of 10% of the elevation delta (with a minimum of 5m), so that there is always
 * some plot/chart below the lowest point (it will not be glued to the X axis line, but drawn a bit
 * above)
 */
const yAxisMinimumValue = computed(() =>
    Math.max(
        Math.floor(elevationProfile.value.minElevation) -
            Math.max(Math.floor(tenPercentOfElevationDelta.value), 5),
        0
    )
)
/**
 * Same things as the minimum value, will give a 10% of the elevation delta as buffer, with a
 * minimum of 5meters
 */
const yAxisMaxValue = computed(
    () =>
        Math.ceil(elevationProfile.value.maxElevation) +
        Math.max(Math.ceil(tenPercentOfElevationDelta.value), 5)
)

/**
 * Encapsulate ChartJS profile plot generation.
 *
 * Updates the plot if the profile data changes.
 */

/** Definition of the data ChartJS will show, with some styling configuration too */
const chartJsData = computed(() => {
    return {
        datasets: [
            {
                label: `${i18n.t('elevation')}`,
                data: elevationProfile.value.segmentPoints,
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
})
/** Definition of axis for the profile chart */
const chartJsScalesConfiguration = computed(() => {
    return {
        x: {
            type: 'linear',
            max: elevationProfile.value.maxDist,
            title: {
                display: true,
                text: `${i18n.t('distance_label')} [${unitUsedOnDistanceAxis.value}]`,
                font: {
                    weight: 'bold',
                },
                // removing the padding so that we gain a bit of vertical space
                padding: 0,
            },
            ticks: {
                // processing distance number to be more human-readable
                callback: (val) => round(val * factorToUseForDisplayedDistances.value, 1),
            },
        },
        y: {
            title: {
                display: true,
                text: `${i18n.t('elevation')} [m]`,
                font: {
                    weight: 'bold',
                },
            },
            min: yAxisMinimumValue.value,
            max: yAxisMaxValue.value,
        },
    }
})

/** Defines how the mouse-over tooltip will behave */
const chartJsTooltipConfiguration = computed(() => {
    return {
        enabled: false,
        external: ({ chart, tooltip }) => {
            if (!tooltip.dataPoints) {
                return
            }
            const tooltipElement = profileTooltip.value
            if (!tooltipElement) {
                return
            }
            if (tooltipElement.opacity === 0) {
                clearHoverPosition()
                return
            }
            if (tooltip.dataPoints.length > 0 && track.value) {
                const point = tooltip.dataPoints[0]
                const chartPosition = chart.canvas.getBoundingClientRect()
                pointBeingHovered.value = {
                    elevation: point.raw.elevation,
                    dist: round(point.raw.dist * factorToUseForDisplayedDistances.value, 2),
                    coordinates: point.raw.coordinate,
                    screenPosition: [
                        round(point.element.x + chartPosition.left),
                        round(point.element.y + chartPosition.top),
                    ],
                    hasElevationData: point.raw.hasElevationData,
                }
            } else {
                clearHoverPosition()
            }
        },
    }
})
/** Configuration for the pinch/zoom function */
const chartJsZoomOptions = computed(() => {
    return {
        limits: {
            x: {
                min: 0,
                max: elevationProfile.value.maxDist.value,
                // if we have a profile above 10km, we limit the zoom to a 3km portion (otherwise labels are
                // all messed up as they are rounded to the nearest km value)
                // with profile below 10km, we limit the zoom to 100m
                minRange: unitUsedOnDistanceAxis.value === 'km' ? 3000 : 100,
            },
            y: {
                min: 0,
                max: elevationProfile.value.maxElevation,
                minRange: 10,
            },
        },
        pan: {
            enabled: true,
            // no panning on the elevation axis, only on the distance axis
            mode: 'x',
            onPanStart: stopPositionTracking.value,
            onPanComplete: startPositionTracking.value,
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
            onZoomStart: stopPositionTracking.value,
            onZoomComplete: startPositionTracking.value,
        },
    }
})
const chartJsOptions = computed(() => {
    return {
        animation: animation.value,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            zoom: chartJsZoomOptions.value,
            legend: {
                display: false,
            },
            tooltip: chartJsTooltipConfiguration.value,
            noData: {
                elevationProfile: elevationProfile.value,
                noDataText: i18n.t('profile_no_data'),
            },
        },
        scales: chartJsScalesConfiguration.value,
        // setting up interaction so that it will show the point closest to the mouse cursor on the X axis
        // even if the user is not hovering perfectly over the given point
        interaction: {
            mode: 'index',
            intersect: false,
        },
    }
})

onMounted(() => {
    if (animation.value) {
        // TODO: Here we make sure to do the resize only for the render of the print (currently when animation is disable)
        // we should in future use a dedicated variable for this.
        window.addEventListener('beforeprint', resizeChartForPrint.value)
        window.addEventListener('afterprint', resizeChart.value)
    }
})

onUnmounted(() => {
    if (animation.value) {
        window.removeEventListener('beforeprint', resizeChartForPrint.value)
        window.removeEventListener('afterprint', resizeChart.value)
    }
})

function startPositionTracking() {
    track.value = true
}
function stopPositionTracking() {
    track.value = false
}
function clearHoverPosition() {
    pointBeingHovered.value = null
}
function resetZoomToBaseValue() {
    resetZoom(chart.value.chart, 'none') // ref for chart
}
function resizeChartForPrint() {
    // Here in order to have a nice PDF print of the profile we need to resize it to a fix
    // size somehow. If we don't do this then the print is a bit deformed and pixelized.
    // The resize to 1024x1024 is a choice that provide a nice output
    chart.value.chart.resize(1024, 1024)
}
function resizeChart() {
    chart.value.chart.resize()
}
function activateSegmentIndex(index) {
    store.dispatch('setActiveSegmentIndex', { index, ...dispatcher })
}
// TODO : ref for 'chart'
</script>
<template>
    <div
        ref="profileChartContainer"
        class="profile-graph d-flex"
        @mouseenter="startPositionTracking"
        @mouseleave="stopPositionTracking"
    >
        <div v-if="elevationProfile.segmentsCount > 1" class="d-flex gap-1 segment-container">
            <button
                v-for="(_, index) in elevationProfile.segments"
                :key="index"
                class="btn text-nowrap"
                :class="{
                    'btn-primary': index === elevationProfile.activeSegmentIndex,
                    'btn-light': index !== elevationProfile.activeSegmentIndex,
                }"
                :data-cy="`profile-segment-button-${index}`"
                @click="() => activateSegmentIndex(index)"
            >
                {{ $t('profile_segment', { segmentNumber: index + 1 }) }}
            </button>
        </div>
        <!-- Here below we need to set the w-100 in order to have proper PDF print of the Chart -->
        <LineChart
            ref="chart"
            :data="chartJsData"
            :options="chartJsOptions"
            class="profile-graph-container w-100"
            data-cy="profile-graph"
            @mouseleave="clearHoverPosition"
            @contextmenu.prevent="resetZoomToBaseValue"
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
            <FeatureElevationProfilePlotOpenLayersBridge
                v-if="!is3dActive"
                :tracking-point-color="trackingPointColor"
                :coordinates="pointBeingHovered?.coordinates"
            />
            <FeatureElevationProfilePlotCesiumBridge
                v-if="is3dActive"
                :tracking-point-color="trackingPointColor"
                :coordinates="pointBeingHovered?.coordinates"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';

$profile-min-height: 150px;
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
    width: 100%;
    flex-direction: column;

    &-container {
        overflow: hidden;
        min-height: $profile-min-height;
        max-height: 2 * $profile-min-height;
        pointer-events: auto;
    }
}

.segment-container {
    overflow-x: auto;
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
