<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

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

// dynamic internal data
const sliderWidth = ref(0)
const allYears = ref(ALL_YEARS)
const currentYear = ref(YOUNGEST_YEAR)
const displayedYear = ref(YOUNGEST_YEAR)
let cursorX = 0
let playYearsWithData = false
let yearCursorIsGrabbed = false
let playYearInterval = null

// refs to dom elements
const yearCursor = ref(undefined)
const sliderContainer = ref(undefined)

const store = useStore()
const screenWidth = computed(() => store.state.ui.width)
const layersWithTimestamps = computed(() =>
    store.getters.visibleLayers.filter((layer) => layer.hasMultipleTimestamps)
)
const previewYear = computed(() => store.state.layers.previewYear)
const invalidYear = computed(
    () =>
        displayedYear.value != previewYear.value &&
        displayedYear.value.toString().length == 4 &&
        !allYears.value.includes(parseInt(displayedYear.value))
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
    const timeConfigs = layersWithTimestamps.value.map((layer) => layer.timeConfig)
    let yearsJoint = [...timeConfigs[0].years]
    let yearsSeparate = []
    timeConfigs.forEach((timeConfig) =>
        timeConfig.years
            .filter((year) => !yearsSeparate.includes(year))
            .forEach((year) => yearsSeparate.push(year))
    )
    if (timeConfigs.length > 1) {
        timeConfigs.slice(1).forEach((timeConfig) => {
            yearsJoint = yearsJoint.filter((year) => timeConfig.years.includes(year))
        })
    }
    yearsSeparate = yearsSeparate.filter((year) => !yearsJoint.includes(year))
    return { yearsJoint: yearsJoint, yearsSeparate: yearsSeparate }
})

watch(screenWidth, (newValue) => {
    setSliderWidth(newValue)
})
watch(currentYear, () => {
    displayedYear.value = currentYear.value
})

// we can't watch currentYear and dispatch changes to the store here, otherwise the store gets
// dispatch too many times when the user is moving the time slider (we wait for mouseup our
// touchend to commit the change)

onMounted(() => {
    setSliderWidth()

    /*
    When mounting the time slider, the preview year should be set to one of the following, checked in the given order :
        - if it is already set, we don't do anything
        - if there is only one layer, with a valid year, we set it to its current year
        - if there is joint data (when there is only one layer, all data is joint data), we go to the most recent joint data
        - else, we set it to the most recent year with data
    */
    if (!previewYear.value) {
        if (
            layersWithTimestamps.value.length === 1 &&
            ALL_YEARS.includes(layersWithTimestamps.value[0].timeConfig.currentYear)
        ) {
            setCurrentYearAndDispatchToStore(layersWithTimestamps.value[0].timeConfig.currentYear)
        } else if (yearsWithData.value.yearsJoint.length > 0) {
            setCurrentYearAndDispatchToStore(yearsWithData.value.yearsJoint[0])
        } else {
            setCurrentYearAndDispatchToStore(yearsWithData.value.yearsSeparate[0])
        }
    } else {
        currentYear.value = previewYear.value
    }
})

onUnmounted(() => {
    // TODO : when we have an 'activeTimeSlider' in store, we'll get rid of this.
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
    const timestampIndex = ALL_YEARS.indexOf(year) ?? 1
    const leftPosition = Math.max(
        LABEL_WIDTH / 2.0,
        timestampIndex * distanceBetweenLabels.value -
            yearsShownAsLabel.value.indexOf(year) * LABEL_WIDTH
    )
    return {
        left: `${Math.min(leftPosition, sliderWidth.value - LABEL_WIDTH)}px`,
    }
}

function grabCursor(event) {
    yearCursorIsGrabbed = true
    if (event.type === 'touchstart') {
        // for touch events we have to select which touch we want to get the screen position
        // (there can be multiple fingers gestures)
        cursorX = event.touches[0].screenX
    } else {
        cursorX = event.screenX
    }
    window.addEventListener('mousemove', listenToMouseMove, { passive: true })
    window.addEventListener('touchmove', listenToMouseMove, { passive: true })
    window.addEventListener('mouseup', releaseCursor, { passive: true })
    window.addEventListener('touchend', releaseCursor, { passive: true })
}
function listenToMouseMove(event) {
    const currentPosition = event.type === 'touchmove' ? event.touches[0].screenX : event.screenX
    const deltaX = cursorX - currentPosition
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
        // reset of the starting position for delta calculation
        cursorX = currentPosition
        currentYear.value = futureYear
    }
}
function releaseCursor() {
    yearCursorIsGrabbed = false
    window.removeEventListener('mousemove', listenToMouseMove)
    window.removeEventListener('touchmove', listenToMouseMove)
    window.removeEventListener('mouseup', releaseCursor)
    window.removeEventListener('touchend', releaseCursor)
    store.dispatch('setPreviewYear', { year: currentYear.value, ...dispatcher })
}

function togglePlayYearsWithData() {
    playYearsWithData = !playYearsWithData
    if (playYearsWithData) {
        let yearsWithDataForPlayer = ALL_YEARS.filter(
            (year) =>
                yearsWithData.value.yearsJoint.includes(year) ||
                yearsWithData.value.yearsSeparate.includes(year)
        )
            .sort()
            .reverse()
        // if current year is the last (most recent) one, or we're not on a year with data, we set the starting year for our
        // player to the oldest year with data
        if (
            !yearsWithDataForPlayer.includes(currentYear.value) ||
            currentYear.value === yearsWithDataForPlayer[0]
        ) {
            setCurrentYearAndDispatchToStore(yearsWithDataForPlayer.slice(-1)[0])
        }
        playYearInterval = setInterval(() => {
            const currentYearIndex = yearsWithDataForPlayer.indexOf(currentYear.value)
            // if last (most recent) year, we stop the player
            if (currentYearIndex === 0) {
                clearInterval(playYearInterval)
                playYearInterval = null
                playYearsWithData = false
            } else {
                setCurrentYearAndDispatchToStore(yearsWithDataForPlayer[currentYearIndex - 1])
            }
        }, 1000)
    } else {
        clearInterval(playYearInterval)
        playYearInterval = null
    }
}
function setYearToInputIfValid() {
    if (
        currentYear.value != displayedYear.value &&
        allYears.value.includes(parseInt(displayedYear.value))
    ) {
        setCurrentYearAndDispatchToStore(parseInt(displayedYear.value))
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
                >
                    <div
                        class="px-2 border-end d-flex align-items-center"
                        data-cy="time-slider-bar-cursor-grab"
                        @touchstart.passive="grabCursor"
                        @mousedown.passive="grabCursor"
                    >
                        <FontAwesomeIcon icon="grip-lines-vertical" />
                    </div>
                    <input
                        v-model="displayedYear"
                        class="form-control time-slider-bar-cursor-year"
                        :class="{ 'is-invalid': invalidYear }"
                        data-cy="time-slider-bar-cursor-year"
                        maxlength="4"
                        type="text"
                        onkeypress="return event.charCode >= 48 && event.charCode <= 57"
                        @input="setYearToInputIfValid"
                    />
                    <div
                        class="px-2 border-start d-flex align-items-center"
                        @touchstart.passive="grabCursor"
                        @mousedown.passive="grabCursor"
                    >
                        <FontAwesomeIcon icon="grip-lines-vertical" />
                    </div>
                </div>
                <div
                    ref="yearCursorArrow"
                    data-cy="time-slider-bar-cursor-arrow"
                    class="time-slider-bar-cursor-arrow"
                    :style="cursorArrowPosition"
                />
                <div
                    v-if="yearsShownAsLabel.length > 0"
                    class="time-slider-bar-inner d-flex mt-5 mx-1"
                    :style="innerBarStyle"
                >
                    <span
                        v-for="year in allYears"
                        :key="year"
                        :style="innerBarStepStyle"
                        class="time-slider-bar-inner-step"
                        :class="{
                            'has-no-data': !(
                                yearsWithData.yearsJoint.includes(year) ||
                                yearsWithData.yearsSeparate.includes(year)
                            ),
                            'has-joint-data': yearsWithData.yearsJoint.includes(year),
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
@use 'sass:color';

@import 'src/scss/webmapviewer-bootstrap-theme';
$time-slider-color-background: color.adjust($white, $alpha: -0.1);
$time-slider-color-has-data: color.adjust($primary, $lightness: 30%);
.time-slider {
    background: $time-slider-color-background !important;
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
            width: 100px;
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
            background: repeating-linear-gradient(
                45deg,
                $silver,
                $silver 4px,
                $time-slider-color-has-data 2px,
                $time-slider-color-has-data 8px
            );
            width: 100%;
            height: 10px;
            &-step {
                cursor: pointer;
                &.has-no-data {
                    background: $silver;
                }
                &.has-joint-data {
                    background: $time-slider-color-has-data;
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
.time-slider-bar-cursor-year {
    &.form-control {
        padding: 3px;
        border-color: $white;
        &.is-invalid {
            padding: 3px;
            background-size: 0;
        }
        &:focus {
            outline: none;
            box-shadow: none;
        }
    }
}
</style>
