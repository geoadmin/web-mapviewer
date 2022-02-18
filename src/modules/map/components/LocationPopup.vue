<template>
    <div v-if="isRightClick" class="location-popup" data-cy="location-popup">
        <div class="card">
            <div class="card-header d-flex">
                <span class="flex-grow-1 align-self-center">
                    {{ $t('position') }}
                </span>
                <ButtonWithIcon
                    data-cy="profile-popup-close-button"
                    :button-font-awesome-icon="['fa', 'times']"
                    @click="onClose"
                />
            </div>
            <div class="card-body coordinates-list text-start">
                <div>
                    <a :href="$t('contextpopup_lv95_url')" target="_blank">CH1903+ / LV95</a>
                </div>
                <div data-cy="location-popup-coordinates-lv95">
                    {{ clickCoordinatesLV95 }}
                </div>
                <div>
                    <a :href="$t('contextpopup_lv03_url')" target="_blank">CH1903 / LV03</a>
                </div>
                <div data-cy="location-popup-coordinates-lv03">
                    {{ clickCoordinatesLV03 }}
                </div>
                <div>
                    <a href="https://epsg.io/4326" target="_blank">WGS 84 (lat/lon)</a>
                </div>
                <div>
                    <div data-cy="location-popup-coordinates-plain-wgs84">
                        {{ clickCoordinatesPlainWGS84 }}
                    </div>
                    <div data-cy="location-popup-coordinates-wgs84">
                        {{ clickCoordinatesWGS84 }}
                    </div>
                </div>
                <div>
                    <a href="https://epsg.io/32632" target="_blank">UTM</a>
                </div>
                <div data-cy="location-popup-coordinates-utm">
                    {{ clickCoordinatesUTM }}
                </div>
                <div>{{ 'MGRS' }}</div>
                <div data-cy="location-popup-coordinates-mgrs">
                    {{ clickCoordinatesMGRS }}
                </div>
                <div>
                    <a href="http://what3words.com/" target="_blank">what3words</a>
                </div>
                <div>
                    <span v-show="clickWhat3Words" data-cy="location-popup-w3w">{{
                        clickWhat3Words
                    }}</span>
                </div>
                <div>{{ $t('elevation') }}</div>
                <div>
                    <span v-if="height" data-cy="location-popup-height">
                        {{ height.heightInMeter }} m / {{ height.heightInFeet }} ft
                    </span>
                </div>
                <div></div>
                <div data-cy="location-popup-link-bowl-crosshair">
                    <a :href="shareLinkUrl" target="_blank">
                        {{ $t('link_bowl_crosshair') }}
                    </a>
                </div>
                <div class="qrcode-container">
                    <img v-if="qrCodeImageSrc" :src="qrCodeImageSrc" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import proj4 from 'proj4'
import { mapState, mapActions } from 'vuex'
import { ClickType } from '@/modules/map/store/map.store'
import Overlay from 'ol/Overlay'
import OverlayPositioning from 'ol/OverlayPositioning'
import { printHumanReadableCoordinates, CoordinateSystems } from '@/utils/coordinateUtils'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import { registerWhat3WordsLocation } from '@/api/what3words.api'
import { requestHeight } from '@/api/height.api'
import { generateQrCode } from '@/api/qrcode.api'
import { round } from '@/utils/numberUtils'

/** Right click pop up which shows the coordinates of the position under the cursor. */
export default {
    components: { ButtonWithIcon },
    inject: ['getMap'],
    data: function () {
        return {
            clickWhat3Words: null,
            height: null,
            qrCodeImageSrc: null,
        }
    },
    computed: {
        ...mapState({
            clickInfo: (state) => state.map.clickInfo,
            currentLang: (state) => state.i18n.lang,
        }),
        clickCoordinates: function () {
            return this.clickInfo && this.clickInfo.coordinate
        },
        clickCoordinatesLV95: function () {
            return printHumanReadableCoordinates(
                this.reprojectClickCoordinates('EPSG:2056'),
                CoordinateSystems.LV95
            )
        },
        clickCoordinatesLV03: function () {
            return printHumanReadableCoordinates(
                this.reprojectClickCoordinates('EPSG:21781'),
                CoordinateSystems.LV03
            )
        },
        clickCoordinatesPlainWGS84: function () {
            const wgsMetric = this.reprojectClickCoordinates('EPSG:4326')
            return `${round(wgsMetric[1], 5)}, ${round(wgsMetric[0], 5)}`
        },
        clickCoordinatesWGS84: function () {
            return printHumanReadableCoordinates(
                this.reprojectClickCoordinates('EPSG:4326'),
                CoordinateSystems.WGS84
            )
        },
        clickCoordinatesUTM: function () {
            return printHumanReadableCoordinates(
                this.reprojectClickCoordinates('EPSG:4326'),
                CoordinateSystems.UTM
            )
        },
        clickCoordinatesMGRS: function () {
            return printHumanReadableCoordinates(
                this.reprojectClickCoordinates('EPSG:4326'),
                CoordinateSystems.MGRS
            )
        },
        isRightClick: function () {
            return this.clickInfo && this.clickInfo.clickType === ClickType.RIGHT_CLICK
        },
        shareLinkUrl: function () {
            return `${window.location}&crosshair=marker`
        },
    },
    watch: {
        clickCoordinates: function (newClickCoordinates) {
            this.requestWhat3WordBackend()
            this.registerHeigthFromBackend()
            this.generateQrCodeFromBackend()
            if (newClickCoordinates) {
                this.overlay.setPosition(newClickCoordinates)
            }
        },
        currentLang: function () {
            this.requestWhat3WordBackend()
            this.generateQrCodeFromBackend()
        },
    },
    beforeCreate() {
        this.overlay = new Overlay({
            offset: [0, 15],
            positioning: OverlayPositioning.TOP_CENTER,
            // Selection of overlay content was broken in OL v4.1 so we need an extra class.
            // https://github.com/openlayers/openlayers/pull/6741
            className: 'location-popup-overlay ol-selectable',
        })
    },
    mounted() {
        const olMap = this.getMap()
        if (olMap) {
            this.overlay.setElement(this.$el)
            olMap.addOverlay(this.overlay)
        }
    },
    methods: {
        ...mapActions(['clearClick']),
        onClose: function () {
            this.clearClick()
        },
        reprojectClickCoordinates: function (targetEpsg) {
            return proj4('EPSG:3857', targetEpsg, this.clickCoordinates)
        },
        requestWhat3WordBackend: function () {
            if (this.clickCoordinates) {
                registerWhat3WordsLocation(this.clickCoordinates, this.currentLang).then(
                    (what3word) => {
                        this.clickWhat3Words = what3word
                    }
                )
            }
        },
        registerHeigthFromBackend: function () {
            if (this.clickCoordinates) {
                requestHeight(this.clickCoordinates).then((height) => {
                    this.height = height
                })
            }
        },
        generateQrCodeFromBackend: function () {
            if (this.clickCoordinates) {
                generateQrCode(window.location.href).then((qrCode) => {
                    this.qrCodeImageSrc = qrCode
                })
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.location-popup {
    width: auto;
    max-width: 450px;
    height: auto;

    .coordinates-list {
        display: grid;
        grid-template-columns: 1fr 2fr;
        grid-column-gap: 5px;
        grid-row-gap: 5px;
    }
    .qrcode-container {
        grid-column: 1 / 3;
        text-align: center;
    }
}
</style>
