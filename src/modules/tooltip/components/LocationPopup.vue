<template>
    <div v-if="isRightClick" class="location-popup" :style="computedStyle">
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
                <div>
                    {{ clickCoordinatesLV95 }}
                </div>
                <div>
                    <a :href="$t('contextpopup_lv03_url')" target="_blank">CH1903 / LV03</a>
                </div>
                <div>
                    {{ clickCoordinatesLV03 }}
                </div>
                <div>
                    <a :href="$t('contextpopup_wgs84_url')" target="_blank">WGS 84 (lat/lon)</a>
                </div>
                <div>
                    {{ clickCoordinatesWGS84 }}
                </div>
                <div>
                    <a :href="$t('contextpopup_utm_url')" target="_blank">UTM</a>
                </div>
                <div>
                    {{ clickCoordinatesUTM }}
                </div>
                <div>
                    <a :href="$t('contextpopup_mgrs_url')" target="_blank">MGRS</a>
                </div>
                <div>
                    {{ clickCoordinatesMGRS }}
                </div>
                <div>
                    <a :href="$t('contextpopup_what3words_url')" target="_blank">what3words</a>
                </div>
                <div></div>
                <div>{{ $t('elevation') }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import proj4 from 'proj4'
import { mapState, mapActions } from 'vuex'
import { ClickType } from '@/modules/map/store/map.store'
import { printHumanReadableCoordinates, CoordinateSystems } from '@/utils/coordinateUtils'
import ButtonWithIcon from '@/utils/ButtonWithIcon'

export default {
    components: { ButtonWithIcon },
    computed: {
        ...mapState({
            clickInfo: (state) => state.map.clickInfo,
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
        computedStyle: function () {
            return {
                top: `${this.clickInfo.pixelCoordinate[1] + 25}px`,
                left: `${this.clickInfo.pixelCoordinate[0] - 150}px`,
            }
        },
    },
    methods: {
        ...mapActions(['clearClick']),
        onClose: function () {
            this.clearClick()
        },
        reprojectClickCoordinates: function (targetEpsg) {
            return proj4('EPSG:3857', targetEpsg, this.clickCoordinates)
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/bootstrap-theme';
.location-popup {
    position: absolute;
    z-index: $zindex-map + 1;
    width: auto;
    max-width: 400px;
    height: auto;

    .coordinates-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-column-gap: 5px;
        grid-row-gap: 5px;
    }
}
</style>
