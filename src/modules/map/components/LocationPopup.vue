<template>
    <OpenLayersPopover
        v-if="displayLocationPopup"
        :title="$t('position')"
        :coordinates="coordinate"
        class="location-popup"
        data-cy="location-popup"
        @close="onClose"
    >
        <div class="location-popup-coordinates ol-selectable">
            <div>
                <a :href="$t('contextpopup_lv95_url')" target="_blank">CH1903+ / LV95</a>
            </div>
            <div>
                <span data-cy="location-popup-coordinates-lv95">
                    {{ coordinateLV95 }}
                </span>
                <LocationPopupCopySlot :value="coordinateLV95" />
            </div>
            <div>
                <a :href="$t('contextpopup_lv03_url')" target="_blank">CH1903 / LV03</a>
            </div>
            <div>
                <span data-cy="location-popup-coordinates-lv03">
                    {{ coordinateLV03 }}
                </span>
                <LocationPopupCopySlot :value="coordinateLV03" />
            </div>
            <div>
                <a href="https://epsg.io/4326" target="_blank">WGS 84 (lat/lon)</a>
            </div>
            <div>
                <span
                    class="location-popup-coordinates-wgs84-plain"
                    data-cy="location-popup-coordinates-plain-wgs84"
                >
                    {{ coordinateWGS84Plain }}
                </span>
                <LocationPopupCopySlot :value="coordinateWGS84Plain" />
                <br />
                <span data-cy="location-popup-coordinates-wgs84">
                    {{ coordinateWGS84 }}
                </span>
            </div>
            <div>
                <a href="https://epsg.io/32632" target="_blank">UTM</a>
            </div>
            <div>
                <span data-cy="location-popup-coordinates-utm">
                    {{ coordinateUTM }}
                </span>
                <LocationPopupCopySlot :value="coordinateUTM" />
            </div>
            <div>{{ 'MGRS' }}</div>
            <div>
                <span data-cy="location-popup-coordinates-mgrs">
                    {{ coordinateMGRS }}
                </span>
                <LocationPopupCopySlot :value="coordinateMGRS" />
            </div>
            <div>
                <a href="http://what3words.com/" target="_blank">what3words</a>
            </div>
            <div v-if="what3Words">
                <span v-show="what3Words" data-cy="location-popup-w3w">
                    {{ what3Words }}
                </span>
                <LocationPopupCopySlot :value="what3Words" />
            </div>
            <div v-else>-</div>
            <div>
                <a :href="$t('elevation_href')" target="_blank">{{ $t('elevation') }}</a>
            </div>
            <div v-if="height">
                <span data-cy="location-popup-height"> {{ heightInMeter }} m</span> /
                <span>{{ heightInFeet }} ft</span>
                <LocationPopupCopySlot :value="heightInMeter" />
            </div>
            <div v-else>-</div>
            <div class="location-popup-link">
                {{ $t('link_bowl_crosshair') }}
            </div>
            <div class="location-popup-link">
                <LocationPopupCopyInput
                    :value="shareLinkUrlDisplay"
                    data-cy="location-popup-link-bowl-crosshair"
                />
            </div>
        </div>
        <div class="location-popup-qrcode">
            <img v-if="qrCodeImageSrc" :src="qrCodeImageSrc" data-cy="location-popup-qr-code" />
        </div>
    </OpenLayersPopover>
</template>

<script>
import { requestHeight } from '@/api/height.api'
import { generateQrCode } from '@/api/qrcode.api'
import { createShortLink } from '@/api/shortlink.api'

import { registerWhat3WordsLocation } from '@/api/what3words.api'
import LocationPopupCopyInput from '@/modules/map/components/LocationPopupCopyInput.vue'
import LocationPopupCopySlot from '@/modules/map/components/LocationPopupCopySlot.vue'
import OpenLayersPopover from '@/modules/map/components/openlayers/OpenLayersPopover.vue'
import stringifyQuery from '@/router/stringifyQuery'
import { CoordinateSystems, printHumanReadableCoordinates } from '@/utils/coordinateUtils'
import { round } from '@/utils/numberUtils'
import proj4 from 'proj4'
import { mapActions, mapState } from 'vuex'
import log from '@/utils/logging'

function reproject(toEpsg, coordinate) {
    return proj4(CoordinateSystems.WEBMERCATOR.epsg, toEpsg, coordinate)
}

/** Right click pop up which shows the coordinates of the position under the cursor. */
export default {
    components: {
        LocationPopupCopyInput,
        LocationPopupCopySlot,
        OpenLayersPopover,
    },
    inject: ['getMap'],
    data() {
        return {
            what3Words: '',
            height: null,
            qrCodeImageSrc: null,
            shareLinkUrlShorten: null,
            shareLinkUrl: null,
        }
    },
    computed: {
        ...mapState({
            clickInfo: (state) => state.map.clickInfo,
            currentLang: (state) => state.i18n.lang,
            displayLocationPopup: (state) => state.map.displayLocationPopup,
        }),
        coordinate() {
            return this.clickInfo?.coordinate
        },
        coordinateLV95() {
            return printHumanReadableCoordinates(
                reproject(CoordinateSystems.LV95.epsg, this.coordinate),
                CoordinateSystems.LV95
            )
        },
        coordinateLV03() {
            return printHumanReadableCoordinates(
                reproject(CoordinateSystems.LV03.epsg, this.coordinate),
                CoordinateSystems.LV03
            )
        },
        coordinateWGS84Metric() {
            return reproject(CoordinateSystems.WGS84.epsg, this.coordinate)
        },
        coordinateWGS84Plain() {
            const wgsMetric = this.coordinateWGS84Metric
            return `${round(wgsMetric[1], 5)}, ${round(wgsMetric[0], 5)}`
        },
        coordinateWGS84() {
            const complete = printHumanReadableCoordinates(
                this.coordinateWGS84Metric,
                CoordinateSystems.WGS84
            )
            // Only return the first (HDMS) part here. The other part is in:
            // this.coordinateWGS84Plain
            return complete.split(' (')[0]
        },
        coordinateUTM() {
            return printHumanReadableCoordinates(
                reproject(CoordinateSystems.WGS84.epsg, this.coordinate),
                CoordinateSystems.UTM
            )
        },
        coordinateMGRS() {
            return printHumanReadableCoordinates(
                reproject(CoordinateSystems.WGS84.epsg, this.coordinate),
                CoordinateSystems.MGRS
            )
        },
        heightInFeet() {
            return this.height?.heightInFeet || null
        },
        heightInMeter() {
            return this.height?.heightInMeter || null
        },
        shareLinkUrlDisplay() {
            return this.shareLinkUrlShorten || this.shareLinkUrl || ''
        },
    },
    watch: {
        clickInfo(newClickInfo) {
            if (newClickInfo && this.displayLocationPopup) {
                this.updateWhat3Word(newClickInfo.coordinate, this.currentLang)
                this.updateHeight(newClickInfo.coordinate)
                this.updateShareLink(newClickInfo.coordinate, this.$route.query)
            }
        },
        currentLang(newLang) {
            if (this.clickInfo && this.displayLocationPopup) {
                this.updateWhat3Word(this.clickInfo.coordinate, newLang)
                this.updateShareLink(this.clickInfo.coordinate, this.$route.query)
            }
        },
        '$route.query'(newQuery) {
            if (this.clickInfo && this.displayLocationPopup) {
                this.updateShareLink(this.clickInfo.coordinate, newQuery)
            }
        },
    },
    methods: {
        ...mapActions(['clearClick']),
        onClose() {
            this.clearClick()
            this.qrCodeImageSrc = null
            this.what3Words = ''
            this.height = null
            this.shareLinkUrlShorten = null
            this.shareLinkUrl = null
        },
        async updateWhat3Word(coordinate, lang) {
            try {
                this.what3Words = await registerWhat3WordsLocation(coordinate, lang)
            } catch (error) {
                log.error(`Failed to retrieve What3Words Location`)
                this.what3Words = ''
            }
        },
        async updateHeight(coordinate) {
            try {
                this.height = await requestHeight(coordinate)
            } catch (error) {
                log.error(`Failed to get position height`)
                this.height = null
            }
        },
        updateShareLink(coordinate, routeQuery) {
            let [lon, lat] = reproject(CoordinateSystems.WGS84.epsg, coordinate)
            let query = {
                ...routeQuery,
                crosshair: 'marker',
                lat,
                lon,
            }
            this.shareLinkUrl = `${location.origin}/#/map?${stringifyQuery(query)}`
            this.shortenShareLink(this.shareLinkUrl)
        },
        async shortenShareLink(url) {
            try {
                this.shareLinkUrlShorten = await createShortLink(url)
                await this.updateQrCode(this.shareLinkUrlShorten)
            } catch (error) {
                log.error(`Failed to shorten Share URL`)
                this.shareLinkUrlShorten = null
            }
        },
        async updateQrCode(url) {
            try {
                this.qrCodeImageSrc = await generateQrCode(url)
            } catch (error) {
                log.error(`Failed to generate qrcode for share url`)
                this.qrCodeImageSrc = null
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.location-popup {
    // Triangle border
    &::before {
        $arrow-height: 15px;
        position: absolute;
        top: -($arrow-height * 2);
        left: 50%;
        margin-left: -$arrow-height;
        border: $arrow-height solid transparent;
        border-bottom-color: var(--bs-border-color-translucent);
        pointer-events: none;
        content: '';
    }
    // Triangle background
    &::after {
        $arrow-border-height: 14px;
        content: '';
        border: $arrow-border-height solid transparent;
        border-bottom-color: $light;
        position: absolute;
        top: -($arrow-border-height * 2);
        left: 50%;
        margin-left: -$arrow-border-height;
    }
    &-coordinates {
        display: grid;
        grid-template-columns: 1fr 2fr;
        font-size: 0.75rem;
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
@media (min-height: 650px) {
    .location-popup-qrcode {
        display: block;
    }
}
</style>
