<template>
    <div ref="profilePlot" class="profile-graph" data-cy="profile-popup-graph">
        <svg class="profile-svg">
            <g class="profile-group">
                <g class="axis axis-x"></g>
                <g class="axis axis-y" text-anchor="end"></g>
                <g class="profile-grid-x"></g>
                <g class="profile-grid-y"></g>
                <path class="profile-area"></path>
                <text class="profile-source-link" text-anchor="end">
                    <a
                        :href="`https://www.swisstopo.admin.ch/${currentLang}/geodata/height/alti3d.html`"
                        target="_blank"
                    >
                        swissALTI3D
                    </a>
                    &nbsp;/&nbsp;
                    <a
                        :href="`https://www.swisstopo.admin.ch/${currentLang}/geodata/height/dhm25.html`"
                        target="_blank"
                    >
                        DHM25
                    </a>
                </text>
                <text class="profile-label profile-label-x" text-anchor="middle">
                    {{ $t('profile_x_label') }} [{{ unitUsedOnDistanceAxis }}]
                </text>
                <text class="profile-label profile-label-y" text-anchor="middle" dy="0.85em">
                    {{ $t('profile_y_label') }} [m]
                </text>
                <rect
                    ref="profilePopupElement"
                    class="profile-glass"
                    data-cy="profile-popup-area"
                    @mouseover="onMouseOverOverProfile"
                    @mousemove="onMouseMoveOverProfile"
                    @mouseout="onMouseOutOverProfile"
                ></rect>
            </g>
        </svg>
    </div>
    <div
        v-show="showTooltip"
        ref="profileTooltip"
        class="profile-tooltip"
        data-cy="profile-popup-tooltip"
    >
        <div class="profile-tooltip-inner p-2">
            <div>
                <strong>{{ $t('profile_x_label') }}: </strong>
                <span class="distance"></span>
            </div>
            <div>
                <strong>{{ $t('profile_y_label') }}: </strong>
                <span class="elevation"></span>
            </div>
        </div>
        <div ref="profileTooltipArrow" class="profile-tooltip-arrow"></div>
    </div>
</template>

<script>
import { EditableFeature } from '@/api/features.api'
import { GeoAdminProfile } from '@/api/profile.api'
import { profilePlotMargin, updateD3ProfileChart } from '@/modules/drawing/lib/profileD3Utils'
import { CoordinateSystems } from '@/utils/coordinateUtils'
import * as d3 from 'd3'
import { LineString } from 'ol/geom'
import Overlay from 'ol/Overlay'
import proj4 from 'proj4'
import { mapState } from 'vuex'

/**
 * Encapsulate old mf-geoadmin3 d3 profile plot with our newer profile data structure.
 *
 * Updates the plot if the profile data changes.
 */
export default {
    inject: ['getMap'],
    props: {
        profileData: {
            type: GeoAdminProfile,
            required: true,
        },
        feature: {
            type: EditableFeature,
            required: true,
        },
    },
    emits: ['update'],
    data() {
        return {
            showTooltip: false,
        }
    },
    computed: {
        /**
         * If the max distance of the profile is greater than 10'000m, we use kilometer as unit,
         * otherwise meters
         *
         * @returns {string}
         */
        unitUsedOnDistanceAxis() {
            return this.profileData.maxDist >= 10000 ? 'km' : 'm'
        },
        factorToUseForDisplayedDistances() {
            return this.unitUsedOnDistanceAxis === 'km' ? 0.001 : 1.0
        },
        ...mapState({
            currentLang: (state) => state.i18n.lang,
        }),
    },
    watch: {
        profileData() {
            this.updateProfileChart()
        },
    },
    mounted() {
        // listening to window.resize event so that we resize the SVG profile
        window.addEventListener('resize', this.onResize)

        /* Overlay that shows the corresponding position on the map when hovering over the profile
        graph. */
        this.currentHoverPosOverlay = new Overlay({
            element: document.createElement('div'),
            positioning: 'center-center',
            stopEvent: false,
        })
        this.currentHoverPosOverlay.getElement().classList.add('profile-circle-current-hover-pos')

        this.updateProfileChart()
    },
    unmounted() {
        this.getMap().removeOverlay(this.currentHoverPosOverlay)
    },
    methods: {
        onResize() {
            this.$nextTick(this.updateProfileChart)
        },
        updateProfileChart() {
            const { domainX, domainY, axisX, axisY } = updateD3ProfileChart(
                this.$refs.profilePlot,
                this.profileData,
                this.factorToUseForDisplayedDistances
            )
            this.d3domainX = domainX
            this.d3domainY = domainY
            this.d3axisX = axisX
            this.d3axisY = axisY
            this.$emit('update')
        },
        onMouseOverOverProfile() {
            this.showTooltip = true
            // Must be reset everytime we show the overlay, as the user may have changed the color in between.
            this.currentHoverPosOverlay.getElement().style.backgroundColor =
                this.feature.fillColor.fill
            this.getMap().addOverlay(this.currentHoverPosOverlay)
        },
        onMouseMoveOverProfile(event) {
            // processing where the mouse is in relation to the d3 graph
            const [x] = d3.pointer(event)
            const distanceUnderMouseCursor = this.d3domainX.invert(x)
            const elevationUnderMouseCursor = this.getHeightAtDist(distanceUnderMouseCursor)
            const y = this.d3domainY(elevationUnderMouseCursor)

            const profilePlot = this.$refs.profilePlot
            const profileTooltipElement = this.$refs.profileTooltip
            // Calculate center of tooltip (relative to graph)
            const tooltipHalfWidth = profileTooltipElement.offsetWidth / 2
            const plotWidth =
                profilePlot.clientWidth - profilePlotMargin.left - profilePlotMargin.right
            const tooltipCenterX = Math.min(
                Math.max(tooltipHalfWidth - profilePlotMargin.left, x),
                plotWidth - tooltipHalfWidth + profilePlotMargin.right
            )
            // done like this because using of computed makes it very slow X position of arrow (relative to tooltip)
            this.$refs.profileTooltipArrow.style.left =
                tooltipHalfWidth + (x - tooltipCenterX) + 'px' // X position of the tooltip center
            profileTooltipElement.style.left =
                tooltipCenterX +
                profilePlotMargin.left +
                profilePlot.getBoundingClientRect().x +
                'px'
            // Y position of arrowhead
            profileTooltipElement.style.top =
                y + profilePlotMargin.top + profilePlot.getBoundingClientRect().y + 'px'
            // Tooltip text
            profileTooltipElement.querySelector(
                '.distance'
            ).innerText = `${distanceUnderMouseCursor.toFixed(2)} ${this.unitUsedOnDistanceAxis}`
            profileTooltipElement.querySelector(
                '.elevation'
            ).innerText = `${elevationUnderMouseCursor.toFixed(2)} m`

            // Update the position of the overlay
            const coords = proj4(
                CoordinateSystems.LV95.epsg,
                CoordinateSystems.WEBMERCATOR.epsg,
                this.profileData.lineString.getCoordinateAt(x / plotWidth)
            )
            this.currentHoverPosOverlay.setPosition(coords)
        },
        onMouseOutOverProfile() {
            this.showTooltip = false
            this.getMap().removeOverlay(this.currentHoverPosOverlay)
        },

        /**
         * Given a distance from origin, calculate the height.
         *
         * @param {Number} dist Distance (must be in the unit specified by
         *   this.unitUsedOnDistanceAxis, i.e. depending on the length of the path, either km or m)
         * @returns The height in meter at the given distance
         */
        getHeightAtDist(dist) {
            const rawDist = dist / this.factorToUseForDisplayedDistances
            // Find lowerIndex, such that dist[lowerIndex] <= dist <= dist[lowerIndex + 1] = dist[higherIndex]
            // The distance increase between each index is approximately regular, so we can make a first guess
            // with a complexity of O(1) making sure the dist we are searching is within possible values (>= 0 and <= maxDist)
            const distToSearch = Math.min(Math.max(rawDist, 0), this.profileData.maxDist)
            let lowerIndex = Math.trunc(
                ((this.profileData.length - 1) * distToSearch) / this.profileData.maxDist
            )
            lowerIndex = Math.min(lowerIndex, this.profileData.length - 1)
            // As it is not perfectly regular (maybe as a result of trunking the decimals in the backend?) we still need to correct our first guess with these two while loops. */
            while (distToSearch < this.profileData.points[lowerIndex].dist) {
                lowerIndex--
            }
            while (
                lowerIndex < this.profileData.length - 1 &&
                distToSearch > this.profileData.points[lowerIndex + 1].dist
            ) {
                lowerIndex++
            }
            // Now we can linearly interpolate between lowerIndex and higherIndex to find the exact altitude.
            const lowerElevation = this.profileData.points[lowerIndex].elevation
            const lowerDist = this.profileData.points[lowerIndex].dist
            if (lowerIndex >= this.profileData.length - 1) {
                return lowerElevation
            }
            const higherIndex = lowerIndex + 1
            const higherElevation = this.profileData.points[higherIndex].elevation
            const higherDist = this.profileData.points[higherIndex].dist
            const higherRatio = (distToSearch - lowerDist) / (higherDist - lowerDist)
            const lowerRatio = 1 - higherRatio
            return lowerRatio * lowerElevation + higherRatio * higherElevation
        },
    },
}
</script>

<style lang="scss">
// unscoped style as otherwise it will not reached D3 generated HTML
// (as they are not included in the template at mount)
@import 'src/scss/webmapviewer-bootstrap-theme';

.profile-circle-current-hover-pos {
    height: 20px;
    width: 20px;
    border-radius: 50%;
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
    .profile-svg {
        display: block;
        margin: 0;
        width: 100%;
        height: 100%;
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
        font-size: 0.8em;
        text-shadow: 1px 1px $light;
    }
    .profile-label-y {
        transform: rotate(-90);
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
</style>
