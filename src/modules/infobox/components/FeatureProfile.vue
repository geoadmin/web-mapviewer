<template>
    <div
        ref="profilePopupContent"
        data-cy="profile-popup-content"
        data-infobox="height-reference"
        class="profile-popup-content"
    >
        <div ref="profileGraph" class="profile-graph"></div>
        <div ref="profileTooltipAnchor" class="profile-tooltip-anchor"></div>
        <div
            v-show="showTooltip"
            ref="profileTooltip"
            class="profile-tooltip"
            data-cy="profile-popup-tooltip"
        >
            <div class="profile-tooltip-inner p-2">
                <div>
                    <strong>{{ $t(options.xLabel) }}: </strong>
                    <span class="distance"></span>
                </div>
                <div>
                    <strong>{{ $t(options.yLabel) }}: </strong>
                    <span class="elevation"></span>
                </div>
            </div>
            <div ref="profileTooltipArrow" class="profile-tooltip-arrow"></div>
        </div>
        <div v-if="profileInformation.length" class="d-flex p-2">
            <div
                class="flex-grow-1 profile-info-container d-flex border border-light ps-1 pe-4 py-1"
                data-cy="profile-popup-info-container"
            >
                <span
                    v-for="info in profileInformation"
                    :key="info.title"
                    :title="$t(info.title)"
                    class="mx-2 text-nowrap d-flex align-content-center align-self-center"
                >
                    <font-awesome-icon
                        v-for="(icon, index) in info.icons"
                        :key="`${info.title}-${index}`"
                        :icon="icon"
                        class="me-1 align-self-center"
                    />
                    &nbsp;
                    <span data-cy="profile-popup-info">
                        {{ info.value }}
                    </span>
                </span>
            </div>
            <ButtonWithIcon
                :button-font-awesome-icon="['fas', 'download']"
                data-cy="profile-popup-csv-download-button"
                @click="onCSVDownload"
            />
            <ButtonWithIcon
                :button-font-awesome-icon="['far', 'trash-alt']"
                data-cy="profile-popup-delete-button"
                @click="onDelete"
            />
        </div>
    </div>
</template>

<script>
import { EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import { profileCsv, profileJson } from '@/api/profile.api'
import { formatTime, toLv95 } from '@/modules/drawing/lib/drawingUtils'
import ProfileChart from '@/modules/drawing/lib/ProfileChart'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import { CoordinateSystems } from '@/utils/coordinateUtils'
import { format } from '@/utils/numberUtils'
import * as d3 from 'd3'
import { mapActions } from 'vuex'
import { generateFilename } from '@/modules/drawing/lib/export-utils'
import log from '@/utils/logging'
import Overlay from 'ol/Overlay'
import proj4 from 'proj4'

export default {
    components: { ButtonWithIcon },
    inject: ['getMap'],
    props: {
        feature: {
            type: EditableFeature,
            required: true,
        },
    },
    data() {
        return {
            showTooltip: false,
            options: {
                margin: { left: 55, right: 15, bottom: 35, top: 15 },
                width: 0,
                height: 0,
                xLabel: 'profile_x_label',
                yLabel: 'profile_y_label',
                sourceLinks: [
                    {
                        label: 'swissALTI3D',
                        url:
                            this.$i18n.locale === 'rm' //* Linked site is not translated in Rm *//
                                ? `https://www.swisstopo.admin.ch/de/geodata/height/alti3d.html`
                                : `https://www.swisstopo.admin.ch/${this.$i18n.locale}/geodata/height/alti3d.html`,
                    },
                    {
                        label: 'DHM25',
                        url:
                            this.$i18n.locale === 'rm' //* Linked site is not translated in Rm *//
                                ? `https://www.swisstopo.admin.ch/de/geodata/height/dhm25.html`
                                : `https://www.swisstopo.admin.ch/${this.$i18n.locale}/geodata/height/dhm25.html`,
                    },
                ],
            },
            // Not simply a null property, since it should already be added to the dom from the
            // beginning for correct height calculations in TooltipBox.vue setMaxHeight()
            profileInfo: {
                elevationDiff: 0,
                totalElevationDiff: 0,
                elevationPoints: 0,
                distance: 0,
                slopeDistance: 0,
                hikingTime: 0,
                unitX: 0,
            },
        }
    },
    computed: {
        featureCoordinates() {
            return this.feature.coordinates
        },
        showProfile() {
            return (
                this.feature &&
                (this.feature.featureType === EditableFeatureTypes.MEASURE ||
                    this.feature.featureType === EditableFeatureTypes.LINEPOLYGON)
            )
        },
        profileInformation() {
            return [
                {
                    title: 'profile_elevation_difference',
                    icons: [['fa', 'arrows-alt-v']],
                    value: this.formatElevation(this.profileInfo.elevationDiff),
                },
                {
                    title: 'profile_elevation_up',
                    icons: [['fa', 'sort-amount-up-alt']],
                    value: this.formatElevation(this.profileInfo.totalElevationDiff[0]),
                },
                {
                    title: 'profile_elevation_down',
                    icons: [['fa', 'sort-amount-down-alt']],
                    value: this.formatElevation(this.profileInfo.totalElevationDiff[1]),
                },
                {
                    title: 'profile_poi_up',
                    icons: [['fa', 'chevron-up']],
                    value: this.formatElevation(this.profileInfo.elevationPoints[0]),
                },
                {
                    title: 'profile_poi_down',
                    icons: [['fa', 'chevron-down']],
                    value: this.formatElevation(this.profileInfo.elevationPoints[1]),
                },
                {
                    title: 'profile_distance',
                    icons: [
                        ['far', 'eye'],
                        ['fa', 'arrows-alt-h'],
                    ],
                    value: this.formatDistance(this.profileInfo.distance),
                },
                {
                    title: 'profile_slope_distance',
                    icons: [['fa', 'arrows-alt-h']],
                    value: this.formatDistance(this.profileInfo.slopeDistance),
                },
                {
                    title: 'profile_hike_time',
                    icons: [['far', 'clock']],
                    value: formatTime(this.profileInfo.hikingTime),
                },
            ]
        },
    },
    watch: {
        featureCoordinates() {
            this.$nextTick(this.updateProfile)
        },
    },
    mounted() {
        // listening to window.resize event so that we resize the SVG profile
        window.addEventListener('resize', this.onResize)
        this.$nextTick(this.updateProfile)

        /* Overlay that shows the corresponding position on the map when hovering over the profile
        graph. */
        this.currentHoverPosOverlay = new Overlay({
            element: document.createElement('div'),
            positioning: 'center-center',
            stopEvent: false,
        })
        this.currentHoverPosOverlay.getElement().classList.add('profile-circle-current-hover-pos')
    },
    unmounted() {
        window.removeEventListener('resize', this.onResize)
        this.getMap().removeOverlay(this.currentHoverPosOverlay)
    },
    methods: {
        ...mapActions(['deleteDrawingFeature']),
        onDelete() {
            const id = this.feature.id.replace('drawing_feature_', '')
            this.deleteDrawingFeature(id)
        },
        onCSVDownload() {
            this.getProfile(profileCsv).then((data) => {
                const dataBlob = new Blob([data], { type: 'text/csv', endings: 'native' })
                this.triggerDownload(dataBlob, generateFilename('.csv'))
            })
        },
        onResize() {
            this.$nextTick(this.updateProfile)
        },
        async updateProfile() {
            const containerEl = this.$refs.profileGraph
            if (!containerEl) {
                return
            }
            let chartEl
            if (!this.profileChart) {
                this.options.width = containerEl.clientWidth
                this.options.height = containerEl.clientHeight
                this.profileChart = new ProfileChart(this.options)
                chartEl = await this.createProfileChart()
            } else {
                chartEl = await this.updateProfileChart([
                    containerEl.clientWidth,
                    containerEl.clientHeight,
                ])
            }
            if (chartEl) {
                this.profileInfo = this.profileChart.getProfileInfo()
                containerEl.appendChild(chartEl)
            }
        },
        async createProfileChart() {
            const data = await this.getProfile()
            this.profileChart.create(data)
            const areaChartPath = this.profileChart.group.select('.profile-area')
            const glass = this.profileChart.glass
            this.attachPathListeners(areaChartPath, glass)
            return this.profileChart.element
        },
        async updateProfileChart(size) {
            const data = await this.getProfile()
            this.profileChart.update(data, size)
            return this.profileChart.element
        },
        async getProfile(apiFunction = profileJson, coordinates = this.featureCoordinates) {
            const coordinatesLv95 = toLv95(coordinates, CoordinateSystems.WEBMERCATOR.epsg)
            try {
                return await apiFunction({
                    geom: { type: 'LineString', coordinates: coordinatesLv95 },
                    offset: 0,
                    sr: CoordinateSystems.LV95.espgNumber,
                    distinct_points: true,
                })
            } catch (e) {
                log.error('Error while geting profile: ', e)
            }
        },
        triggerDownload(blob, fileName) {
            /**
             * A link is needed to be able to set the fileName of the downloaded file, as
             * window.open() does not support that
             */
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = fileName

            link.click()
            URL.revokeObjectURL(link.href)
        },
        attachPathListeners(areaChartPath, glass) {
            glass.on('mousemove', (evt) => {
                // Get the coordinate value of x and y
                const [x] = d3.pointer(evt)
                const xCoord = this.profileChart.domain.X.invert(x)
                const yCoord = this.profileChart.getHeightAtDist(xCoord)
                const y = this.profileChart.domain.Y(yCoord)
                const toltipEl = this.$refs.profileTooltip
                const tooltipArrow = this.$refs.profileTooltipArrow
                // Calculate center of tooltip (relative to graph)
                const tooltipHalfWidth = toltipEl.offsetWidth / 2
                const plotWidth =
                    this.options.width - this.options.margin.left - this.options.margin.right
                const tooltipCenterX = Math.min(
                    Math.max(tooltipHalfWidth - this.options.margin.left, x),
                    plotWidth - tooltipHalfWidth + this.options.margin.right
                )
                // done like this because using of computed makes it very slow
                // X position of arrow (relative to tooltip)
                tooltipArrow.style.left = tooltipHalfWidth + (x - tooltipCenterX) + 'px'
                // X position of the tooltip center
                toltipEl.style.left =
                    tooltipCenterX +
                    this.options.margin.left +
                    this.$refs.profilePopupContent.getBoundingClientRect().x -
                    this.$refs.profileTooltipAnchor.getBoundingClientRect().x +
                    'px'
                // Y position of arrowhead
                toltipEl.style.top =
                    y +
                    this.options.margin.top +
                    this.$refs.profilePopupContent.getBoundingClientRect().y -
                    this.$refs.profileTooltipAnchor.getBoundingClientRect().y +
                    'px'
                // Tooltip text
                toltipEl.querySelector('.distance').innerText = `${xCoord.toFixed(2)} ${
                    this.profileInfo.unitX
                }`
                toltipEl.querySelector('.elevation').innerText = `${yCoord.toFixed(2)} m`

                // Update the position of the overlay
                const coords = proj4(
                    CoordinateSystems.LV95.epsg,
                    CoordinateSystems.WEBMERCATOR.epsg,
                    this.profileChart.lineString.getCoordinateAt(x / plotWidth)
                )
                this.currentHoverPosOverlay.setPosition(coords)
            })
            glass.on('mouseover', () => {
                this.showTooltip = true
                /* Must be reset everytime we show the overlay, as the user may have changed the
                color in between. */
                this.currentHoverPosOverlay.getElement().style.backgroundColor =
                    this.feature.fillColor.fill
                this.getMap().addOverlay(this.currentHoverPosOverlay)
            })
            glass.on('mouseout', () => {
                this.showTooltip = false
                this.getMap().removeOverlay(this.currentHoverPosOverlay)
            })
        },
        formatDistance(value) {
            if (isNaN(value) || value === null) {
                return '0.00m'
            }
            if (value < 1000) {
                return `${value.toFixed(2)}m`
            }
            return `${(value / 1000).toFixed(2)}km`
        },
        formatElevation(value) {
            if (isNaN(value) || value === null) {
                return '0.00m'
            }
            if (value < 1000) {
                return `${value.toFixed(2)}m`
            }
            return `${format(Math.round(value), 3)}m`
        },
    },
}
</script>

<style lang="scss">
// unscoped style as otherwise it will not reached D3 generated HTML
// (as they are not included in the template at mount)
@import 'src/scss/webmapviewer-bootstrap-theme';

.profile-popup-content {
    position: relative;
}

.profile-graph {
    overflow: hidden;
    width: 100%;
    height: 145px;

    .axis path,
    .axis line {
        fill: none;
        stroke: #000;
        shape-rendering: crispEdges;
    }
    .tick {
        font-size: 11px;
    }
    .profile-inner {
        overflow: hidden;
        width: 100%;
        height: 145px;

        .profile-svg {
            display: block;
            margin: 0;
            width: 100%;
            height: 100%;
        }
    }
    .profile-grid-x,
    .profile-grid-y {
        stroke: black;
        opacity: 0.8;

        line {
            stroke-width: 0.02em;
        }
    }
    .profile-area {
        fill: $primary;
        fill-opacity: 0.5;
    }
    .profile-label {
        font-weight: bold;
        text-shadow: 1px 1px $light;
    }
    svg {
        overflow: visible;
    }

    a {
        fill: $link-color;

        &:hover,
        &:focus {
            fill: $link-hover-color;
        }
    }
}

.profile-info-container {
    overflow-x: auto;
    max-width: 100vw;
}
// Anchor is needed, as "fixed" coordinates are not absolute, but relative
// to the last transform
.profile-tooltip-anchor {
    position: fixed;
    pointer-events: none;
    opacity: 0;
    left: 0;
    top: 0;
    height: 0;
    width: 0;
}
.profile-tooltip {
    $arrow_height: 10px; // arrow_width = 2* arrow_height
    //In contrary to "absolute", "fixed" ignores any overflow value
    //and the tooltip appears above everything else
    position: fixed;
    pointer-events: none;
    white-space: nowrap;
    background-color: $black;
    color: $white;
    opacity: 0.8;
    transform: translate(-50%, calc(-100% - $arrow_height));
    border-radius: 5px;

    .profile-tooltip-arrow {
        border: $arrow_height solid transparent;
        border-top-color: $black;
        position: absolute;
        top: 100%;
        transform: translate(-$arrow_height, 0);
    }
}

.profile-circle-current-hover-pos {
    height: 20px;
    width: 20px;
    border-radius: 50%;
}
</style>
