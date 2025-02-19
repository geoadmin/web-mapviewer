<script setup lang="ts">
import type { SingleCoordinate } from '@geoadmin/coordinates'
import type { ZoomPluginOptions } from 'chartjs-plugin-zoom/types/options'

import { round } from '@geoadmin/numbers'
import {
    type Chart,
    type ChartData,
    type ChartOptions,
    type Point as ChartPoint,
    type ScaleOptions,
    type TooltipItem,
    type TooltipModel,
} from 'chart.js'
import { resetZoom } from 'chartjs-plugin-zoom'
import {
    type ComponentPublicInstance,
    computed,
    type ComputedRef,
    onMounted,
    onUnmounted,
    type Ref,
    ref,
    useTemplateRef,
} from 'vue'
import { Line as LineChart } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'

import type { ElevationProfile, ElevationProfilePoint } from '@/profile.api'
import type { ElevationProfileMetadata } from '@/utils'

const GAP_BETWEEN_TOOLTIP_AND_PROFILE = 12 // px

export type PointBeingHovered = {
    elevation: number
    dist: number
    coordinates: SingleCoordinate[]
    screenPosition: SingleCoordinate[]
    hasElevationData: boolean
}

interface ScreenPoint extends ElevationProfilePoint {
    screenPosition: [number, number]
}

interface ElevationProfilePlotProps {
    profile: ElevationProfile
}

const { profile } = defineProps<ElevationProfilePlotProps>()

const track = ref(false)
const pointBeingHovered: Ref<ScreenPoint | null> = ref(null)

const profileMetadata: ComputedRef<ElevationProfileMetadata | undefined> = computed(
    () => profile?.metadata
)
const totalLinearDist: ComputedRef<number> = computed(
    () => profileMetadata.value?.totalLinearDist ?? 0
)
const maxElevation: ComputedRef<number> = computed(() => profileMetadata.value?.maxElevation ?? 0)
const minElevation: ComputedRef<number> = computed(() => profileMetadata.value?.minElevation ?? 0)

const profileChartContainer = useTemplateRef<HTMLDivElement>('profileChartContainer')
const profileTooltip = useTemplateRef<HTMLDivElement>('profileTooltip')
const chart = useTemplateRef<ComponentPublicInstance<typeof LineChart>>('chart')

const { t } = useI18n()

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
const unitUsedOnDistanceAxis = computed(() => (totalLinearDist.value >= 10000 ? 'km' : 'm'))
const factorToUseForDisplayedDistances = computed(() =>
    unitUsedOnDistanceAxis.value === 'km' ? 0.001 : 1.0
)
const tenPercentOfElevationDelta = computed(() =>
    round((maxElevation.value - minElevation.value) / 10.0)
)
/**
 * Defines a buffer of 10% of the elevation delta (with a minimum of 5m), so that there is always
 * some plot/chart below the lowest point (it will not be glued to the X axis line, but drawn a bit
 * above)
 */
const yAxisMinimumValue = computed(() =>
    Math.max(
        Math.floor(minElevation.value) - Math.max(Math.floor(tenPercentOfElevationDelta.value), 5),
        0
    )
)
/**
 * Same things as the minimum value, will give a 10% of the elevation delta as buffer, with a
 * minimum of 5meters
 */
const yAxisMaxValue = computed(
    () => Math.ceil(maxElevation.value) + Math.max(Math.ceil(tenPercentOfElevationDelta.value), 5)
)

/**
 * Encapsulate ChartJS profile plot generation.
 *
 * Updates the plot if the profile data changes.
 */

/** Definition of the data ChartJS will show, with some styling configuration too */
const chartJsData: ComputedRef<ChartData<'line'>> = computed(() => {
    const data: ChartData<'line'> = {
        datasets: [
            {
                label: `${t('elevation')}`,
                data: profile.segments.flatMap((segment) =>
                    segment.points.map((point) => ({ x: point.dist, y: point.elevation, ...point }))
                ) as ChartPoint[],
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
    return data
})
/** Definition of axis for the profile chart */
const chartJsScalesConfiguration: ComputedRef<
    { [key: string]: ScaleOptions<'linear'> } | undefined
> = computed(() => {
    if (!profileMetadata.value) {
        return undefined
    }
    const scales: { [key: string]: ScaleOptions<'linear'> } = {
        x: {
            type: 'linear',
            max: totalLinearDist.value,
            title: {
                display: true,
                text: `${t('distance_label')} [${unitUsedOnDistanceAxis.value}]`,
                font: {
                    weight: 'bold',
                },
                // removing the padding so that we gain a bit of vertical space
                padding: 0,
            },
            ticks: {
                // processing distance number to be more human-readable
                callback: (val: number | string) =>
                    round(Number(val) * factorToUseForDisplayedDistances.value, 1),
            },
        },
        y: {
            title: {
                display: true,
                text: `${t('elevation')} [m]`,
                font: {
                    weight: 'bold',
                },
            },
            min: yAxisMinimumValue.value,
            max: yAxisMaxValue.value,
        },
    }
    return scales
})

/** Defines how the mouse-over tooltip will behave */
const chartJsTooltipConfiguration = computed(() => {
    return {
        enabled: false,
        position: 'bottom',
        external: (tooltipModel: { chart: Chart; tooltip: TooltipModel<'line'> }) => {
            const { chart, tooltip } = tooltipModel
            if (!tooltip.dataPoints) {
                return
            }
            const tooltipElement = profileTooltip.value
            if (!tooltipElement) {
                return
            }
            if (tooltipElement.style.opacity === '0') {
                clearHoverPosition()
                return
            }
            if (tooltip.dataPoints.length > 0 && track.value) {
                const point: TooltipItem<'line'> = tooltip.dataPoints[0]
                const elevationDataInPoint: ElevationProfilePoint =
                    point.raw as ElevationProfilePoint
                const chartPosition = chart.canvas.getBoundingClientRect()
                pointBeingHovered.value = {
                    elevation: elevationDataInPoint.elevation,
                    dist: round(
                        (elevationDataInPoint.dist ?? 0) * factorToUseForDisplayedDistances.value,
                        2
                    ),
                    coordinate: elevationDataInPoint.coordinate,
                    screenPosition: [
                        round(point.element.x + chartPosition.left),
                        round(point.element.y + chartPosition.top),
                    ],
                    hasElevationData: elevationDataInPoint.hasElevationData,
                }
            } else {
                clearHoverPosition()
            }
        },
    }
})
/** Configuration for the pinch/zoom function */
const chartJsZoomOptions: ComputedRef<ZoomPluginOptions | undefined> = computed(() => {
    if (!profileMetadata.value) {
        return undefined
    }
    const zoomOptions: ZoomPluginOptions = {
        limits: {
            x: {
                min: 0,
                max: totalLinearDist.value,
                // if we have a profile above 10km, we limit the zoom to a 3km portion (otherwise labels are
                // all messed up as they are rounded to the nearest km value)
                // with profile below 10km, we limit the zoom to 100m
                minRange: unitUsedOnDistanceAxis.value === 'km' ? 3000 : 100,
            },
            y: {
                min: 0,
                max: maxElevation.value,
                minRange: 10,
            },
        },
        pan: {
            enabled: true,
            // no panning on the elevation axis, only on the distance axis
            mode: 'x',
            onPanStart: stopPositionTracking,
            onPanComplete: startPositionTracking,
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
            onZoomStart: stopPositionTracking,
            onZoomComplete: startPositionTracking,
        },
    }
    return zoomOptions
})
const chartJsOptions: ComputedRef<ChartOptions<'line'> | undefined> = computed(() => {
    if (
        !chartJsScalesConfiguration.value ||
        !chartJsTooltipConfiguration.value ||
        !chartJsZoomOptions.value ||
        !profile
    ) {
        return undefined
    }
    const options: ChartOptions<'line'> = {
        animation: {
            duration: 250,
        },
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 100,
        plugins: {
            zoom: chartJsZoomOptions.value,
            legend: {
                display: false,
            },
            tooltip: chartJsTooltipConfiguration.value,
            noData: {
                profile,
                noDataText: t('profile_no_data'),
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
    return options
})

let resizeObserver: ResizeObserver | undefined
onMounted(() => {
    window.addEventListener('beforeprint', resizeChartForPrint)
    window.addEventListener('afterprint', resizeChart)

    if (profileChartContainer.value) {
        resizeObserver = new ResizeObserver(resizeChart)
        resizeObserver.observe(profileChartContainer.value)
    }
})

onUnmounted(() => {
    window.removeEventListener('beforeprint', resizeChartForPrint)
    window.removeEventListener('afterprint', resizeChart)

    resizeObserver?.disconnect()
})

function startPositionTracking() {
    track.value = true
}
function stopPositionTracking(): boolean {
    track.value = false
    return true
}
function clearHoverPosition() {
    pointBeingHovered.value = null
}
function resetZoomToBaseValue() {
    resetZoom(chart.value?.chart, 'none') // ref for chart
}
function resizeChartForPrint() {
    // Here in order to have a nice PDF print of the profile we need to resize it to a fix
    // size somehow. If we don't do this then the print is a bit deformed and pixelized.
    // The resize to 1024x1024 is a choice that provide a nice output
    chart.value?.chart.resize(1024, 1024)
}
function resizeChart() {
    chart.value?.chart.resize()
}
</script>
<template>
    <div
        ref="profileChartContainer"
        class="flex flex-grow-1 overflow-hidden min-h-100px p-2"
        @mouseenter="startPositionTracking"
        @mouseleave="stopPositionTracking"
    >
        <LineChart
            v-if="chartJsOptions"
            ref="chart"
            :data="chartJsData"
            :options="chartJsOptions"
            class="min-w-full"
            data-cy="profile-graph"
            @mouseleave="clearHoverPosition"
            @contextmenu.prevent="resetZoomToBaseValue"
        />
    </div>
    <div
        ref="profileTooltip"
        data-cy="profile-popup-tooltip"
    >
        <div
            v-if="pointBeingHovered && pointBeingHovered.hasElevationData"
            class="profile-tooltip-inner p-1 m-auto"
        >
            <div>
                <small>
                    <strong>{{ t('profile_x_label') }}: </strong>
                    <span class="distance">
                        {{ pointBeingHovered.dist }} {{ unitUsedOnDistanceAxis }}
                    </span>
                </small>
            </div>
            <div>
                <small>
                    <strong>{{ t('profile_y_label') }}: </strong>
                    <span
                        v-if="pointBeingHovered.elevation && pointBeingHovered.elevation > 0"
                        class="elevation"
                    >
                        {{ pointBeingHovered.elevation }} m
                    </span>
                    <span v-else>{{ t('not_available') }}</span>
                </small>
            </div>
        </div>
        <div
            ref="profileTooltipArrow"
            class="absolute p-2"
            :style="tooltipArrowStyle"
        />
        <slot />
    </div>
</template>
