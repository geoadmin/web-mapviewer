<script setup>
/** Right click pop up which shows the coordinates of the position under the cursor. */

import proj4 from 'proj4'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import { requestHeight } from '@/api/height.api'
import { generateQrCode } from '@/api/qrcode.api'
import { createShortLink } from '@/api/shortlink.api'
import { registerWhat3WordsLocation } from '@/api/what3words.api'
import CesiumPopover from '@/modules/map/components/cesium/CesiumPopover.vue'
import LocationPopupCopyInput from '@/modules/map/components/LocationPopupCopyInput.vue'
import LocationPopupCopySlot from '@/modules/map/components/LocationPopupCopySlot.vue'
import OpenLayersPopover from '@/modules/map/components/openlayers/OpenLayersPopover.vue'
import {
    LV03Format,
    LV95Format,
    MGRSFormat,
    UTMFormat,
    WGS84Format,
} from '@/utils/coordinates/coordinateFormat'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'
import { stringifyQuery } from '@/utils/url-router'

const what3Words = ref(null)
const height = ref(null)
const qrCodeImageSrc = ref(null)
const shareLinkUrlShorten = ref(null)
const shareLinkUrl = ref(null)

const i18n = useI18n()
const route = useRoute()
const store = useStore()

const clickInfo = computed(() => store.state.map.clickInfo)
const currentLang = computed(() => store.state.i18n.lang)
const projection = computed(() => store.state.position.projection)
const showIn3d = computed(() => store.state.cesium.active)

const mappingFrameworkSpecificPopup = computed(() => {
    if (showIn3d.value) {
        return CesiumPopover
    }
    return OpenLayersPopover
})
const coordinate = computed(() => {
    return clickInfo.value?.coordinate
})
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
const shareLinkUrlDisplay = computed(() => {
    return shareLinkUrlShorten.value || shareLinkUrl.value || ''
})
watch(clickInfo, (newClickInfo) => {
    if (newClickInfo) {
        updateWhat3Word()
        updateHeight()
        updateShareLink()
    }
})
watch(currentLang, () => {
    updateWhat3Word()
    updateShareLink()
})
watch(() => route.query, updateShareLink)

function clearClick() {
    store.dispatch('clearClick')
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
function updateShareLink() {
    let query = {
        ...route.query,
        crosshair: 'marker',
        center: coordinate.value.join(','),
    }
    shareLinkUrl.value = `${location.origin}/#/map?${stringifyQuery(query)}`
    shortenShareLink(shareLinkUrl.value)
}
async function shortenShareLink(url) {
    try {
        shareLinkUrlShorten.value = await createShortLink(url)
        await updateQrCode(shareLinkUrlShorten.value)
    } catch (error) {
        log.error(`Failed to shorten Share URL`, error)
        shareLinkUrlShorten.value = null
    }
}
async function updateQrCode(url) {
    try {
        qrCodeImageSrc.value = await generateQrCode(url)
    } catch (error) {
        log.error(`Failed to generate qrcode for share url`, error)
        qrCodeImageSrc.value = null
    }
}
</script>

<template>
    <component
        :is="mappingFrameworkSpecificPopup"
        v-if="coordinate"
        :title="$t('position')"
        :coordinates="coordinate"
        :projection="projection"
        use-content-padding
        class="location-popup"
        data-cy="location-popup"
        @close="clearClick"
    >
        <div class="location-popup-coordinates">
            <LocationPopupCopySlot
                identifier="lv95"
                :value="LV95Format.format(coordinate, projection)"
            >
                <a :href="i18n.t('contextpopup_lv95_url')" target="_blank">
                    {{ LV95Format.label }}
                </a>
            </LocationPopupCopySlot>

            <LocationPopupCopySlot
                identifier="lv03"
                :value="LV03Format.format(coordinate, projection)"
            >
                <a :href="i18n.t('contextpopup_lv03_url')" target="_blank">
                    {{ LV03Format.label }}
                </a>
            </LocationPopupCopySlot>

            <LocationPopupCopySlot
                identifier="wgs84"
                :value="coordinateWGS84Plain"
                :extra-value="WGS84Format.format(coordinate, projection)"
            >
                <a href="https://epsg.io/4326" target="_blank">{{ WGS84Format.label }}</a>
            </LocationPopupCopySlot>

            <LocationPopupCopySlot
                identifier="utm"
                :value="UTMFormat.format(coordinate, projection)"
            >
                <a href="https://epsg.io/32632" target="_blank">{{ UTMFormat.label }}</a>
            </LocationPopupCopySlot>

            <LocationPopupCopySlot
                identifier="mgrs"
                :value="MGRSFormat.format(coordinate, projection)"
            >
                MGRS
            </LocationPopupCopySlot>

            <LocationPopupCopySlot v-if="what3Words" identifier="w3w" :value="what3Words">
                <a href="http://what3words.com/" target="_blank">what3words</a>
            </LocationPopupCopySlot>

            <LocationPopupCopySlot
                v-if="height"
                identifier="height"
                :value="heightInMeter"
                :extra-value="heightInFeet"
            >
                <a :href="$t('elevation_href')" target="_blank">{{ $t('elevation') }}</a>
            </LocationPopupCopySlot>

            <div class="location-popup-link location-popup-coordinates-label">
                {{ $t('share_link') }}
            </div>
            <div class="location-popup-link location-popup-coordinates-data">
                <LocationPopupCopyInput
                    :value="shareLinkUrlDisplay"
                    data-cy="location-popup-link-bowl-crosshair"
                />
            </div>
        </div>
        <div class="location-popup-qrcode">
            <img
                v-if="qrCodeImageSrc"
                :src="qrCodeImageSrc"
                alt="qrcode"
                data-cy="location-popup-qr-code"
            />
        </div>
    </component>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.location-popup {
    @extend .clear-no-ios-long-press;

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
    &-link {
        display: flex;
        align-items: center;
        padding-top: 0.5rem;
    }
    &-qrcode {
        display: none;
        text-align: center;
    }
    &-coordinates-wgs84-plain {
        display: inline-block;
        margin-bottom: 0.1rem;
    }
}
@media (min-height: 850px) {
    .location-popup-qrcode {
        display: block;
    }
}
</style>
