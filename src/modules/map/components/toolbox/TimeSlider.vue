
<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA } from '@/api/layers/LayerTimeConfigEntry.class'
import { round } from '@/utils/numberUtils'

const dispatcher = { dispatcher: 'TimeSlider.vue' }

/**
 * The oldest year in our system is from the layer Journey Through Time (ch.swisstopo.zeitreihen)
 * which has data from the year 1844
 *
 * @type {Number}
 */
const OLDEST_YEAR = 1844

/**
 * The youngest (closest to now) year in our system, it will always be the previous year as of now
 *
 * @type {Number}
 */
const YOUNGEST_YEAR = new Date().getFullYear() - 1

const ALL_YEARS = (() => {
    const years = []
    for (let year = OLDEST_YEAR; year <= YOUNGEST_YEAR; year++) {
        years.push(year)
    }
    return years
})()

const LABEL_WIDTH = 32
const MARGIN_BETWEEN_LABELS = 50
const PLAY_BUTTON_SIZE = 54

/**
 * Finds the most recent common year between all given time configs
 *
 * @param {LayerTimeConfig[]} timeConfigs
 * @returns {Number} Most recent common year between all given time configs
 */
function findMostRecentCommonYear(timeConfigs) {
    if (timeConfigs.length < 2) {
        return null
    }
    let yearsInCommon = [...timeConfigs[0].years]
    timeConfigs.slice(1).forEach((timeConfig) => {
        yearsInCommon = yearsInCommon.filter((year) => timeConfig.years.includes(year))
    })
    return yearsInCommon[0]
}

// dynamic internal data
const sliderWidth = ref(0)
const allYears = ref(ALL_YEARS)
const currentYear = ref(YOUNGEST_YEAR)
const cursorX = ref(0)
const playYearsWithData = ref(false)
const yearCursorIsGrabbed = ref(false)
const playYearInterval = ref(null)

// refs to dom elements
const yearCursor = ref(undefined)
const sliderContainer = ref(undefined)

const store = useStore()
const screenWidth = computed(() => store.state.ui.width)
const layersWithTimestamps = computed(() =>
    store.getters.visibleLayers.filter((layer) => layer.hasMultipleTimestamps)
)

/**
 * Filtering of all years to only give ones that will need to be shown in the label section of the
 * time selector. Depending on the selector's width, we will show all 10s or 25s or 50s years.
 */
const yearsShownAsLabel = computed(() => {
    const amountOfLabelsOnScreen = round(sliderWidth.value / (LABEL_WIDTH + MARGIN_BETWEEN_LABELS))

    // how many year between each labels
    let yearThreshold = 10
    if (amountOfLabelsOnScreen < 10) {
        yearThreshold = 50
    } else if (amountOfLabelsOnScreen < 16) {
        yearThreshold = 25
    }
    return ALL_YEARS.filter((year) => year % yearThreshold === 0)
})
const innerBarStyle = computed(() => {
    return { width: `${sliderWidth.value}px` }
})
const yearPositionOnSlider = computed(
    () => (1 + ALL_YEARS.indexOf(currentYear.value)) * distanceBetweenLabels.value
)
const cursorPosition = computed(() => {
    const yearCursorWidth = yearCursor.value?.clientWidth || 0
    let left = yearPositionOnSlider.value - yearCursorWidth / 2
    // we give an overlap of 12px as there is some space between the play button and the end
    // of the slider
    if (left > sliderWidth.value - (yearCursorWidth - 12)) {
        left = sliderWidth.value - (yearCursorWidth - 12)
    }
    if (left < 0) {
        left = 0
    }
    return {
        left: `${left}px`,
    }
})
const cursorArrowPosition = computed(() => {
    return {
        left: `${yearPositionOnSlider.value - 4.5}px`, // 4.5 is half the arrow width of 9px
    }
})
const distanceBetweenLabels = computed(() => sliderWidth.value / ALL_YEARS.length)
const innerBarStepStyle = computed(() => {
    return {
        width: `${distanceBetweenLabels.value}px`,
    }
})
const yearsWithData = computed(() => {
    // TODO PB-318 : alter this to also show years with partial data
    const timeConfigs = layersWithTimestamps.value.map((layer) => layer.timeConfig)
    let yearsInCommon = [...timeConfigs[0].years]
    if (timeConfigs.length > 1) {
        timeConfigs.slice(1).forEach((timeConfig) => {
            yearsInCommon = yearsInCommon.filter((year) => timeConfig.years.includes(year))
        })
    }
    return yearsInCommon
})

watch(screenWidth, (newValue) => {
    setSliderWidth(newValue)
})

watch(layersWithTimestamps, (newLayers) => {
    if (newLayers.length > 1) {
        // checking if all layers can be set to the current year
        if (
            !newLayers
                .map((layer) => layer.timeConfig.years.includes(currentYear.value))
                .reduce((a, b) => a && b, true)
        ) {
            setCurrentYearAndDispatchToStore(
                findMostRecentCommonYear(newLayers.map((layer) => layer.timeConfig))
            )
        }
    } else {
        // only one layer left, checking that it can comply with the current year, otherwise
        // we take the most recent instead
        const [onlyLayerLeft] = newLayers
        if (!onlyLayerLeft.timeConfig.years.includes(currentYear.value)) {
            setCurrentYearAndDispatchToStore(onlyLayerLeft.timeConfig.years[0])
        }
    }
})

// we can't watch currentYear and dispatch changes to the store here, otherwise the store gets
// dispatch too many times when the user is moving the time slider (we wait for mouseup our
// touchend to commit the change)

onMounted(() => {
    let initialYear
    setSliderWidth()
    // let's define the current year to apply to all (future) layer added to this time slider
    const [firstLayer] = layersWithTimestamps.value
    if (layersWithTimestamps.value.length === 1) {
        // if there is only one layer, and its current timestamp is a valid year, we take it
        if (firstLayer.timeConfig.currentYear !== YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA) {
            initialYear = firstLayer.timeConfig.currentYear
        } else {
            // otherwise take the first year that is not ALL_YEARS
            initialYear = firstLayer.timeConfig.years.find(
                (year) => year !== YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA
            )
        }
    } else {
        // if multiple layers are visible, we need to find the closest year (from now) that is
        // a common year between all layers
        initialYear =
            findMostRecentCommonYear(layersWithTimestamps.value.map((layer) => layer.timeConfig)) ||
            YOUNGEST_YEAR
    }
    // We always need to propagate the changes to the store in order to have a proper time
    // slider toggling
    setCurrentYearAndDispatchToStore(initialYear)
})

onUnmounted(() => {
    store.dispatch('clearPreviewYear', dispatcher)
})

function setCurrentYearAndDispatchToStore(year) {
    currentYear.value = year
    store.dispatch('setPreviewYear', { year: currentYear.value, ...dispatcher })
}

function setSliderWidth() {
    // 19px of padding (7.5 on both side of the container with p-2 class and 4 with px-1)

    sliderWidth.value = sliderContainer.value.clientWidth - 19 - PLAY_BUTTON_SIZE
}

function positionNodeLabel(year) {
    const timestampIndex = ALL_YEARS.indexOf(year) || 1
    const leftPosition = Math.max(
        LABEL_WIDTH / 2.0,
        timestampIndex * distanceBetweenLabels.value -
            yearsShownAsLabel.value.indexOf(year) * LABEL_WIDTH
    )
    return {
        left: `${Math.min(leftPosition, sliderWidth.value - LABEL_WIDTH)}px`,
    }
}

function hasData(year) {
    return yearsWithData.value.includes(year)
}

function grabCursor(event) {
    yearCursorIsGrabbed.value = true
    if (event.type === 'touchstart') {
        // for touch events we have to select which touch we want to get the screen position
        // (there can be multiple fingers gestures)
        cursorX.value = event.touches[0].screenX
    } else {
        cursorX.value = event.screenX
    }
    window.addEventListener('mousemove', listenToMouseMove, { passive: true })
    window.addEventListener('touchmove', listenToMouseMove, { passive: true })
    window.addEventListener('mouseup', releaseCursor, { passive: true })
    window.addEventListener('touchend', releaseCursor, { passive: true })
}
function listenToMouseMove(event) {
    const currentPosition = event.type === 'touchmove' ? event.touches[0].screenX : event.screenX
    const deltaX = cursorX.value - currentPosition
    if (Math.abs(deltaX) >= distanceBetweenLabels.value) {
        let futureYearIndex = ALL_YEARS.indexOf(currentYear.value)

        // maybe we must skip multiple indexes, checking how wide is the delta
        const absoluteDeltaIndex = Math.floor(Math.abs(deltaX) / distanceBetweenLabels.value)
        if (deltaX < 0) {
            if (ALL_YEARS.length > futureYearIndex + absoluteDeltaIndex) {
                // we can skip steps
                futureYearIndex += absoluteDeltaIndex
            } else if (ALL_YEARS.length > futureYearIndex + 1) {
                // we can't skip steps
                futureYearIndex++
            }
        } else if (deltaX > 0) {
            if (futureYearIndex > absoluteDeltaIndex) {
                futureYearIndex -= absoluteDeltaIndex
            } else if (futureYearIndex > 0) {
                futureYearIndex--
            }
        }
        const futureYear = ALL_YEARS[futureYearIndex]
        // checking that this is a valid year in the context of currently displayed data
        if (yearsWithData.value.includes(futureYear)) {
            // reset of the starting position for delta calculation
            cursorX.value = currentPosition
            currentYear.value = futureYear
        }
    }
}
function releaseCursor() {
    yearCursorIsGrabbed.value = false
    window.removeEventListener('mousemove', listenToMouseMove)
    window.removeEventListener('touchmove', listenToMouseMove)
    window.removeEventListener('mouseup', releaseCursor)
    window.removeEventListener('touchend', releaseCursor)
    store.dispatch('setPreviewYear', { year: currentYear.value, ...dispatcher })
}
function togglePlayYearsWithData() {
    playYearsWithData.value = !playYearsWithData.value
    if (playYearsWithData.value) {
        // if current year is the last (most recent) one, we set the starting year for our
        // player to the oldest
        if (currentYear.value === yearsWithData.value[0]) {
            setCurrentYearAndDispatchToStore(yearsWithData.value.slice(-1)[0])
        }
        playYearInterval.value = setInterval(() => {
            const currentYearIndex = yearsWithData.value.indexOf(currentYear.value)
            // if last (most recent) year, we stop the player
            if (currentYearIndex === 0) {
                clearInterval(playYearInterval.value)
                playYearInterval.value = null
                playYearsWithData.value = false
            } else {
                setCurrentYearAndDispatchToStore(yearsWithData.value[currentYearIndex - 1])
            }
        }, 1000)
    } else {
        clearInterval(playYearInterval.value)
        playYearInterval.value = null
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
        <div class="p-2 d-flex">
            <div class="time-slider-bar">
                <div
                    ref="yearCursor"
                    data-cy="times-slider-cursor"
                    class="time-slider-bar-cursor py-1 user-select-none d-flex gap-1 bg-body border rounded"
                    :style="cursorPosition"
                    @touchstart.passive="grabCursor"
                    @mousedown.passive="grabCursor"
                >
                    <div class="px-2 border-end d-flex align-items-center">
                        <FontAwesomeIcon icon="grip-lines-vertical" />
                    </div>
                    <div data-cy="time-slider-current-year" class="time-slider-bar-cursor-year">
                        {{ currentYear }}
                    </div>
                    <div class="px-2 border-start d-flex align-items-center">
                        <FontAwesomeIcon icon="grip-lines-vertical" />
                    </div>
                </div>
                <div
                    ref="yearCursorArrow"
                    class="time-slider-bar-cursor-arrow"
                    :style="cursorArrowPosition"
                />
                <div
                    v-if="yearsShownAsLabel.length > 0"
                    class="time-slider-bar-inner d-flex pt-5 px-1"
                    :style="innerBarStyle"
                >
                    <span
                        v-for="year in allYears"
                        :key="year"
                        :style="innerBarStepStyle"
                        class="time-slider-bar-inner-step"
                        :class="{
                            'has-data': hasData(year),
                            'big-tick': year % 50 === 0,
                            'medium-tick': year % 25 === 0,
                            'small-tick': year % 5 === 0,
                        }"
                        @click="setCurrentYearAndDispatchToStore(year)"
                    />
                </div>
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
            <button
                ref="playButton"
                data-cy="time-slider-play-button"
                class="btn btn-light btn-lg d-flex align-self-center p-3 m-1 border"
                @click="togglePlayYearsWithData"
            >
                <FontAwesomeIcon :icon="playYearsWithData ? 'pause' : 'play'" />
            </button>
        </div>
    </div>
</template>


<style lang="scss">
@import 'src/scss/webmapviewer-bootstrap-theme';

.time-slider {
    background: rgba(255, 255, 255, 0.9) !important;
    &:not(.grabbed) &-bar-cursor {
        cursor: grab;
    }
    &.grabbed {
        cursor: grabbing;
    }
    &-bar {
        &-cursor {
            $cursor-height: 34px;
            position: absolute;
            top: 0.75 * $spacer;
            height: $cursor-height;
            width: 92px;
            &-year {
                position: relative;
                top: 1px;
            }
            &-arrow {
                $arrow-width: 9px;
                position: absolute;
                top: calc(0.75 * $spacer + $cursor-height - 1px);
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
        &-inner {
            width: 100%;
            height: calc(10px + 3 * $spacer);
            &-step {
                cursor: pointer;
                background: rgba(0, 0, 0, 0.1);
                &.has-data {
                    background: rgba(255, 0, 0, 0.3);
                }
                &:not(.small-tick):not(.big-tick):not(.medium-tick)::before {
                    content: '';
                    display: block;
                    margin-left: -0.5px;
                    width: 1px;
                    height: 2px;
                    background: rgba(0, 0, 0, 0.4);
                }
                &.small-tick:not(.big-tick):not(.medium-tick)::before {
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
    &-node {
        display: inline-flex;
        width: 32px;
        text-align: center;
    }
}
</style>
