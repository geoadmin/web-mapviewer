<script setup lang="ts">
import type { LayerTimeConfig } from '@swissgeo/layers'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { timeConfigUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { isNumber, round } from '@swissgeo/numbers'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import { DEFAULT_YOUNGEST_YEAR } from '@/config/time.config'
import TimeSliderDropdown from '@/modules/map/components/toolbox/TimeSliderDropdown.vue'
import useLayersStore from '@/store/modules/layers'
import useUIStore from '@/store/modules/ui'
import debounce from '@/utils/debounce'

type LayerTimeConfigWithYears = LayerTimeConfig & { years: number[] }

const dispatcher: ActionDispatcher = { name: 'TimeSlider.vue' }

const { t } = useI18n()
const uiStore = useUIStore()
const layersStore = useLayersStore()

const LABEL_WIDTH = 32
const MARGIN_BETWEEN_LABELS = 50
const PLAY_BUTTON_SIZE = 54

const sliderWidth = ref(0)
const currentYear = ref<number>(DEFAULT_YOUNGEST_YEAR)
const falseYear = ref<number | undefined>()
let cursorX = 0
const playYearsWithData = ref(false)
let yearCursorIsGrabbed = false
let playYearInterval: ReturnType<typeof setTimeout> | undefined

const yearCursor = useTemplateRef<HTMLDivElement>('yearCursor')
const sliderContainer = useTemplateRef<HTMLDivElement>('sliderContainer')
const yearCursorInput = useTemplateRef<HTMLInputElement>('yearCursorInput')
const outsideRangeTooltip = useTemplateRef<{ openTooltip: () => void; closeTooltip: () => void }>(
    'outsideRangeTooltip'
)

const screenWidth = computed(() => uiStore.width)
const layersWithTimestamps = computed(() => layersStore.visibleLayersWithTimeConfig)
const activeLayers = computed(() => layersStore.activeLayers)
const youngestYear = computed(() => layersStore.youngestYear ?? 0)
const oldestYear = computed(() => layersStore.oldestYear ?? 0)
const previewYear = computed(() => layersStore.previewYear ?? 0)

const allYears = computed(() => {
    const years: number[] = []
    for (let year = oldestYear.value; year <= youngestYear.value; year++) {
        years.push(year)
    }
    return years
})

const isInputYearValid = ref(true)

const tooltipYearOutsideRangeContent = computed(
    () =>
        `${t('outside_valid_year_range')} ${allYears.value[0]}-${allYears.value[allYears.value.length - 1]}`
)

const inputYear = computed({
    get() {
        return falseYear.value ?? currentYear.value
    },
    set(value: string) {
        const parsedValue = parseInt(value)
        if (!allYears.value.includes(parsedValue)) {
            isInputYearValid.value = false
            falseYear.value = parsedValue || undefined
        } else {
            isInputYearValid.value = true
            currentYear.value = parsedValue
            falseYear.value = undefined
        }
    },
})

const yearsShownAsLabel = computed(() => {
    const amountOfLabelsOnScreen = round(sliderWidth.value / (LABEL_WIDTH + MARGIN_BETWEEN_LABELS))

    let yearThreshold = 10
    if (amountOfLabelsOnScreen < 10) {
        yearThreshold = 50
    } else if (amountOfLabelsOnScreen < 16) {
        yearThreshold = 25
    }
    return allYears.value.filter((year) => year % yearThreshold === 0)
})

const innerBarStyle = computed(() => ({ width: `${sliderWidth.value}px` }))
const yearPositionOnSlider = computed(
    () => (1 + allYears.value.indexOf(currentYear.value)) * distanceBetweenLabels.value + 42
)
const cursorPosition = computed(() => {
    const yearCursorWidth = yearCursor.value?.clientWidth || 0
    return `${Math.max(yearPositionOnSlider.value - yearCursorWidth / 2 + 4.5, 0)}px`
})
const cursorArrowPosition = computed(() => ({ left: `${yearPositionOnSlider.value - 4.5}px` }))
const distanceBetweenLabels = computed(() => sliderWidth.value / allYears.value.length)
const innerBarStepStyle = computed(() => ({ width: `${distanceBetweenLabels.value}px` }))
const yearsWithData = computed(() => {
    const timeConfigs = layersWithTimestamps.value.map((layer) => layer.timeConfig)
    if (timeConfigs.some((timeConfig) => !timeConfig || !('years' in timeConfig))) {
        return {
            yearsJoint: [],
            yearsSeparate: [],
        }
    }
    let yearsJoint = Array.isArray((timeConfigs[0] as LayerTimeConfigWithYears).years)
        ? [...(timeConfigs[0] as LayerTimeConfigWithYears).years]
        : []
    let yearsSeparate: number[] = []
    timeConfigs.forEach((timeConfig) => {
        if (!('years' in timeConfig) || !Array.isArray(timeConfig.years)) {
            return
        }
        timeConfig.years
            .filter((year) => !yearsSeparate.includes(year))
            .forEach((year) => yearsSeparate.push(year))
    })
    if (timeConfigs.length > 1) {
        timeConfigs.slice(1).forEach((timeConfig) => {
            yearsJoint = yearsJoint.filter((year) =>
                (timeConfig as LayerTimeConfigWithYears).years.includes(year)
            )
        })
    }
    yearsSeparate = yearsSeparate.filter((year) => !yearsJoint.includes(year))
    return {
        yearsJoint: yearsJoint.sort((a, b) => b - a).filter((year) => isNumber(year)),
        yearsSeparate: yearsSeparate.sort((a, b) => b - a).filter((year) => isNumber(year)),
    }
})

watch(screenWidth, () => {
    setSliderWidth()
})

watch(isInputYearValid, (newValue) => {
    if (!newValue) {
        outsideRangeTooltip.value?.openTooltip()
    } else {
        outsideRangeTooltip.value?.closeTooltip()
    }
})

onMounted(() => {
    log.debug({
        title: 'TimeSlider.vue',
        titleColor: LogPreDefinedColor.Blue,
        message: [`Activating time slider, previewYear=${previewYear.value}`],
    })
    setSliderWidth()

    if (previewYear.value === undefined) {
        if (
            layersWithTimestamps.value.length === 1 &&
            'currentYear' in layersWithTimestamps.value[0]!.timeConfig &&
            allYears.value.includes(layersWithTimestamps.value[0]!.timeConfig.currentYear as number)
        ) {
            currentYear.value = layersWithTimestamps.value[0]!.timeConfig.currentYear as number
        } else if (yearsWithData.value.yearsJoint.length > 0) {
            currentYear.value = yearsWithData.value.yearsJoint[0]!
        } else if (yearsWithData.value.yearsSeparate[0]) {
            currentYear.value = yearsWithData.value.yearsSeparate[0]
        } else {
            return
        }

        dispatchPreviewYearToStore()
    } else {
        currentYear.value = previewYear.value
        setPreviewYearToLayers()
    }

    log.debug({
        title: 'TimeSlider.vue',
        titleColor: LogPreDefinedColor.Blue,
        message: [`Time slider activated, currentYear=${currentYear.value}`],
    })
    window.addEventListener('keydown', handleKeyDownEvent)

    watch(currentYear, () => {
        falseYear.value = undefined
        isInputYearValid.value = true
        dispatchPreviewYearToStoreDebounced()
    })

    watch(layersWithTimestamps, () => {
        dispatchPreviewYearToStoreDebounced()
    })
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDownEvent)
})

function setPreviewYearToLayers() {
    activeLayers.value.forEach((layer, index) => {
        const year = previewYear.value
        if (
            layer.isVisible &&
            timeConfigUtils.hasMultipleTimestamps(layer) &&
            layer.timeConfig &&
            'currentYear' in layer.timeConfig &&
            layer.timeConfig.currentYear !== year
        ) {
            layersStore.setTimedLayerCurrentYear(index, year, dispatcher)
        }
    })
}

function dispatchPreviewYearToStore() {
    layersStore.setPreviewYear(currentYear.value, dispatcher)
    setPreviewYearToLayers()
}

const dispatchPreviewYearToStoreDebounced = debounce(dispatchPreviewYearToStore, 100)

function setSliderWidth() {
    const padding = 112
    if (!sliderContainer.value?.clientWidth) {
        log.error({
            title: 'TimeSlider.vue',
            titleColor: LogPreDefinedColor.Red,
            message: ['sliderContainer clientWidth is undefined'],
        })
        return
    }
    sliderWidth.value = sliderContainer.value.clientWidth - padding - PLAY_BUTTON_SIZE || 0
}

function positionNodeLabel(year: number) {
    const timestampIndex = allYears.value.indexOf(year) ?? 1
    const leftPosition = Math.max(
        LABEL_WIDTH / 2.0,
        timestampIndex * distanceBetweenLabels.value -
            yearsShownAsLabel.value.indexOf(year) * LABEL_WIDTH
    )
    return {
        left: `${Math.min(leftPosition, sliderWidth.value - LABEL_WIDTH)}px`,
    }
}

function grabCursor(event: MouseEvent | TouchEvent) {
    yearCursorIsGrabbed = true
    if ('touches' in event) {
        cursorX = event.touches[0]!.screenX
    } else {
        cursorX = event.screenX
    }
    window.addEventListener('mousemove', listenToMouseMove, { passive: true })
    window.addEventListener('touchmove', listenToMouseMove, { passive: true })
    window.addEventListener('mouseup', releaseCursor, { passive: true })
    window.addEventListener('touchend', releaseCursor, { passive: true })
}

function listenToMouseMove(event: MouseEvent | TouchEvent) {
    const currentPosition = 'touches' in event ? event.touches[0]!.screenX : event.screenX
    const deltaX = cursorX - currentPosition
    if (Math.abs(deltaX) >= distanceBetweenLabels.value) {
        let futureYearIndex = allYears.value.indexOf(currentYear.value)

        const absoluteDeltaIndex = Math.floor(Math.abs(deltaX) / distanceBetweenLabels.value)
        if (deltaX < 0) {
            if (allYears.value.length > futureYearIndex + absoluteDeltaIndex) {
                futureYearIndex += absoluteDeltaIndex
            } else if (allYears.value.length > futureYearIndex + 1) {
                futureYearIndex++
            }
        } else if (deltaX > 0) {
            if (futureYearIndex > absoluteDeltaIndex) {
                futureYearIndex -= absoluteDeltaIndex
            } else if (futureYearIndex > 0) {
                futureYearIndex--
            }
        }
        const futureYear = allYears.value[futureYearIndex]
        cursorX = currentPosition
        currentYear.value = futureYear!
    }
}

function releaseCursor() {
    yearCursorIsGrabbed = false
    window.removeEventListener('mousemove', listenToMouseMove)
    window.removeEventListener('touchmove', listenToMouseMove)
    window.removeEventListener('mouseup', releaseCursor)
    window.removeEventListener('touchend', releaseCursor)
}

function togglePlayYearsWithData() {
    playYearsWithData.value = !playYearsWithData.value
    if (playYearsWithData.value) {
        const yearsWithDataForPlayer = allYears.value
            .filter(
                (year) =>
                    yearsWithData.value.yearsJoint.includes(year) ||
                    yearsWithData.value.yearsSeparate.includes(year)
            )
            .sort()
            .reverse()
        if (
            !yearsWithDataForPlayer.includes(currentYear.value) ||
            currentYear.value === yearsWithDataForPlayer[0]
        ) {
            currentYear.value = yearsWithDataForPlayer.slice(-1)[0]!
        }
        playYearInterval = setInterval(() => {
            const currentYearIndex = yearsWithDataForPlayer.indexOf(currentYear.value)
            if (currentYearIndex === 0) {
                clearInterval(playYearInterval)
                playYearInterval = undefined
                playYearsWithData.value = false
            } else {
                currentYear.value = yearsWithDataForPlayer[currentYearIndex - 1]!
            }
        }, 1000)
    } else {
        clearInterval(playYearInterval)
        playYearInterval = undefined
    }
}

function handleKeyDownEvent(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    if (['mainBody', 'timeSliderButton', 'timeSliderPlayButton'].includes(target.id)) {
        if (event.key === 'ArrowLeft') {
            const value = currentYear.value - 1
            if (allYears.value.includes(value)) {
                currentYear.value = value
            }
        } else if (event.key === 'ArrowRight') {
            const value = currentYear.value + 1
            if (allYears.value.includes(value)) {
                currentYear.value = value
            }
        }
    }
}
</script>

<template>
    <div
        v-if="layersWithTimestamps.length"
        ref="sliderContainer"
        data-cy="time-slider"
        class="time-slider card"
        :class="{ grabbed: yearCursorIsGrabbed }"
    >
        <div class="d-flex align-items-center justify-content-between p-2">
            <div
                class="time-slider-bar px-5"
                data-cy="time-slider-bar"
            >
                <div
                    ref="yearCursor"
                    data-cy="times-slider-cursor"
                    class="time-slider-bar-cursor user-select-none d-flex bg-body gap-1 rounded border py-1"
                    :style="{ left: cursorPosition }"
                >
                    <div
                        class="border-end d-flex align-items-center px-2"
                        data-cy="time-slider-bar-cursor-grab"
                        @touchstart.passive="grabCursor"
                        @mousedown.passive="grabCursor"
                    >
                        <FontAwesomeIcon icon="grip-lines-vertical" />
                    </div>
                    <GeoadminTooltip
                        ref="outsideRangeTooltip"
                        theme="danger"
                        :tooltip-content="tooltipYearOutsideRangeContent"
                        open-trigger="manual"
                        use-default-padding
                    >
                        <input
                            v-model="inputYear"
                            class="form-control time-slider-bar-cursor-year"
                            :class="{ 'is-invalid': !isInputYearValid }"
                            data-cy="time-slider-bar-cursor-year"
                            maxlength="4"
                            type="text"
                            onkeypress="return event.charCode >= 48 && event.charCode <= 57"
                            @keypress.enter="yearCursorInput?.blur()"
                        />
                    </GeoadminTooltip>
                    <div
                        class="border-start d-flex align-items-center px-2"
                        @touchstart.passive="grabCursor"
                        @mousedown.passive="grabCursor"
                    >
                        <FontAwesomeIcon icon="grip-lines-vertical" />
                    </div>
                </div>
                <div
                    data-cy="time-slider-bar-cursor-arrow"
                    class="time-slider-bar-cursor-arrow"
                    :style="cursorArrowPosition"
                />
                <GeoadminTooltip
                    placement="bottom"
                    theme="secondary"
                    use-default-padding
                >
                    <div
                        v-if="yearsShownAsLabel.length > 0"
                        ref="timeSliderBar"
                        class="time-slider-bar-inner d-flex mt-5"
                        :style="innerBarStyle"
                    >
                        <span
                            v-for="year in allYears"
                            :key="year"
                            :style="innerBarStepStyle"
                            class="time-slider-bar-inner-step"
                            :data-cy="`time-slider-bar-${year}`"
                            :class="{
                                'has-partial-data': yearsWithData.yearsSeparate.includes(year),
                                'has-joint-data': yearsWithData.yearsJoint.includes(year),
                                'big-tick': year % 50 === 0,
                                'medium-tick': year % 25 === 0,
                                'small-tick': year % 5 === 0,
                            }"
                            @click="currentYear = year"
                        />
                    </div>
                    <template #content>
                        <div class="time-slider-infobox">
                            <div class="mb-2">
                                {{ t('time_slider_legend_tooltip_intro') }}
                            </div>
                            <div class="ps-3">
                                <div class="mb-1">
                                    <div class="color-tooltip-data-none me-2" />
                                    <div>{{ t('time_slider_legend_tooltip_no_data') }}</div>
                                </div>
                                <div class="mb-1">
                                    <div class="color-tooltip-data-partial me-2" />
                                    <div>{{ t('time_slider_legend_tooltip_partial_data') }}</div>
                                </div>
                                <div>
                                    <div class="color-tooltip-data-full me-2" />
                                    <div>{{ t('time_slider_legend_tooltip_full_data') }}</div>
                                </div>
                            </div>
                        </div>
                    </template>
                </GeoadminTooltip>
                <div
                    v-for="yearAsLabel in yearsShownAsLabel"
                    :key="yearAsLabel"
                    class="time-slider-node position-relative translate-middle-x mt-1"
                    :style="positionNodeLabel(yearAsLabel)"
                >
                    <small>
                        {{ yearAsLabel }}
                    </small>
                </div>
            </div>

            <div
                class="time-slider-dropdown"
                data-cy="time-slider-dropdown"
            >
                <TimeSliderDropdown
                    v-model.number="currentYear"
                    :entries="allYears"
                    :is-playing="playYearsWithData"
                    @play="togglePlayYearsWithData"
                />
            </div>

            <div class="time-slider-play-button">
                <button
                    id="timeSliderPlayButton"
                    data-cy="time-slider-play-button"
                    class="btn btn-light btn-lg d-flex align-self-center m-1 border p-3"
                    @click="togglePlayYearsWithData"
                >
                    <FontAwesomeIcon :icon="playYearsWithData ? 'pause' : 'play'" />
                </button>
            </div>
        </div>
        <!-- Time slider color tooltip content -->
    </div>
</template>

<style lang="scss">
@use 'sass:color';

@import '@/scss/media-query.mixin';
@import '@/scss/webmapviewer-bootstrap-theme';

$time-slider-color-background: color.adjust($white, $alpha: -0.1);
$time-slider-color-has-data: color.adjust($primary, $lightness: 30%);
$time-slider-color-partial-data: color.adjust($primary, $lightness: 45%);

.color-tooltip-data-none {
    height: 1rem;
    width: 1rem;
    border-radius: 0.1rem;
    margin-right: 0.2rem;
    float: left;
    border-color: $silver;
    background: $silver;
}

.color-tooltip-data-partial {
    height: 1rem;
    width: 1rem;
    border-radius: 0.1rem;
    margin-right: 0.2rem;
    float: left;
    border-color: $time-slider-color-partial-data;
    background: $time-slider-color-partial-data;
}

.color-tooltip-data-full {
    height: 1rem;
    width: 1rem;
    margin-right: 0.2rem;
    border-radius: 0.1rem;
    float: left;
    border-color: $time-slider-color-has-data;
    background: $time-slider-color-has-data;
}

// Display the dropdown instead of the time slider on small screens (tablets / phones),
.time-slider-dropdown {
    display: block;
}

.time-slider-bar {
    display: none;

    &-cursor {
        $cursor-height: 34px;

        position: absolute;
        top: 0.75 * $spacer;
        height: $cursor-height;
        width: 100px;

        &-arrow {
            $arrow-width: 9px;

            position: absolute;
            top: calc(0.75 * $spacer + $cursor-height - 1px);
            border-width: $arrow-width $arrow-width 0px;
            border-style: solid;
            border-color: $border-color transparent;

            &::after {
                $inner-arrow-width: $arrow-width - $border-width;

                content: '';
                position: absolute;
                bottom: 1px;
                left: calc(50% - $inner-arrow-width);
                border-width: $inner-arrow-width $inner-arrow-width 0px;
                border-style: solid;
                border-color: #fff transparent;
            }
        }
    }

    &-inner {
        background: $silver;
        width: 100%;
        height: 10px;

        &-step {
            cursor: pointer;

            &.has-partial-data {
                background: $time-slider-color-partial-data;
            }

            &.has-joint-data {
                background: $time-slider-color-has-data;
            }

            &:not(.small-tick, .big-tick, .medium-tick)::before {
                content: '';
                display: block;
                margin-left: -0.5px;
                width: 1px;
                height: 2px;
                background: rgba(0, 0, 0, 0.4);
            }

            &.small-tick:not(.big-tick, .medium-tick)::before {
                content: '';
                display: block;
                margin-left: -0.5px;
                width: 1px;
                height: 10px;
                background: rgba(0, 0, 0, 0.4);
            }

            &.medium-tick:not(.big-tick)::before {
                content: '';
                display: block;
                margin-left: -1px;
                width: 2px;
                height: 10px;
                background: rgba(0, 0, 0, 0.4);
            }

            &.big-tick::before {
                content: '';
                display: block;
                margin-left: -2px;
                width: 2px;
                height: 15px;
                background: rgba(0, 0, 0, 0.4);
            }
        }
    }
}

.time-slider-play-button {
    display: none;
}

.time-slider {
    background: $time-slider-color-background !important;
    width: auto;

    &:not(.grabbed) &-bar-cursor {
        cursor: grab;
    }

    &.grabbed {
        cursor: grabbing;
    }

    &-node {
        display: inline-flex;
        width: 32px;
        text-align: center;
    }
    input {
        margin: 0;
    }
}

.time-slider-bar-cursor-year {
    border: none;
    &.form-control {
        padding: 0 3px;
        border-color: $white;
        &.is-invalid {
            background-size: 0;
        }
        &:focus {
            outline: none;
            box-shadow: none;
        }
    }
}

@include respond-above(lg) {
    // time slider mode
    .time-slider-bar {
        display: block;
    }

    .time-slider-dropdown {
        display: none;
    }

    .time-slider {
        width: 100%;
    }

    .time-slider-play-button {
        display: block;
    }
}
</style>
