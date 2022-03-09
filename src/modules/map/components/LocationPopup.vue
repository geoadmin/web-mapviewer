<template>
    <OpenLayersPopover
        v-if="isRightClick && clickCoordinates"
        :title="$t('position')"
        :coordinates="clickCoordinates"
        class="location-popup"
        data-cy="location-popup"
        @close="clearClick"
    >
        <template #extra-buttons>
            <ButtonWithIcon
                :button-font-awesome-icon="['fas', 'qrcode']"
                data-cy="location-popup-toggle"
                @click="toggleQrCode"
            />
        </template>

        <div v-show="!showQrCode" class="coordinates-list text-start">
            <div class="location-popup-th">
                <a :href="$t('contextpopup_lv95_url')" target="_blank">CH1903+ / LV95</a>
            </div>
            <div class="location-popup-td">
                <span data-cy="location-popup-coordinates-lv95">
                    {{ clickCoordinatesLV95 }}
                </span>
            </div>
            <div class="location-popup-th">
                <a :href="$t('contextpopup_lv03_url')" target="_blank">CH1903 / LV03</a>
            </div>
            <div class="location-popup-td">
                <span data-cy="location-popup-coordinates-lv03">
                    {{ clickCoordinatesLV03 }}
                </span>
            </div>
            <div class="location-popup-th">
                <a href="https://epsg.io/4326" target="_blank">WGS 84 (lat/lon)</a>
            </div>
            <div class="location-popup-td">
                <span data-cy="location-popup-coordinates-plain-wgs84">
                    {{ clickCoordinatesPlainWGS84 }}
                </span>
                <br />
                <span data-cy="location-popup-coordinates-wgs84">
                    {{ clickCoordinatesWGS84 }}
                </span>
            </div>
            <div class="location-popup-th">
                <a href="https://epsg.io/32632" target="_blank">UTM</a>
            </div>
            <div class="location-popup-td">
                <span data-cy="location-popup-coordinates-utm">
                    {{ clickCoordinatesUTM }}
                </span>
            </div>
            <div class="location-popup-th">
                {{ 'MGRS' }}
            </div>
            <div class="location-popup-td">
                <span data-cy="location-popup-coordinates-mgrs">
                    {{ clickCoordinatesMGRS }}
                </span>
            </div>
            <div class="location-popup-th">
                <a href="http://what3words.com/" target="_blank">what3words</a>
            </div>
            <div class="location-popup-td">
                <span v-show="clickWhat3Words" data-cy="location-popup-w3w">
                    {{ clickWhat3Words }}
                </span>
            </div>
            <div>
                <a :href="$t('elevation_href')" target="_blank">{{ $t('elevation') }}</a>
            </div>
            <div class="location-popup-td">
                <span data-cy="location-popup-height">{{ height?.heightInMeter }} m</span> /
                <span>{{ height?.heightInFeet }} ft</span>
            </div>
            <div class="location-popup-th">
                {{ $t('link_bowl_crosshair') }}
            </div>
            <div class="location-popup-td">
                <LocationPopupCopy
                    :value="shareLinkUrl"
                    data-cy="location-popup-link-bowl-crosshair"
                />
            </div>
        </div>
        <div v-show="showQrCode" class="qrcode-container">
            <img v-if="qrCodeImageSrc" :src="qrCodeImageSrc" data-cy="location-popup-qr-code" />
        </div>
    </OpenLayersPopover>
</template>

<script>
import proj4 from 'proj4'
import { mapState, mapActions } from 'vuex'
import Overlay from 'ol/Overlay'
import OverlayPositioning from 'ol/OverlayPositioning'

import { registerWhat3WordsLocation } from '@/api/what3words.api'
import { requestHeight } from '@/api/height.api'
import { generateQrCode } from '@/api/qrcode.api'
import { ClickType } from '@/modules/map/store/map.store'
import OpenLayersPopover from '@/modules/map/components/openlayers/OpenLayersPopover.vue'
import LocationPopupCopy from '@/modules/map/components/LocationPopupCopy.vue'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import { printHumanReadableCoordinates, CoordinateSystems } from '@/utils/coordinateUtils'
import { round } from '@/utils/numberUtils'
import stringifyQuery from '@/router/stringifyQuery'

/** Right click pop up which shows the coordinates of the position under the cursor. */
export default {
    components: {
        ButtonWithIcon,
        LocationPopupCopy,
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
        clickCoordinates(newClickCoordinates) {
            this.requestWhat3WordBackend()
            this.registerHeigthFromBackend()
            this.generateQrCodeFromBackend()
            if (newClickCoordinates) {
                this.overlay.setPosition(newClickCoordinates)
            }
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
        this.overlay.setElement(this.$el)
        this.getMap().addOverlay(this.overlay)
    },
    beforeUnmount() {
        this.overlay.setElement(null)
        this.getMap().removeOverlay(this.overlay)
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
    &-td span {
        user-select: all;
    }
}
.coordinates-list {
    display: grid;
    grid-template-columns: 1fr 2fr;
    grid-column-gap: 5px;
    grid-row-gap: 5px;
}
.qrcode-container {
    text-align: center;
}
</style>
