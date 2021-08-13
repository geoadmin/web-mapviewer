<template>
    <div
        v-if="showProfile"
        class="card"
        :class="{ 'reduced-popup': minimized, 'profile-popup': !minimized }"
    >
        <div class="card-header">
            <div class="popover-title float-start" @click="expandPopup">
                {{ $t('draw_popup_title_measure') }}
            </div>
            <button :title="$t('close')" type="button" class="close" @click="onClose">
                <font-awesome-icon :icon="['fa', 'times']" />
            </button>
            <button
                v-if="!minimized"
                :title="$t('reduce_label')"
                type="button"
                class="close"
                @click="minimizePopup"
            >
                <font-awesome-icon :icon="['fa', 'minus']" />
            </button>
        </div>
        <div v-if="!minimized" class="card-body">
            <div ref="profile-graph" class="ga-profile-graph"></div>
            <div v-show="showTooltip" ref="profile-tooltip" class="ga-profile-tooltip">
                <div class="ga-profile-tooltip-inner">
                    <strong>Distance: </strong>
                    <span class="distance"></span>
                    <br />
                    <strong>Elevation: </strong>
                    <span class="elevation"></span>
                </div>
                <div class="ga-profile-tooltip-arrow"></div>
            </div>
            <button type="button" class="btn delete-btn" @click="onDelete">
                <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
            <div v-if="profileInfo" class="ga-profile-icons">
                <div class="ga-wrapper">
                    <div :title="$t('profile_elevation_difference')">
                        <font-awesome-icon :icon="['fa', 'arrows-alt-v']" />
                        <div>
                            {{ elevation(profileInfo.elevationDiff) }}
                        </div>
                    </div>
                    <div :title="$t('profile_elevation_up')">
                        <font-awesome-icon :icon="['fa', 'sort-amount-up-alt']" />
                        <div>
                            {{ elevation(profileInfo.totalElevationDiff[0]) }}
                        </div>
                    </div>
                    <div :title="$t('profile_elevation_down')">
                        <font-awesome-icon :icon="['fa', 'sort-amount-down-alt']" />
                        <div>
                            {{ elevation(profileInfo.totalElevationDiff[1]) }}
                        </div>
                    </div>
                    <div :title="$t('profile_poi_up')">
                        <font-awesome-icon :icon="['fa', 'chevron-up']" />
                        <div>
                            {{ elevation(profileInfo.elevationPoints[0]) }}
                        </div>
                    </div>
                    <div :title="$t('profile_poi_down')">
                        <font-awesome-icon :icon="['fa', 'chevron-down']" />
                        <div>
                            {{ elevation(profileInfo.elevationPoints[1]) }}
                        </div>
                    </div>
                    <div :title="$t('profile_distance')">
                        <font-awesome-icon :icon="['far', 'eye']" />
                        <font-awesome-icon :icon="['fa', 'arrows-alt-h']" />
                        <div>
                            {{ distance(profileInfo.distance) }}
                        </div>
                    </div>
                    <div :title="$t('profile_slope_distance')">
                        <font-awesome-icon :icon="['fa', 'arrows-alt-h']" />
                        <div>
                            {{ distance(profileInfo.slopeDistance) }}
                        </div>
                    </div>
                    <div :title="$t('profile_hike_time')">
                        <font-awesome-icon :icon="['far', 'clock']" />
                        <div>
                            <span>{{ $t('approx_abbr') }} </span>{{ time(profileInfo.hikingTime) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { formatTime, toLv95 } from '@/modules/drawing/lib/drawingUtils'
import { profile } from '@/api/profile.api'
import * as d3 from 'd3'
import proj4 from 'proj4'
import { Point } from 'ol/geom'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Feature } from 'ol'
import ProfileChart from '@/modules/drawing/lib/ProfileChart'
import { sketchPointStyle } from '@/modules/drawing/lib/style'
import Polygon from 'ol/geom/Polygon'
import { format } from '@/utils/numberUtils'

export default {
    props: {
        feature: {
            type: Object,
            default: null,
        },
    },
    inject: ['getMap'],
    data: function () {
        return {
            options: {
                margin: { left: 60, right: 5, bottom: 35, top: 5 },
                width: 0,
                height: 0,
                xLabel: 'profile_x_label',
                yLabel: 'profile_y_label',
            },
            showTooltip: false,
            profileInfo: null,
            minimized: false,
        }
    },
    computed: {
        showProfile: function () {
            return (
                this.feature &&
                (this.feature.get('type') === 'LINE' || this.feature.get('type') === 'MEASURE')
            )
        },
    },
    watch: {
        feature: function () {
            this.triggerProfileUpdate = true
        },
    },
    updated() {
        if (this.$refs['profile-graph'] && this.triggerProfileUpdate) {
            this.triggerProfileUpdate = false
            this.updateProfile()
        }
    },
    methods: {
        minimizePopup: function () {
            if (!this.minimized) {
                this.minimized = true
            }
        },
        expandPopup: function () {
            if (this.minimized) {
                this.minimized = false
                this.triggerProfileUpdate = true
            }
        },
        onClose: function () {
            this.$emit('close')
        },
        onDelete: function () {
            this.$emit('delete')
        },
        updateProfile: async function () {
            const profileGraphEl = this.$refs['profile-graph']
            let profileChartEl
            if (!this.profileChart) {
                this.options.width = profileGraphEl.clientWidth
                this.options.height = profileGraphEl.clientHeight
                this.profileChart = new ProfileChart(this.options)
                profileChartEl = await this.create()
            } else {
                profileChartEl = await this.update([
                    profileGraphEl.clientWidth,
                    profileGraphEl.clientHeight,
                ])
            }
            if (profileChartEl) {
                this.profileInfo = this.profileChart.getProfileInfo()
                profileGraphEl.appendChild(profileChartEl)
            }
        },
        create: async function () {
            const data = await this.getProfile(this.getCoordinates())
            this.profileChart.create(data)
            const areaChartPath = this.profileChart.group.select('.ga-profile-area')
            // Creates the additional overlay to display azimuth circle
            this.positionOnMap = new Point([0, 0])
            this.overlay = new VectorLayer({
                source: new VectorSource({
                    useSpatialIndex: false,
                    features: [new Feature(this.positionOnMap)],
                }),
                style: sketchPointStyle,
                updateWhileAnimating: true,
                updateWhileInteracting: true,
                zIndex: 2000,
            })
            this.attachPathListeners(areaChartPath)
            return this.profileChart.element
        },

        update: async function (size) {
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
        distance: function (value) {
            if (isNaN(value) || value === null) return '0.00m'
            if (value < 1000) {
                return `${value.toFixed(2)}m`
            }
            return `${(value / 1000).toFixed(2)}km`
        },
        elevation: function (value) {
            if (isNaN(value) || value === null) return '0.00m'
            if (value < 1000) {
                return `${value.toFixed(2)}m`
            }
            return `${format(Math.round(value), 3)}m`
        },
        time: function (value) {
            return formatTime(value)
        },
    },
}
</script>

<style lang="scss">
.card-header svg {
    height: 18px;
}

.fa-minus {
    padding-top: 6px;
}

.reduced-popup {
    position: absolute !important;
    bottom: 24px;
    z-index: 500;

    .card-header {
        display: flex;
        justify-content: center;
        vertical-align: middle;
        background-color: red;
        color: white;
        padding: 8px 14px;
        border-bottom: 1px solid #ebebeb;
        border-radius: 5px 5px 0 0 !important;

        svg {
            color: white;
        }
    }

    .popover-title {
        padding-right: 5px;
        padding-top: 3px;
        cursor: pointer;
        width: 135px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        margin-right: 0;
        font-size: 14px;
    }
}

.btn.delete-btn {
    color: #333;
    background-color: #e6e6e6;
    border-color: #ccc;
    width: 38px;
    height: 26px;
    display: flex;
    margin-right: 14px;
    margin-bottom: 9px;

    svg {
        height: 10px;
    }
}

.card.profile-popup {
    width: 100%;
    max-height: 380px;
    z-index: 10;
    position: absolute;
    top: auto;
    bottom: 24px;
}

.card.profile-popup > .card-body {
    padding: 9px 14px;
    position: relative;
    display: inline-block;
    width: 100%;
    height: 175px;
    font-size: 12px;

    button {
        position: absolute;
        right: 0;
        bottom: 0;
    }

    svg {
        overflow: visible;
    }

    .axis path,
    .axis line {
        fill: none;
        stroke: #000;
        shape-rendering: crispEdges;
    }

    .tick {
        font-size: 11px;
    }

    .ga-profile-graph {
        overflow: hidden;
        width: 100%;
        height: 145px;
    }

    .ga-profile-inner {
        overflow: hidden;
        width: 100%;
        height: 145px;
    }

    .ga-profile-svg {
        display: block;
        margin: 0;
    }

    .ga-profile-grid-x,
    .ga-profile-grid-y {
        stroke: black;
        opacity: 0.8;

        line {
            stroke-width: 0.02em;
        }
    }

    .ga-profile-area {
        fill: #f00;
        fill-opacity: 0.5;
    }

    .ga-profile-legend,
    .ga-profile-label {
        font-weight: bold;
        text-shadow: 1px 1px lightgrey;
    }

    text {
        cursor: default;
    }

    .ga-profile-tooltip {
        position: absolute;
        height: 45px;
        width: 150px;
        background-color: black;
        color: white;
        opacity: 0.8;
        margin-left: -61px;
        margin-top: -45px;
        border-radius: 5px;

        .ga-profile-tooltip-inner {
            top: 5px;
            position: relative;
            width: inherit;
            height: 40px;
            text-align: center;
        }

        .ga-profile-tooltip-arrow {
            border-color: black transparent transparent;
            border-style: solid;
            border-width: 10px 10px 0px 10px;
            position: absolute;
            top: 45px;
            left: 65px;
        }
    }

    .ga-profile-icons {
        width: auto;
        display: inline-block;
        overflow-x: auto;
        overflow-y: hidden;
        left: 60px;
        position: absolute;

        @media only screen and (max-width: 780px) {
            left: 0px;
            width: 100%;
            height: 30px;
        }
    }

    button + .ga-profile-icons {
        @media (max-width: 780px) {
            width: calc(100% - 50px);
        }
    }

    .ga-wrapper {
        display: flex;
        font-size: 0.9em;
    }

    .ga-wrapper > div {
        display: flex;
        margin: 0 2px;
        justify-content: center;
        vertical-align: middle;
        color: black;
        padding-left: 19px;
        bottom: 2px;
    }

    .ga-wrapper svg {
        height: auto;
        margin-right: 2px;
    }
}
</style>
