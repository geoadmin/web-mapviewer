<template>
    <div
        v-if="showProfile"
        data-cy="profile-popup"
        class="card profile-popup"
        :class="{ minimized: minimized }"
    >
        <div
            class="card-header d-flex align-content-center"
            data-cy="profile-popup-header"
            @click="toggleMinimized"
        >
            <span class="popover-title flex-grow-1 align-self-center text-start">
                {{ $t('draw_popup_title_measure') }}
            </span>
            <ButtonWithIcon
                v-if="!minimized"
                data-cy="profile-popup-minimize-button"
                small
                :button-font-awesome-icon="['fa', 'window-minimize']"
            />
            <ButtonWithIcon
                data-cy="profile-popup-close-button"
                small
                :button-font-awesome-icon="['fa', 'times']"
                @click="onClose"
            />
        </div>
        <div v-if="!minimized" data-cy="profile-popup-content" class="card-body p-2">
            <div ref="profile-graph" class="profile-graph"></div>
            <div
                v-show="showTooltip"
                ref="profile-tooltip"
                class="profile-tooltip"
                data-cy="profile-popup-tooltip"
            >
                <div class="profile-tooltip-inner p-2">
                    <div>
                        <strong>Distance: </strong>
                        <span class="distance"></span>
                    </div>
                    <div>
                        <strong>Elevation: </strong>
                        <span class="elevation"></span>
                    </div>
                </div>
                <div class="profile-tooltip-arrow"></div>
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
                    :button-font-awesome-icon="['far', 'trash-alt']"
                    data-cy="profile-popup-delete-button"
                    @click="onDelete"
                />
            </div>
        </div>
    </div>
</template>

<script>
import * as d3 from 'd3'
import proj4 from 'proj4'
import { Point } from 'ol/geom'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import Polygon from 'ol/geom/Polygon'
import { Feature } from 'ol'
import { isMobile } from 'mobile-device-detect'

import { profile } from '@/api/profile.api'
import { format } from '@/utils/numberUtils'
import ButtonWithIcon from '@/utils/ButtonWithIcon'
import { formatTime, toLv95 } from '@/modules/drawing/lib/drawingUtils'
import ProfileChart from '@/modules/drawing/lib/ProfileChart'
import { sketchPointStyle } from '@/modules/drawing/lib/style'

export default {
    components: { ButtonWithIcon },
    inject: ['getMap'],
    props: {
        feature: {
            type: Object,
            default: null,
        },
    },
    emits: ['close', 'delete'],
    data: function () {
        return {
            options: {
                margin: { left: 60, right: 5, bottom: 35, top: 5 },
                width: 0,
                height: 0,
                xLabel: 'profile_x_label',
                yLabel: 'profile_y_label',
            },
            positionOnMap: new Point([0, 0]),
            /** Additional overlay to display azimuth circle */
            overlay: new VectorLayer({
                source: new VectorSource({
                    useSpatialIndex: false,
                    features: [new Feature(this.positionOnMap)],
                }),
                style: sketchPointStyle,
                updateWhileAnimating: true,
                updateWhileInteracting: true,
                zIndex: 2000,
            }),
            showTooltip: false,
            profileInfo: null,
            minimized: isMobile,
        }
    },
    computed: {
        showProfile: function () {
            return (
                this.feature &&
                (this.feature.get('type') === 'LINE' || this.feature.get('type') === 'MEASURE')
            )
        },
        profileInformation: function () {
            if (!this.profileInfo) {
                return []
            }
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
        feature: function () {
            this.triggerProfileUpdate = true
        },
    },
    async mounted() {
        // listening to window.resize event so that we resize the SVG profile
        window.addEventListener('resize', this.onResize)
        await this.updateProfile()
    },
    destroyed() {
        window.removeEventListener('resize', this.onResize)
    },
    updated() {
        this.$nextTick(function () {
            // Code that will run only after the entire view has been re-rendered
            if (this.$refs['profile-graph'] && this.triggerProfileUpdate) {
                this.triggerProfileUpdate = false
                this.updateProfile()
            }
        })
    },
    methods: {
        toggleMinimized: function () {
            this.minimized = !this.minimized
            this.triggerProfileUpdate = true
        },
        onClose: function () {
            this.$emit('close')
        },
        onDelete: function () {
            this.$emit('delete')
        },
        onResize: function () {
            if (!this.minimized) {
                this.triggerProfileUpdate = true
                this.updateProfile()
            }
        },
        updateProfile: async function () {
            const profileGraphEl = this.$refs['profile-graph']
            if (!profileGraphEl) {
                return
            }
            let profileChartEl
            if (!this.profileChart) {
                this.options.width = profileGraphEl.clientWidth
                this.options.height = profileGraphEl.clientHeight
                this.profileChart = new ProfileChart(this.options)
                profileChartEl = await this.createProfileChart()
            } else {
                profileChartEl = await this.updateProfileChart([
                    profileGraphEl.clientWidth,
                    profileGraphEl.clientHeight,
                ])
            }
            if (profileChartEl) {
                this.profileInfo = this.profileChart.getProfileInfo()
                profileGraphEl.appendChild(profileChartEl)
            }
        },
        createProfileChart: async function () {
            const data = await this.getProfile(this.getCoordinates())
            this.profileChart.create(data)
            const areaChartPath = this.profileChart.group.select('.profile-area')
            this.attachPathListeners(areaChartPath)
            return this.profileChart.element
        },
        updateProfileChart: async function (size) {
            const data = await this.getProfile(this.getCoordinates())
            this.profileChart.update(data, size)
            return this.profileChart.element
        },
        getCoordinates: function () {
            const geometry = this.feature.getGeometry()
            return geometry instanceof Polygon
                ? geometry.getCoordinates()[0]
                : geometry.getCoordinates()
        },
        getProfile: async function (coordinates) {
            const coordinatesLv95 = toLv95(coordinates, 'EPSG:3857')
            return await profile({
                geom: `{"type":"LineString","coordinates":${JSON.stringify(coordinatesLv95)}}`,
                offset: 0,
                sr: 2056,
                distinct_points: true,
            })
        },
        attachPathListeners: function (areaChartPath) {
            areaChartPath.on('mousemove', (evt) => {
                const x = d3.pointer(evt)[0]
                let pos = evt.target.getPointAtLength(x)

                const start = x
                const end = pos.x
                const accuracy = 5
                for (let i = start; i > end; i += accuracy) {
                    pos = evt.target.getPointAtLength(i)
                    if (pos.x >= x) {
                        break
                    }
                }

                // Get the coordinate value of x and y
                const xCoord = this.profileChart.domain.X.invert(x)
                const yCoord = this.profileChart.domain.Y.invert(pos.y)
                const positionX = this.profileChart.domain.X(xCoord) + this.options.margin.left
                const positionY = this.profileChart.domain.Y(yCoord) + this.options.margin.top
                const toltipEl = this.$refs['profile-tooltip']
                // done like this because using of computed makes it very slow
                toltipEl.style.left = `${positionX}px`
                toltipEl.style.top = `${positionY}px`
                toltipEl.querySelector('.distance').innerText = `${xCoord.toFixed(2)}${
                    this.profileInfo.unitX
                }`
                toltipEl.querySelector('.elevation').innerText = `${yCoord.toFixed(2)} m`
                const coordsMap = this.profileChart.findMapCoordinates(xCoord)
                this.positionOnMap.setCoordinates(proj4('EPSG:2056', 'EPSG:3857', coordsMap))
            })

            areaChartPath.on('mouseover', () => {
                this.showTooltip = true
                this.overlay.setMap(this.getMap())
            })

            areaChartPath.on('mouseout', () => {
                this.showTooltip = false
                this.overlay.setMap(null)
            })
        },
        formatDistance: function (value) {
            if (isNaN(value) || value === null) return '0.00m'
            if (value < 1000) {
                return `${value.toFixed(2)}m`
            }
            return `${(value / 1000).toFixed(2)}km`
        },
        formatElevation: function (value) {
            if (isNaN(value) || value === null) return '0.00m'
            if (value < 1000) {
                return `${value.toFixed(2)}m`
            }
            return `${format(Math.round(value), 3)}m`
        },
    },
}
</script>

<style lang="scss">
@import 'src/scss/bootstrap-theme';

.profile-popup {
    position: absolute;
    z-index: $zindex-map + 2; // so that we are above the map toolbox (background wheel, zoom buttons, etc...)
    top: auto;
    bottom: $footer-height;
    width: 100%;
    max-height: 380px;

    &.minimized {
        .popover-title {
            cursor: pointer;
        }
    }
    .profile-info-container {
        overflow-x: auto;
        max-width: 100vw;
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
            fill: $red;
            fill-opacity: 0.5;
        }
        .profile-legend,
        .profile-label {
            font-weight: bold;
            text-shadow: 1px 1px $light;
        }
        svg {
            overflow: visible;
        }
        text {
            cursor: default;
        }
    }

    .profile-tooltip {
        position: absolute;
        height: auto;
        width: auto;
        background-color: $black;
        color: $white;
        opacity: 0.8;
        margin-left: -61px;
        margin-top: -45px;
        border-radius: 5px;

        .profile-tooltip-arrow {
            border-color: $black transparent transparent;
            border-style: solid;
            border-width: 10px 10px 0 10px;
            position: absolute;
            bottom: -10px;
            left: calc(50% - 10px);
        }
    }
}
</style>
