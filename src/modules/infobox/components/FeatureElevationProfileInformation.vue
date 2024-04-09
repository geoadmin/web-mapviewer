<template>
    <div class="d-flex p-1 profile-popup-info-buttons">
        <div
            v-if="profile && profile.hasElevationData"
            class="flex-grow-1 profile-info-container d-flex border border-light ps-1 pe-4 py-1"
            data-cy="profile-popup-info-container"
        >
            <small
                v-for="info in profileInformationFormat"
                :key="info.title"
                :title="$t(info.title)"
                class="mx-2 text-nowrap d-flex align-content-center align-self-center"
                :data-cy="`profile-popup-info-${info.title}`"
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
            </small>
        </div>
        <slot />
    </div>
</template>

<script>
import ElevationProfile from '@/api/profile/ElevationProfile.class'
import { format } from '@/utils/numberUtils'
import { formatMinutesTime } from '@/utils/utils'

export default {
    props: {
        profile: {
            type: ElevationProfile,
            default: null,
        },
    },
    computed: {
        profileInformationFormat() {
            if (this.profile) {
                return [
                    {
                        title: 'profile_elevation_difference',
                        icons: [['fa', 'arrows-alt-v']],
                        value: this.formatElevation(this.profile.elevationDifference),
                    },
                    {
                        title: 'profile_elevation_up',
                        icons: [['fa', 'sort-amount-up-alt']],
                        value: this.formatElevation(this.profile.totalAscent),
                    },
                    {
                        title: 'profile_elevation_down',
                        icons: [['fa', 'sort-amount-down-alt']],
                        value: this.formatElevation(this.profile.totalDescent),
                    },
                    {
                        title: 'profile_poi_up',
                        icons: [['fa', 'chevron-up']],
                        value: this.formatElevation(this.profile.maxElevation),
                    },
                    {
                        title: 'profile_poi_down',
                        icons: [['fa', 'chevron-down']],
                        value: this.formatElevation(this.profile.minElevation),
                    },
                    {
                        title: 'profile_distance',
                        icons: [
                            ['fa', 'globe'],
                            ['fa', 'arrows-alt-h'],
                        ],
                        value: this.formatDistance(this.profile.maxDist),
                    },
                    {
                        title: 'profile_slope_distance',
                        icons: [
                            ['fa', 'mountain-sun'],
                            ['fa', 'arrows-alt-h'],
                        ],
                        value: this.formatDistance(this.profile.slopeDistance),
                    },
                    {
                        title: 'profile_hike_time',
                        icons: [['far', 'clock']],
                        value: formatMinutesTime(this.profile.hikingTime),
                    },
                ]
            }
            return []
        },
    },
    methods: {
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

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.profile-info-container {
    overflow-x: auto;
    max-width: 100%;
}
.profile-popup-info-buttons {
    // setting the height as minimum height, so that it is taken into account when drawing the first
    // profile chart plot
    min-height: 39px;
    button {
        margin-left: $button-spacer;
    }
}
</style>
