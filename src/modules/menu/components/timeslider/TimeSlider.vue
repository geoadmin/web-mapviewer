<template>
    <div
        v-if="layersWithTimestamps.length"
        ref="sliderContainer"
        data-cy="time-slider"
        class="time-slider card"
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
                    <div
                        class="time-slider-bar-cursor-grip px-2 border-end d-flex align-items-center"
                    >
                        <FontAwesomeIcon icon="grip-lines-vertical" />
                    </div>
                    <div data-cy="time-slider-current-year" class="time-slider-bar-cursor-year">
                        {{ currentYear }}
                    </div>
                    <div
                        class="time-slider-bar-cursor-grip px-2 border-start d-flex align-items-center"
                    >
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
<script>
import { YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA } from "@/api/layers/LayerTimeConfigEntry.class";
import { round } from '@/utils/numberUtils'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapActions, mapGetters, mapState } from 'vuex'

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

export default {
    components: { FontAwesomeIcon },
    data() {
        return {
            sliderWidth: 0,
            allYears: ALL_YEARS,
            currentYear: YOUNGEST_YEAR,
            cursorDeltaX: 0,
            playYearsWithData: false,
        }
    },
    computed: {
        ...mapGetters(['isDesktopMode', 'visibleLayers']),
        ...mapState({
            screenWidth: (state) => state.ui.width,
        }),
        layersWithTimestamps() {
            return this.visibleLayers.filter((layer) => layer.hasMultipleTimestamps)
        },
        /**
         * Filtering of all years to only give ones that will need to be shown in the label section
         * of the time selector. Depending on the selector's width, we will show all 10s or 25s or
         * 50s years.
         */
        yearsShownAsLabel() {
            const labelSize = LABEL_WIDTH
            const marginBetweenLabels = 50
            const amountOfLabelsOnScreen = round(
                this.sliderWidth / (labelSize + marginBetweenLabels)
            )

            // how many year between each labels
            let yearThreshold = 10
            if (amountOfLabelsOnScreen < 10) {
                yearThreshold = 50
            } else if (amountOfLabelsOnScreen < 16) {
                yearThreshold = 25
            }
            return ALL_YEARS.filter((year) => year % yearThreshold === 0)
        },
        innerBarStyle() {
            return {
                width: `${this.sliderWidth}px`,
            }
        },
        yearPositionOnSlider() {
            return (1 + ALL_YEARS.indexOf(this.currentYear)) * this.distanceBetweenLabels
        },
        cursorPosition() {
            const yearCursorWidth = this.$refs.yearCursor?.clientWidth || 0
            let left = this.yearPositionOnSlider - yearCursorWidth / 2
            // we give an overlap of 12px as there is some space between the play button and the end of the slider
            if (left > this.sliderWidth - (yearCursorWidth - 12)) {
                left = this.sliderWidth - (yearCursorWidth - 12)
            }
            if (left < 0) {
                left = 0
            }
            return {
                left: `${left}px`,
            }
        },
        cursorArrowPosition() {
            return {
                left: `${this.yearPositionOnSlider - 4.5}px`, // 4.5 is half the arrow width of 9px
            }
        },
        distanceBetweenLabels() {
            return this.sliderWidth / ALL_YEARS.length
        },
        innerBarStepStyle() {
            return {
                width: `${this.distanceBetweenLabels}px`,
            }
        },
        yearsWithData() {
            const timeConfigs = this.layersWithTimestamps.map((layer) => layer.timeConfig)
            let yearsInCommon = [...timeConfigs[0].years]
            if (timeConfigs.length > 1) {
                timeConfigs.slice(1).forEach((timeConfig) => {
                    yearsInCommon = yearsInCommon.filter((year) => timeConfig.years.includes(year))
                })
            }
            return yearsInCommon
        },
    },
    watch: {
        screenWidth() {
            this.setSliderWidth()
        },
        layersWithTimestamps(newLayers) {
            if (newLayers.length > 1) {
                // checking if all layers can be set to the current year
                if (
                    !newLayers
                        .map((layer) => layer.timeConfig.years.includes(this.currentYear))
                        .reduce((a, b) => a && b, true)
                ) {
                    this.setCurrentYearAndDispatchToStore(
                        findMostRecentCommonYear(newLayers.map((layer) => layer.timeConfig))
                    )
                }
            } else {
                // only one layer left, checking that it can comply with the current year, otherwise we take the most recent instead
                const [onlyLayerLeft] = newLayers
                if (!onlyLayerLeft.timeConfig.years.includes(this.currentYear)) {
                    this.setCurrentYearAndDispatchToStore(onlyLayerLeft.timeConfig.years[0])
                }
            }
        },
        // we can't watch currentYear and dispatch changes to the store here, otherwise the store gets
        // dispatch too many times when the user is moving the time slider (we wait for mouseup our touchend to commit the change)
    },
    mounted() {
        this.setSliderWidth()
        // let's define the current year to apply to all (future) layer added to this time slider
        const [firstLayer] = this.layersWithTimestamps
        if (this.layersWithTimestamps.length === 1) {
            // if there is only one layer, and its current timestamp is a valid year, we take it
            if (firstLayer.timeConfig.currentYear !== YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA) {
                this.currentYear = firstLayer.timeConfig.currentYear
            } else {
                const firstYearNotAllYears = firstLayer.timeConfig.years.find((year) => year !== YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA)
                // as we've changed the selected year from the default, we have to propagate this change to the store
                this.setCurrentYearAndDispatchToStore(firstYearNotAllYears)
            }
        } else {
            // if multiple layers are visible, we need to find the closest year (from now) that is a common year between all layers
            this.setCurrentYearAndDispatchToStore(
                findMostRecentCommonYear(
                    this.layersWithTimestamps.map((layer) => layer.timeConfig)
                ) || YOUNGEST_YEAR
            )
        }
    },
    beforeUnmount() {
        this.clearPreviewYear()
    },
    methods: {
        ...mapActions(['setPreviewYear', 'clearPreviewYear']),
        setCurrentYearAndDispatchToStore(year) {
            this.currentYear = year
            this.setPreviewYear(this.currentYear)
        },
        setSliderWidth() {
            // 19px of padding (7.5 on both side of the container with p-2 class and 4 with px-1)
            this.sliderWidth = this.$refs.sliderContainer.clientWidth - 19 - PLAY_BUTTON_SIZE
        },
        positionNodeLabel(year) {
            const timestampIndex = ALL_YEARS.indexOf(year) || 1
            const leftPosition = Math.max(
                LABEL_WIDTH / 2.0,
                timestampIndex * this.distanceBetweenLabels -
                    this.yearsShownAsLabel.indexOf(year) * LABEL_WIDTH
            )
            return {
                left: `${Math.min(leftPosition, this.sliderWidth - LABEL_WIDTH)}px`,
            }
        },
        hasData(year) {
            return this.yearsWithData.includes(year)
        },
        grabCursor(event) {
            if (event.type === 'touchstart') {
                // for touch events we have to select which touch we want to get the screen position
                // (there can be multiple fingers gestures)
                this.cursorX = event.touches[0].screenX
            } else {
                this.cursorX = event.screenX
            }
            window.addEventListener('mousemove', this.listenToMouseMove, { passive: true })
            window.addEventListener('touchmove', this.listenToMouseMove, { passive: true })
            window.addEventListener('mouseup', this.releaseCursor, { passive: true })
            window.addEventListener('touchend', this.releaseCursor, { passive: true })
        },
        listenToMouseMove(event) {
            const currentPosition =
                event.type === 'touchmove' ? event.touches[0].screenX : event.screenX
            const deltaX = this.cursorX - currentPosition
            if (Math.abs(deltaX) >= this.distanceBetweenLabels) {
                let futureYearIndex = ALL_YEARS.indexOf(this.currentYear)

                // maybe we must skip multiple indexes, checking how wide is the delta
                const absoluteDeltaIndex = Math.floor(Math.abs(deltaX) / this.distanceBetweenLabels)
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
                if (this.yearsWithData.includes(futureYear)) {
                    // reset of the starting position for delta calculation
                    this.cursorX = currentPosition
                    this.currentYear = futureYear
                }
            }
        },
        releaseCursor() {
            this.cursorGrabPosition = null
            window.removeEventListener('mousemove', this.listenToMouseMove)
            window.removeEventListener('touchmove', this.listenToMouseMove)
            window.removeEventListener('mouseup', this.releaseCursor)
            window.removeEventListener('touchend', this.releaseCursor)
            this.setPreviewYear(this.currentYear)
        },
        togglePlayYearsWithData() {
            this.playYearsWithData = !this.playYearsWithData
            if (this.playYearsWithData) {
                // if current year is the last (most recent) one, we set the starting year for our player to the oldest
                if (this.currentYear === this.yearsWithData[0]) {
                    this.setCurrentYearAndDispatchToStore(this.yearsWithData.slice(-1)[0])
                }
                this.playYearInterval = setInterval(() => {
                    const currentYearIndex = this.yearsWithData.indexOf(this.currentYear)
                    // if last (most recent) year, we stop the player
                    if (currentYearIndex === 0) {
                        clearInterval(this.playYearInterval)
                        this.playYearInterval = null
                        this.playYearsWithData = false
                    } else {
                        this.setCurrentYearAndDispatchToStore(
                            this.yearsWithData[currentYearIndex - 1]
                        )
                    }
                }, 1000)
            } else {
                clearInterval(this.playYearInterval)
                this.playYearInterval = null
            }
        },
    },
}
</script>
<style lang="scss">
@import '../../../../scss/webmapviewer-bootstrap-theme';

.time-slider {
    background: rgba(255, 255, 255, 0.9) !important;
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
