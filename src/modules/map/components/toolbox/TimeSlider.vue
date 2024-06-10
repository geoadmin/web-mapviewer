<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import tippy, { followCursor } from 'tippy.js'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { OLDEST_YEAR, YOUNGEST_YEAR } from '@/config'
import TimeSliderDropdown from '@/modules/map/components/toolbox/TimeSliderDropdown.vue'
import debounce from '@/utils/debounce'
import { round } from '@/utils/numberUtils'

import { useRangeTippy } from './useRangeTippy'

const dispatcher = { dispatcher: 'TimeSlider.vue' }
const i18n = useI18n()

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
const DEBOUNCE_INTERVAL = 500
// dynamic internal data
const sliderWidth = ref(0)
const allYears = ref(ALL_YEARS)
const _currentYear = ref(YOUNGEST_YEAR)
// used to hold the value in case the entered year is invalid
const falseYear = ref(null)
let cursorX = 0
const playYearsWithData = ref(false)
let yearCursorIsGrabbed = false
let playYearInterval = null

// refs to dom elements
const timeSliderTooltipRef = ref(null)
const yearCursor = ref(undefined)
const sliderContainer = ref(undefined)
const timeSliderBar = ref(null)
let tippyTimeSliderInfo = null

// ref to year cursor input
const yearCursorInput = ref(null)

const store = useStore()
const screenWidth = computed(() => store.state.ui.width)
const lang = computed(() => store.state.i18n.lang)
const layersWithTimestamps = computed(() =>
    store.getters.visibleLayers.filter((layer) => layer.hasMultipleTimestamps)
)
const activeLayers = computed(() => store.state.layers.activeLayers)
const previewYear = computed(() => store.state.layers.previewYear)

const isInputYearValid = ref(true)

const tippyYearOutsideRangeContent = computed(
    () => `${i18n.t('outside_valid_year_range')} ${ALL_YEARS[0]}-${ALL_YEARS[ALL_YEARS.length - 1]}`
)

const { tippyInstance: tippyOutsideRange, updateTippyContent } = useRangeTippy(
    () => yearCursorInput.value,
    tippyYearOutsideRangeContent.value
)

/**
 * Debounce the input year a bit
 *
 * With this, the error won't be shown immediately while the user is still typing a year, but rather
 * only when they have finished typing
 */
const updateInputYear = debounce((value) => {
    value = parseInt(value)
    // only if the year is valid we write this to the property
    // otherwise we show errors
    if (!allYears.value.includes(value)) {
        isInputYearValid.value = false
        falseYear.value = value || ''
    } else {
        isInputYearValid.value = true
        currentYear.value = parseInt(value)
        falseYear.value = null
        setPreviewYearToLayers()
    }
}, DEBOUNCE_INTERVAL)

/**
 * Used for the year in the input field Validate the input from the user. In case it's invalid, we
 * don't propagate the value to the state, but instead save it to an intermediate state variable to
 * be displayed along with an error message. This is important so that the cursor doesn't jump
 * around to invalid years
 */
const inputYear = computed({
    get() {
        if (falseYear.value !== null) {
            return falseYear.value
        }
        return currentYear.value
    },
    set(value) {
        updateInputYear(value)
    },
})

/**
 * The currently selected year
 *
 * We can't use the store value directly, as sometimes we want to update the current year displayed
 * without updating the store too much
 */
const currentYear = computed({
    get() {
        return _currentYear.value
    },
    set(value) {
        _currentYear.value = value

        // we need to reset those here, otherwise, when the error is shown and the users drags
        // the cursor to a correct year, the error won't go away
        falseYear.value = null
        isInputYearValid.value = true

        if (yearCursorIsGrabbed) {
            dispatchPreviewYearToStoreDebounced()
        } else {
            dispatchPreviewYearToStore()
        }
    },
})

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
    () => (1 + ALL_YEARS.indexOf(currentYear.value)) * distanceBetweenLabels.value + 42
)

const cursorPosition = computed(() => {
    const yearCursorWidth = yearCursor.value?.clientWidth || 0
    // we need to add 4.5 pixels which is half the size of the arrow for the slider to
    // really be in the middle of the arrow
    // make sure it doesn't go below 0
    const left = Math.max(yearPositionOnSlider.value - yearCursorWidth / 2 + 4.5, 0)

    return `${left}px`
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
    return {
        yearsJoint: yearsJoint.sort((a, b) => b - a),
        yearsSeparate: yearsSeparate.sort((a, b) => b - a),
    }
})

watch(screenWidth, (newValue) => {
    setSliderWidth(newValue)
})

watch(isInputYearValid, (newValue) => {
    if (!newValue) {
        tippyOutsideRange.value.show()
    } else {
        tippyOutsideRange.value.hide()
    }
})

watch(lang, () => {
    updateTippyContent(tippyYearOutsideRangeContent.value)
})

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
        // initialize the current year from the timeConfig layers
        if (
            layersWithTimestamps.value.length === 1 &&
            ALL_YEARS.includes(layersWithTimestamps.value[0].timeConfig.currentYear)
        ) {
            currentYear.value = layersWithTimestamps.value[0].timeConfig.currentYear
        } else if (yearsWithData.value.yearsJoint.length > 0) {
            currentYear.value = yearsWithData.value.yearsJoint[0]
        } else {
            currentYear.value = yearsWithData.value.yearsSeparate[0]
        }
    } else {
        currentYear.value = previewYear.value
    }

    setPreviewYearToLayers()
    tippyTimeSliderInfo = tippy(timeSliderBar.value, {
        content: timeSliderTooltipRef.value,
        hideOnClick: true,
        placement: 'bottom',
        delay: [1500, 500],
        allowHTML: true,
        followCursor: 'initial',
        plugins: [followCursor],
        // Show tippy on long touch for mobile device
        touch: ['hold', 500], // 500ms delay,
    })
})

onUnmounted(() => {
    setPreviewYearToLayers()

    tippyTimeSliderInfo?.destroy()
})

/** Set the current preview years to the layers if they have the year available in their data */
function setPreviewYearToLayers() {
    activeLayers.value.forEach((layer, index) => {
        const year = previewYear.value
        if (
            layer.hasMultipleTimestamps &&
            layer.timeConfig &&
            layer.timeConfig.getTimeEntryForYear(year) &&
            layer.visible
        ) {
            store.dispatch('setTimedLayerCurrentYear', {
                index,
                year,
                ...dispatcher,
            })
        }
    })
}

function dispatchPreviewYearToStore() {
    store.dispatch('setPreviewYear', { year: currentYear.value, ...dispatcher })
}

const dispatchPreviewYearToStoreDebounced = debounce(() => {
    dispatchPreviewYearToStore()
}, DEBOUNCE_INTERVAL)

function setSliderWidth() {
    // the padding of the slider container (4px each side) + the padding of the
    // slider bar (48px each side) = 112
    const padding = 112
    sliderWidth.value = sliderContainer.value.clientWidth - padding - PLAY_BUTTON_SIZE
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
    //wait for debounce of preview year so that right features are selected
    setTimeout(() => {
        setPreviewYearToLayers()
    }, DEBOUNCE_INTERVAL)
    yearCursorIsGrabbed = false
    window.removeEventListener('mousemove', listenToMouseMove)
    window.removeEventListener('touchmove', listenToMouseMove)
    window.removeEventListener('mouseup', releaseCursor)
    window.removeEventListener('touchend', releaseCursor)
}

function togglePlayYearsWithData() {
    playYearsWithData.value = !playYearsWithData.value
    if (playYearsWithData.value) {
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
            currentYear.value = yearsWithDataForPlayer.slice(-1)[0]
        }
        playYearInterval = setInterval(() => {
            const currentYearIndex = yearsWithDataForPlayer.indexOf(currentYear.value)
            // if last (most recent) year, we stop the player
            if (currentYearIndex === 0) {
                clearInterval(playYearInterval)
                playYearInterval = null
                playYearsWithData.value = false
            } else {
                currentYear.value = yearsWithDataForPlayer[currentYearIndex - 1]
            }
        }, 1000)
    } else {
        setPreviewYearToLayers()
        clearInterval(playYearInterval)
        playYearInterval = null
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
        <div class="p-2 d-flex align-items-center justify-content-between">
            <div class="time-slider-bar px-5" data-cy="time-slider-bar">
                <div
                    ref="yearCursor"
                    data-cy="times-slider-cursor"
                    class="time-slider-bar-cursor py-1 user-select-none d-flex gap-1 bg-body border rounded"
                    :style="{ left: cursorPosition }"
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
                        ref="yearCursorInput"
                        v-model="inputYear"
                        class="form-control time-slider-bar-cursor-year"
                        :class="{ 'is-invalid': !isInputYearValid }"
                        data-cy="time-slider-bar-cursor-year"
                        maxlength="4"
                        type="text"
                        onkeypress="return event.charCode >= 48 && event.charCode <= 57"
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

            <div class="time-slider-dropdown" data-cy="time-slider-dropdown">
                <TimeSliderDropdown
                    v-model.number="currentYear"
                    :entries="allYears"
                    :is-playing="playYearsWithData"
                    @play="togglePlayYearsWithData"
                >
                </TimeSliderDropdown>
            </div>

            <div class="time-slider-play-button">
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
        <!-- Time slider color tooltip content -->
        <div ref="timeSliderTooltipRef">
            <div class="mb-2">{{ i18n.t('time_slider_legend_tippy_intro') }}</div>
            <div class="ps-3">
                <div class="mb-1">
                    <div class="color-tippy-data-none me-2"></div>
                    <div>{{ i18n.t('time_slider_legend_tippy_no_data') }}</div>
                </div>
                <div class="mb-1">
                    <div class="color-tippy-data-partial me-2"></div>
                    <div>{{ i18n.t('time_slider_legend_tippy_partial_data') }}</div>
                </div>
                <div>
                    <div class="color-tippy-data-full me-2"></div>
                    <div>{{ i18n.t('time_slider_legend_tippy_full_data') }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
@use 'sass:color';

@import '@/scss/media-query.mixin';
@import '@/scss/webmapviewer-bootstrap-theme';

$time-slider-color-background: color.adjust($white, $alpha: -0.1);
$time-slider-color-has-data: color.adjust($primary, $lightness: 30%);
$time-slider-color-partial-data: color.adjust($primary, $lightness: 45%);

.color-tippy-data-none {
    height: 1rem;
    width: 1rem;
    border-radius: 0.1rem;
    margin-right: 0.2rem;

    float: left;
    border-color: $silver;
    background: $silver;
}
.color-tippy-data-partial {
    height: 1rem;
    width: 1rem;
    border-radius: 0.1rem;
    margin-right: 0.2rem;
    float: left;

    border-color: $time-slider-color-partial-data;
    background: $time-slider-color-partial-data;
}

.color-tippy-data-full {
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
}
.time-slider-play-button {
    display: none;
}
.time-slider {
    width: auto;
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
//

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
    input {
        margin: 0;
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
