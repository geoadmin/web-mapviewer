<script setup>
/** Right click pop up which shows the coordinates of the position under the cursor. */

import proj4 from 'proj4'
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'

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
import { LV03, LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'

const props = defineProps({
    coordinate: {
        type: Array,
        required: true,
    },
    clickInfo: {
        type: Object,
        required: true,
    },
    projection: {
        type: Object,
        required: true,
    },
    currentLang: {
        type: String,
        required: true,
    },
})
const { coordinate, clickInfo, projection, currentLang } = toRefs(props)

const lv03Coordinate = ref(null)
const what3Words = ref(null)
const height = ref(null)

const i18n = useI18n()

const coordinateWGS84Metric = computed(() => {
    return proj4(projection.value.epsg, WGS84.epsg, coordinate.value)
})
const coordinateWGS84Plain = computed(() => {
    // we want to output lat / lon, meaning we have to give the coordinate as y / x
    return coordinateWGS84Metric.value
        .slice()
        .reverse()
        .map((val) => WGS84.roundCoordinateValue(val).toFixed(6))
        .join(', ')
})
const heightInFeet = computed(() => {
    if (height.value?.heightInFeet) {
        return `${height.value.heightInFeet}ft`
    }
    return null
})
const heightInMeter = computed(() => {
    if (height.value?.heightInMeter) {
        return `${height.value.heightInMeter}m`
    }
    return ''
})

onMounted(() => {
    if (clickInfo.value) {
        updateLV03Coordinate()
        updateWhat3Word()
        updateHeight()
    }
})

watch(clickInfo, (newClickInfo) => {
    if (newClickInfo) {
        updateLV03Coordinate()
        updateWhat3Word()
        updateHeight()
    }
})
watch(currentLang, () => {
    updateWhat3Word()
})

async function updateLV03Coordinate() {
    try {
        const lv95coordinate = proj4(projection.value.epsg, LV95.epsg, coordinate.value)
        lv03Coordinate.value = await reframe(lv95coordinate)
    } catch (error) {
        log.error('Failed to retrieve LV03 coordinate', error)
        lv03Coordinate.value = null
    }
}

async function updateWhat3Word() {
    try {
        what3Words.value = await registerWhat3WordsLocation(
            coordinate.value,
            projection.value,
            currentLang.value
        )
    } catch (error) {
        log.error(`Failed to retrieve What3Words Location`, error)
        what3Words.value = null
    }
}
async function updateHeight() {
    try {
        height.value = await requestHeight(coordinate.value, projection.value)
    } catch (error) {
        log.error(`Failed to get position height`, error)
        height.value = null
    }
}
</script>

<template>
    <div id="nav-local" class="tab-pane fade" role="tabpanel" aria-labelledby="nav-local-tab">
        <div class="pb-2 location-popup-coordinates align-items-center">
            <CoordinateCopySlot
                identifier="location-popup-lv95"
                :value="coordinate"
                :coordinate-format="LV95Format"
            >
                <a :href="i18n.t('contextpopup_lv95_url')" target="_blank">
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
                <a :href="i18n.t('contextpopup_lv03_url')" target="_blank">
                    {{ LV03Format.label }}
                </a>
            </CoordinateCopySlot>

            <CoordinateCopySlot
                identifier="location-popup-wgs84"
                :value="coordinateWGS84Plain"
                :coordinate-format="null"
                :extra-value="WGS84Format.format(coordinate, projection)"
            >
                <a href="https://epsg.io/4326" target="_blank">{{ WGS84Format.label }}</a>
            </CoordinateCopySlot>

            <CoordinateCopySlot
                identifier="location-popup-utm"
                :value="coordinate"
                :coordinate-format="UTMFormat"
            >
                <a href="https://epsg.io/32632" target="_blank">{{ UTMFormat.label }}</a>
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
                :coordinate-format="null"
            >
                <a href="http://what3words.com/" target="_blank">what3words</a>
            </CoordinateCopySlot>

            <CoordinateCopySlot
                v-if="height"
                identifier="location-popup-height"
                :value="heightInMeter"
                :coordinate-format="null"
                :extra-value="heightInFeet"
            >
                <a :href="i18n.t('elevation_href')" target="_blank">{{ i18n.t('elevation') }}</a>
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
        grid-column-gap: 8px;
        font-size: 0.75rem;
        grid-row-gap: 2px;
        &-label {
            white-space: nowrap;
        }
    }
}
</style>
