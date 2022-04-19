<template>
    <OpenLayersPopover
        v-if="isRightClick && clickCoordinates"
        :title="$t('position')"
        :coordinates="clickCoordinates"
        class="location-popup"
        data-cy="location-popup"
        @close="clearClick"
    >
        <div class="location-popup-coordinates ol-selectable">
            <div>
                <a :href="$t('contextpopup_lv95_url')" target="_blank">CH1903+ / LV95</a>
            </div>
            <div>
                <LocationPopupCopySlot :value="clickCoordinatesLV95">
                    <span data-cy="location-popup-coordinates-lv95">
                        {{ clickCoordinatesLV95 }}
                    </span>
                </LocationPopupCopySlot>
            </div>
            <div>
                <a :href="$t('contextpopup_lv03_url')" target="_blank">CH1903 / LV03</a>
            </div>
            <div>
                <LocationPopupCopySlot :value="clickCoordinatesLV03">
                    <span data-cy="location-popup-coordinates-lv03">
                        {{ clickCoordinatesLV03 }}
                    </span>
                </LocationPopupCopySlot>
            </div>
            <div>
                <a href="https://epsg.io/4326" target="_blank">WGS 84 (lat/lon)</a>
            </div>
            <div>
                <LocationPopupCopySlot :value="clickCoordinatesPlainWGS84">
                    <span
                        class="location-popup-coordinates-wgs84-plain"
                        data-cy="location-popup-coordinates-plain-wgs84"
                    >
                        {{ clickCoordinatesPlainWGS84 }}
                    </span>
                </LocationPopupCopySlot>
                <br />
                <span data-cy="location-popup-coordinates-wgs84">
                    {{ clickCoordinatesWGS84 }}
                </span>
            </div>
            <div>
                <a href="https://epsg.io/32632" target="_blank">UTM</a>
            </div>
            <div>
                <LocationPopupCopySlot :value="clickCoordinatesUTM">
                    <span data-cy="location-popup-coordinates-utm">
                        {{ clickCoordinatesUTM }}
                    </span>
                </LocationPopupCopySlot>
            </div>
            <div>{{ 'MGRS' }}</div>
            <div>
                <LocationPopupCopySlot :value="clickCoordinatesMGRS">
                    <span data-cy="location-popup-coordinates-mgrs">
                        {{ clickCoordinatesMGRS }}
                    </span>
                </LocationPopupCopySlot>
            </div>
            <div>
                <a href="http://what3words.com/" target="_blank">what3words</a>
            </div>
            <div>
                <LocationPopupCopySlot :value="clickWhat3Words">
                    <span v-show="clickWhat3Words" data-cy="location-popup-w3w">
                        {{ clickWhat3Words }}
                    </span>
                </LocationPopupCopySlot>
            </div>
            <div>
                <a :href="$t('elevation_href')" target="_blank">{{ $t('elevation') }}</a>
            </div>
            <div>
                <LocationPopupCopySlot :value="height?.heightInMeter">
                    <span data-cy="location-popup-height"> {{ height?.heightInMeter }} m</span> /
                    <span>{{ height?.heightInFeet }} ft</span>
                </LocationPopupCopySlot>
            </div>
            <div class="location-popup-link">
                {{ $t('link_bowl_crosshair') }}
            </div>
            <div class="location-popup-link">
                <LocationPopupCopyInput
                    :value="shareLinkUrl"
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
import proj4 from 'proj4'
import { mapState, mapActions } from 'vuex'

import { registerWhat3WordsLocation } from '@/api/what3words.api'
import { requestHeight } from '@/api/height.api'
import { generateQrCode } from '@/api/qrcode.api'
import { ClickType } from '@/store/modules/map.store'
import OpenLayersPopover from '@/modules/map/components/openlayers/OpenLayersPopover.vue'
import LocationPopupCopyInput from '@/modules/map/components/LocationPopupCopyInput.vue'
import LocationPopupCopySlot from '@/modules/map/components/LocationPopupCopySlot.vue'
import { printHumanReadableCoordinates, CoordinateSystems } from '@/utils/coordinateUtils'
import { round } from '@/utils/numberUtils'
import stringifyQuery from '@/router/stringifyQuery'

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
            clickWhat3Words: null,
            height: null,
            qrCodeImageSrc: null,
            showQrCode: false,
        }
    },
    computed: {
        ...mapState({
            clickInfo: (state) => state.map.clickInfo,
            currentLang: (state) => state.i18n.lang,
        }),
        clickCoordinates() {
            return this.clickInfo?.coordinate
        },
        clickCoordinatesLV95() {
            return printHumanReadableCoordinates(
                this.reprojectClickCoordinates('EPSG:2056'),
                CoordinateSystems.LV95
            )
        },
        clickCoordinatesLV03() {
            return printHumanReadableCoordinates(
                this.reprojectClickCoordinates('EPSG:21781'),
                CoordinateSystems.LV03
            )
        },
        clickCoordinatesPlainWGS84() {
            const wgsMetric = this.reprojectClickCoordinates('EPSG:4326')
            return `${round(wgsMetric[1], 5)}, ${round(wgsMetric[0], 5)}`
        },
        clickCoordinatesWGS84() {
            const complete = printHumanReadableCoordinates(
                this.reprojectClickCoordinates('EPSG:4326'),
                CoordinateSystems.WGS84
            )
            // Only return the first (HDMS) part here. The other part is in:
            // this.clickCoordinatesPlainWGS84
            return complete.split(' (')[0]
        },
        clickCoordinatesUTM() {
            return printHumanReadableCoordinates(
                this.reprojectClickCoordinates('EPSG:4326'),
                CoordinateSystems.UTM
            )
        },
        clickCoordinatesMGRS() {
            return printHumanReadableCoordinates(
                this.reprojectClickCoordinates('EPSG:4326'),
                CoordinateSystems.MGRS
            )
        },
        isRightClick() {
            return this.clickInfo?.clickType === ClickType.RIGHT_CLICK
        },
        shareLinkUrl() {
            let [lon, lat] = this.reprojectClickCoordinates('EPSG:4326')
            let query = {
                ...this.$route.query,
                crosshair: 'marker',
                lat,
                lon,
            }
            return `${location.origin}/#/map?${stringifyQuery(query)}`
        },
    },
    watch: {
        clickCoordinates() {
            this.requestWhat3WordBackend()
            this.registerHeigthFromBackend()
            this.generateQrCodeFromBackend()
        },
        currentLang() {
            this.requestWhat3WordBackend()
            this.generateQrCodeFromBackend()
        },
        // Watching shareLinkUrl breaks the component. But we need to react to
        // changes in the layer config to update the QR code.
        '$route.query'() {
            this.generateQrCodeFromBackend()
        },
    },
    methods: {
        ...mapActions(['clearClick']),
        onClose() {
            this.clearClick()
        },
        toggleQrCode() {
            this.showQrCode = !this.showQrCode
        },
        reprojectClickCoordinates(targetEpsg) {
            return proj4('EPSG:3857', targetEpsg, this.clickCoordinates)
        },
        requestWhat3WordBackend() {
            if (this.isRightClick && this.clickCoordinates) {
                registerWhat3WordsLocation(this.clickCoordinates, this.currentLang).then(
                    (what3word) => {
                        this.clickWhat3Words = what3word
                    }
                )
            }
        },
        registerHeigthFromBackend() {
            if (this.isRightClick && this.clickCoordinates) {
                requestHeight(this.clickCoordinates).then((height) => {
                    this.height = height
                })
            }
        },
        async generateQrCodeFromBackend() {
            if (this.isRightClick && this.clickCoordinates) {
                this.qrCodeImageSrc = await generateQrCode(this.shareLinkUrl)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.location-popup {
    &::before {
        $arrow-height: 15px;
        position: absolute;
        top: -($arrow-height * 2);
        left: 50%;
        margin-left: -$arrow-height;
        border: $arrow-height solid transparent;
        border-bottom-color: $light;
        pointer-events: none;
        content: '';
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
