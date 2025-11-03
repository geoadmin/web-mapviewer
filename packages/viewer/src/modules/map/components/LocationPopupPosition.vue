<script setup lang="ts">
/** Right click pop up which shows the coordinates of the position under the cursor. */

import type { SingleCoordinate, CoordinateSystem } from '@swissgeo/coordinates'

import { coordinatesUtils, LV03, LV95, WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ClickInfo } from '@/store/modules/map/types/map'

import { requestHeight } from '@/api/height.api'
import reframe from '@/api/lv03Reframe.api'
import { registerWhat3WordsLocation } from '@/api/what3words.api'
import CoordinateCopySlot from '@/utils/components/CoordinateCopySlot.vue'
import {
    LV03Format,
    LV95Format,
    MGRSFormat,
    UTMFormat,
    WGS84Format,
} from '@/utils/coordinates/coordinateFormat'

const { coordinate, clickInfo, projection, currentLang } = defineProps<{
    coordinate: SingleCoordinate
    clickInfo?: ClickInfo
    projection: CoordinateSystem
    currentLang: string
}>()

const lv03Coordinate = ref<SingleCoordinate | undefined>()
const what3Words = ref<string | undefined>()
const height = ref<{ heightInFeet?: number; heightInMeter?: number } | undefined>()

const { t } = useI18n()

const coordinateWGS84Metric = computed(() => {
    return coordinatesUtils.reprojectAndRound(projection, WGS84, coordinate)
})
const coordinateWGS84Plain = computed(() => {
    return coordinateWGS84Metric.value
        .slice()
        .reverse()
        .map((val) => WGS84.roundCoordinateValue(val).toFixed(6))
        .join(', ')
})
const heightInFeet = computed(() => {
    return height.value?.heightInFeet ? `${height.value.heightInFeet}ft` : undefined
})
const heightInMeter = computed(() => {
    return height.value?.heightInMeter ? `${height.value.heightInMeter}m` : ''
})

onMounted(() => {
    if (clickInfo) {
        updateLV03Coordinate().catch((error) => {
            log.error({
                title: 'LocationPopup.vue',
                titleColor: LogPreDefinedColor.Red,
                messages: ['Failed to retrieve LV03 coordinate', error],
            })
        })
        updateWhat3Word().catch((error) => {
            log.error({
                title: 'LocationPopup.vue',
                titleColor: LogPreDefinedColor.Red,
                messages: ['Failed to update What3Words', error],
            })
        })
        updateHeight().catch((error) => {
            log.error({
                title: 'LocationPopup.vue',
                titleColor: LogPreDefinedColor.Red,
                messages: ['Failed to update height', error],
            })
        })
    }
})

watch(
    () => clickInfo,
    (newClickInfo) => {
        if (newClickInfo) {
            updateLV03Coordinate().catch((error) => {
                log.error({
                    title: 'LocationPopup.vue',
                    titleColor: LogPreDefinedColor.Red,
                    messages: ['Failed to retrieve LV03 coordinate', error],
                })
            })
            updateWhat3Word().catch((error) => {
                log.error({
                    title: 'LocationPopup.vue',
                    titleColor: LogPreDefinedColor.Red,
                    messages: ['Failed to update What3Words', error],
                })
            })
            updateHeight().catch((error) => {
                log.error({
                    title: 'LocationPopup.vue',
                    titleColor: LogPreDefinedColor.Red,
                    messages: ['Failed to update height', error],
                })
            })
        }
    }
)
watch(() => currentLang, updateWhat3Word)

async function updateLV03Coordinate() {
    try {
        const lv95coordinate = coordinatesUtils.reprojectAndRound(projection, LV95, coordinate)
        lv03Coordinate.value = await reframe({
            inputCoordinates: lv95coordinate,
            inputProjection: LV95,
            outputProjection: LV03,
        })
    } catch (error) {
        log.error({
            title: 'LocationPopup.vue',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Failed to retrieve LV03 coordinate', error],
        })
        lv03Coordinate.value = undefined
    }
}

async function updateWhat3Word() {
    try {
        what3Words.value = await registerWhat3WordsLocation(coordinate, projection, currentLang)
    } catch (error) {
        log.error({
            title: 'LocationPopup.vue',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Failed to retrieve What3Words Location', error],
        })
        what3Words.value = undefined
    }
}
async function updateHeight() {
    try {
        height.value = await requestHeight(coordinate, projection)
    } catch (error) {
        log.error({
            title: 'LocationPopup.vue',
            titleColor: LogPreDefinedColor.Red,
            messages: ['Failed to get position height', error],
        })
        height.value = undefined
    }
}
</script>

<template>
    <div
        id="nav-local"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-local-tab"
    >
        <div class="location-popup-coordinates align-items-center pb-2">
            <CoordinateCopySlot
                identifier="location-popup-lv95"
                :value="coordinate"
                :coordinate-format="LV95Format"
            >
                <a
                    :href="t('contextpopup_lv95_url')"
                    target="_blank"
                >
                    {{ LV95Format.label }}
                </a>
            </CoordinateCopySlot>
            <CoordinateCopySlot
                v-if="lv03Coordinate"
                identifier="location-popup-lv03"
                :value="lv03Coordinate"
                :coordinate-format="LV03Format"
                :coordinate-projection="LV03"
            >
                <a
                    :href="t('contextpopup_lv03_url')"
                    target="_blank"
                >
                    {{ LV03Format.label }}
                </a>
            </CoordinateCopySlot>

            <CoordinateCopySlot
                identifier="location-popup-wgs84"
                :value="coordinateWGS84Plain"
                :coordinate-format="undefined"
                :extra-value="WGS84Format.formatCallback(coordinate, false)"
            >
                <a
                    href="https://epsg.io/4326"
                    target="_blank"
                >
                    {{ WGS84Format.label }}
                </a>
            </CoordinateCopySlot>

            <CoordinateCopySlot
                identifier="location-popup-utm"
                :value="coordinate"
                :coordinate-format="UTMFormat"
            >
                <a
                    href="https://epsg.io/32632"
                    target="_blank"
                >
                    {{ UTMFormat.label }}
                </a>
            </CoordinateCopySlot>

            <CoordinateCopySlot
                identifier="location-popup-mgrs"
                :value="coordinate"
                :coordinate-format="MGRSFormat"
            >
                MGRS
            </CoordinateCopySlot>

            <CoordinateCopySlot
                v-if="what3Words"
                identifier="location-popup-w3w"
                :value="what3Words"
                :coordinate-format="undefined"
            >
                <a
                    href="http://what3words.com/"
                    target="_blank"
                >
                    what3words
                </a>
            </CoordinateCopySlot>

            <CoordinateCopySlot
                v-if="height"
                identifier="location-popup-height"
                :value="heightInMeter"
                :coordinate-format="undefined"
                :extra-value="heightInFeet"
            >
                <a
                    :href="t('elevation_href')"
                    target="_blank"
                >
                    {{ t('elevation') }}
                </a>
            </CoordinateCopySlot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
.location-popup {
    &-coordinates {
        display: grid;
        grid-template-columns: max-content auto;
        column-gap: 8px;
        font-size: 0.75rem;
        row-gap: 2px;
        &-label {
            white-space: nowrap;
        }
    }
}
</style>
