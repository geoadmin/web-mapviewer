<template>
    <OpenLayersPopover
        v-if="displayLocationPopup"
        :title="$t('position')"
        :coordinates="coordinate"
        use-content-padding
        class="location-popup"
        data-cy="location-popup"
        @close="onClose"
    >
        <div class="location-popup-coordinates">
            <div class="lp-label">
                <a :href="$t('contextpopup_lv95_url')" target="_blank">{{ LV95Format.label }}</a>
            </div>
            <div class="lp-data">
                <span data-cy="location-popup-coordinates-lv95">
                    {{ coordinateLV95 }}
                </span>
                <LocationPopupCopySlot :value="coordinateLV95" />
            </div>
            <div class="lp-label">
                <a :href="$t('contextpopup_lv03_url')" target="_blank">{{ LV03Format.label }}</a>
            </div>
            <div class="lp-data">
                <span data-cy="location-popup-coordinates-lv03">
                    {{ coordinateLV03 }}
                </span>
                <LocationPopupCopySlot :value="coordinateLV03" />
            </div>
            <div class="lp-label">
                <a href="https://epsg.io/4326" target="_blank">{{ WGS84Format.label }}</a>
            </div>
            <div class="lp-data">
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
            <div class="lp-label">
                <a href="https://epsg.io/32632" target="_blank">{{ UTMFormat.label }}</a>
            </div>
            <div class="lp-data">
                <span data-cy="location-popup-coordinates-utm">
                    {{ coordinateUTM }}
                </span>
                <LocationPopupCopySlot :value="coordinateUTM" />
            </div>
            <div class="lp-label">{{ 'MGRS' }}</div>
            <div class="lp-data">
                <span data-cy="location-popup-coordinates-mgrs">
                    {{ coordinateMGRS }}
                </span>
                <LocationPopupCopySlot :value="coordinateMGRS" />
            </div>
            <div class="lp-label">
                <a href="http://what3words.com/" target="_blank">what3words</a>
            </div>
            <div v-if="what3Words" class="lp-data what-3-words">
                <span v-show="what3Words" data-cy="location-popup-w3w">
                    {{ what3Words }}
                </span>
                <LocationPopupCopySlot :value="what3Words" />
            </div>
            <div v-else>-</div>
            <div class="lp-label">
                <a :href="$t('elevation_href')" target="_blank">{{ $t('elevation') }}</a>
            </div>
            <div v-if="height" class="lp-data">
                <span data-cy="location-popup-height"> {{ heightInMeter }} m</span> /
                <span>{{ heightInFeet }} ft</span>
                <LocationPopupCopySlot :value="heightInMeter" />
            </div>
            <div v-else>-</div>
            <div class="location-popup-link lp-label">
                {{ $t('share_link') }}
            </div>
            <div class="location-popup-link lp-data">
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
import { DEFAULT_PROJECTION } from '@/config'
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
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'
import { stringifyQuery } from '@/utils/url'
import proj4 from 'proj4'
import { mapActions, mapState } from 'vuex'

/** Right click pop up which shows the coordinates of the position under the cursor. */
export default {
    components: {
        OpenLayersPopover,
        LocationPopupCopyInput,
        LocationPopupCopySlot,
    },
    inject: ['getMap'],
    props: {
        projection: {
            type: CoordinateSystem,
            default: DEFAULT_PROJECTION,
        },
    },
    data() {
        return {
            what3Words: '',
            height: null,
            qrCodeImageSrc: null,
            shareLinkUrlShorten: null,
            shareLinkUrl: null,
            LV95Format,
            LV03Format,
            WGS84Format,
            UTMFormat,
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
            return LV95Format.format(this.coordinate, this.projection)
        },
        coordinateLV03() {
            return LV03Format.format(this.coordinate, this.projection)
        },
        coordinateWGS84Metric() {
            return proj4(this.projection.epsg, WGS84.epsg, this.coordinate)
        },
        coordinateWGS84Plain() {
            // we want to output lat / lon, meaning we have to give the coordinate as y / x
            return this.coordinateWGS84Metric
                .slice()
                .reverse()
                .map((val) => WGS84.roundCoordinateValue(val).toFixed(6))
                .join(', ')
        },
        coordinateWGS84() {
            return WGS84Format.format(this.coordinate, this.projection)
        },
        coordinateUTM() {
            return UTMFormat.format(this.coordinate, this.projection)
        },
        coordinateMGRS() {
            return MGRSFormat.format(this.coordinate, this.projection)
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
                this.height = await requestHeight(coordinate, this.projection)
            } catch (error) {
                log.error(`Failed to get position height`)
                this.height = null
            }
        },
        updateShareLink(coordinate, routeQuery) {
            let query = {
                ...routeQuery,
                crosshair: 'marker',
                center: coordinate.join(','),
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
    &-coordinates {
        display: grid;
        grid-template-columns: min-content auto;
        grid-column-gap: 8px;
        font-size: 0.75rem;
        grid-row-gap: 2px;
        .lp-label {
            white-space: nowrap;
        }
        .lp-data.what-3-words {
            display: grid;
            grid-template-columns: auto min-content;
            span {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
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
