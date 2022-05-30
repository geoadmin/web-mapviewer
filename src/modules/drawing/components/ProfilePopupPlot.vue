<template>
    <div data-cy="profile-popup-content">
        <div ref="profileGraph" class="profile-graph"></div>
        <div
            v-show="showTooltip"
            ref="profileTooltip"
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
</template>

<script>
import { EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import { profile } from '@/api/profile.api'
import { formatTime, toLv95 } from '@/modules/drawing/lib/drawingUtils'
import ProfileChart from '@/modules/drawing/lib/ProfileChart'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import { format } from '@/utils/numberUtils'
import * as d3 from 'd3'

export default {
    components: { ButtonWithIcon },
    props: {
        feature: {
            type: EditableFeature,
            required: true,
        },
    },
    emits: ['delete'],
    data() {
        return {
            showTooltip: false,
            options: {
                margin: { left: 50, right: 0, bottom: 25, top: 15 },
                width: 0,
                height: 0,
                xLabel: 'profile_x_label',
                yLabel: 'profile_y_label',
                sourceLinks: [
                    {
                        label: 'swissALTI3D',
                        url:
                            this.$i18n.locale == 'rm' //* Linked site is not translated in Rm *//
                                ? `https://www.swisstopo.admin.ch/de/geodata/height/alti3d.html`
                                : `https://www.swisstopo.admin.ch/${this.$i18n.locale}/geodata/height/alti3d.html`,
                    },
                    {
                        label: 'DHM25',
                        url:
                            this.$i18n.locale == 'rm' //* Linked site is not translated in Rm *//
                                ? `https://www.swisstopo.admin.ch/de/geodata/height/dhm25.html`
                                : `https://www.swisstopo.admin.ch/${this.$i18n.locale}/geodata/height/dhm25.html`,
                    },
                ],
            },
            profileInfo: null,
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
        featureCoordinates() {
            this.$nextTick(this.updateProfile)
        },
    },
    mounted() {
        // listening to window.resize event so that we resize the SVG profile
        window.addEventListener('resize', this.onResize)
        this.$nextTick(this.updateProfile)
    },
    unmounted() {
        window.removeEventListener('resize', this.onResize)
    },
    methods: {
        onDelete() {
            this.$emit('delete')
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
            const data = await this.getProfile(this.featureCoordinates)
            this.profileChart.create(data)
            const areaChartPath = this.profileChart.group.select('.profile-area')
            this.attachPathListeners(areaChartPath)
            return this.profileChart.element
        },
        async updateProfileChart(size) {
            const data = await this.getProfile(this.featureCoordinates)
            this.profileChart.update(data, size)
            return this.profileChart.element
        },
        async getProfile(coordinates) {
            const coordinatesLv95 = toLv95(coordinates, 'EPSG:3857')
            return await profile({
                geom: `{"type":"LineString","coordinates":${JSON.stringify(coordinatesLv95)}}`,
                offset: 0,
                sr: 2056,
                distinct_points: true,
            })
        },
        attachPathListeners(areaChartPath) {
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
                const toltipEl = this.$refs.profileTooltip
                // done like this because using of computed makes it very slow
                toltipEl.style.left = `${positionX}px`
                toltipEl.style.top = `${positionY}px`
                toltipEl.querySelector('.distance').innerText = `${xCoord.toFixed(2)}${
                    this.profileInfo.unitX
                }`
                toltipEl.querySelector('.elevation').innerText = `${yCoord.toFixed(2)} m`
                // const coordsMap = this.profileChart.findMapCoordinates(xCoord)
                // this.positionOnMap.setCoordinates(proj4('EPSG:2056', 'EPSG:3857', coordsMap))
            })

            areaChartPath.on('mouseover', () => {
                this.showTooltip = true
                // this.overlay.setMap(this.getMap())
            })

            areaChartPath.on('mouseout', () => {
                this.showTooltip = false
                // this.overlay.setMap(null)
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
</style>
