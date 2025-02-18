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
    provide,
    ref,
    useTemplateRef,
} from 'vue'
import { Line as LineChart } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'

import type { ElevationProfile, ElevationProfilePoint } from '@/profile.api'
import type { ElevationProfileMetadata } from '@/utils'
import type { VueI18nTranslateFunction } from '@/vue-i18n'

import { BORDER_COLOR, FILL_COLOR, type SupportedLocales } from '@/config.ts'

const GAP_BETWEEN_TOOLTIP_AND_PROFILE = 12 // px

export type PointBeingHovered = {
    elevation: number
    dist: number
    coordinates: SingleCoordinate[]
    screenPosition: SingleCoordinate[]
    hasElevationData: boolean
}

export type ScreenPoint = ElevationProfilePoint & {
    screenPosition: [number, number]
}
type ElevationProfilePlotProps = {
    profile: ElevationProfile
}

const { profile } = defineProps<ElevationProfilePlotProps>()

const track = ref<boolean>(false)
const pointBeingHovered = ref<ScreenPoint>()

export type GetPointBeingHoveredFunction = () => ScreenPoint | undefined

provide<GetPointBeingHoveredFunction>('getPointBeingHovered', () => pointBeingHovered.value)

const profileMetadata: ComputedRef<ElevationProfileMetadata | undefined> = computed(
    () => profile?.metadata
)
const profilePoints: ComputedRef<ElevationProfilePoint[]> = computed(() =>
    profile.segments.flatMap((s) => s.points).toSorted((p1, p2) => (p2.dist ?? 0) - (p1.dist ?? 0))
)
const totalLinearDist: ComputedRef<number> = computed(
    () => profileMetadata.value?.totalLinearDist ?? 0
)
const maxElevation: ComputedRef<number> = computed(() => profileMetadata.value?.maxElevation ?? 0)
const minElevation: ComputedRef<number> = computed(() => profileMetadata.value?.minElevation ?? 0)

const profileChartContainerRef = useTemplateRef<HTMLDivElement>('profileChartContainer')
const profileTooltipRef = useTemplateRef<HTMLDivElement>('profileTooltip')
const chartRef = useTemplateRef<ComponentPublicInstance<typeof LineChart>>('chart')

type ElevationProfileMessages = {
    distance_label: string
    elevation: string
    profile_no_data: string
    profile_segment: string
    profile_title: string
    profile_x_label: string
    profile_y_label: string
    profile_not_available: string
}

const { t }: { t: VueI18nTranslateFunction<ElevationProfileMessages> } = useI18n<
    ElevationProfileMessages,
    SupportedLocales
>()

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

type TooltipStyleCSSDeclaration = {
    visibility?: 'hidden' | 'visible'
    left?: string
    top?: string
}

const tooltipStyle: ComputedRef<TooltipStyleCSSDeclaration> = computed(() => {
    const style: TooltipStyleCSSDeclaration = {}
    if (!pointBeingHovered.value) {
        style.visibility = 'hidden'
        return style
    }
    const tooltipWidth = profileTooltipRef.value?.clientWidth ?? 0
    const chartPosition = profileChartContainerRef.value?.getBoundingClientRect()

    let leftPosition: number = pointBeingHovered.value.screenPosition[0] - tooltipWidth / 2.0
    // tooltip height is 58px (see SCSS style at end of file)
    // and we leave a gap to place our arrow
    const topPosition: number =
        pointBeingHovered.value.screenPosition[1] - 58 - GAP_BETWEEN_TOOLTIP_AND_PROFILE
    if (chartPosition) {
        if (tooltipWidth !== 0 && leftPosition + tooltipWidth > chartPosition.right) {
            leftPosition = chartPosition.right - tooltipWidth
        }
        // for the left most check, we leave a 55px gap between the container's border and the tooltip
        // this way the plot Y axis labels will still be visible (not covered by the tooltip)
        if (tooltipWidth !== 0 && leftPosition < chartPosition.left + 55) {
            leftPosition = chartPosition.left + 55
        }
    }
    style.left = `${leftPosition}px`
    style.top = `${topPosition}px`
    return style
})

/**
 * /** Encapsulate ChartJS profile plot generation.
 *
 * Updates the plot if the profile data changes.
 */

/** Definition of the data ChartJS will show, with some styling configuration too */
const chartJsData: ComputedRef<ChartData<'line'>> = computed(() => {
    const data: ChartData<'line'> = {
        datasets: [
            {
                label: `${t('elevation')}`,
                data: profilePoints.value.map((point) => ({
                    x: point.dist ?? 0,
                    y: point.elevation,
                    ...point,
                })) as ChartPoint[],
                parsing: {
                    xAxisKey: 'dist',
                    yAxisKey: 'elevation',
                },
                pointRadius: 1,
                pointHoverRadius: 3,
                borderColor: BORDER_COLOR,
                borderWidth: 1,
                fill: {
                    target: 'origin',
                    above: FILL_COLOR,
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
        external: (tooltipModel: { chart: Chart; tooltip: TooltipModel<'line'> }) => {
            const { chart, tooltip } = tooltipModel
            if (!tooltip.dataPoints) {
                return
            }
            const tooltipElement = profileTooltipRef.value
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

    if (profileChartContainerRef.value) {
        resizeObserver = new ResizeObserver(resizeChart)
        resizeObserver.observe(profileChartContainerRef.value)
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
    pointBeingHovered.value = undefined
}
function resetZoomToBaseValue() {
    resetZoom(chartRef.value?.chart, 'none') // ref for chart
}
function resizeChartForPrint() {
    // Here in order to have a nice PDF print of the profile we need to resize it to a fix
    // size somehow. If we don't do this then the print is a bit deformed and pixelized.
    // The resize to 1024x1024 is a choice that provide a nice output
    chartRef.value?.chart.resize(1024, 1024)
}
function resizeChart() {
    chartRef.value?.chart.resize()
}
</script>
<template>
    <div
        ref="profileChartContainer"
        class="tw:flex tw:flex-grow-1 tw:overflow-hidden tw:min-h-100px tw:p-2"
        @mouseenter="startPositionTracking"
        @mouseleave="stopPositionTracking"
    >
        <LineChart
            v-if="chartJsOptions"
            ref="chart"
            :data="chartJsData"
            :options="chartJsOptions"
            class="tw:min-w-full"
            data-cy="profile-graph"
            @mouseleave="clearHoverPosition"
            @contextmenu.prevent="resetZoomToBaseValue"
        />
    </div>
    <div
        ref="profileTooltip"
        class="tw:fixed tw:bg-white tw:border tw:rounded tw:py-1 tw:px-2"
        :style="tooltipStyle"
        data-cy="profile-popup-tooltip"
    >
        <div
            v-if="pointBeingHovered && pointBeingHovered.hasElevationData"
            class="tw:p-1 tw:m-auto"
        >
            <div>
                <small>
                    <strong>{{ t('profile_x_label') }}: </strong>
                    {{ pointBeingHovered.dist }} {{ unitUsedOnDistanceAxis }}
                </small>
            </div>
            <div>
                <small>
                    <strong>{{ t('profile_y_label') }}: </strong>
                    <span v-if="pointBeingHovered.elevation && pointBeingHovered.elevation > 0">
                        {{ pointBeingHovered.elevation }} m
                    </span>
                    <span v-else>{{ t('profile_not_available') }}</span>
                </small>
            </div>
        </div>
        <slot />
    </div>
</template>
