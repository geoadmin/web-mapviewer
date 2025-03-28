<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { format } from '@geoadmin/numbers'
import GeoadminTooltip from '@geoadmin/tooltip'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ElevationProfile from '@/api/profile/ElevationProfile.class'
import { formatMinutesTime } from '@/utils/utils'

const { t } = useI18n()

const { profile } = defineProps({
    profile: {
        type: ElevationProfile,
        default: null,
    },
})

const profileInformationFormat = computed(() => {
    if (!profile) {
        return []
    }
    return [
        {
            title: 'profile_elevation_difference',
            icons: [['fa', 'arrows-alt-v']],
            value: formatElevation(profile.elevationDifference),
        },
        {
            title: 'profile_elevation_up',
            icons: [['fa', 'sort-amount-up-alt']],
            value: formatElevation(profile.totalAscent),
        },
        {
            title: 'profile_elevation_down',
            icons: [['fa', 'sort-amount-down-alt']],
            value: formatElevation(profile.totalDescent),
        },
        {
            title: 'profile_poi_up',
            icons: [['fa', 'chevron-up']],
            value: formatElevation(profile.maxElevation),
        },
        {
            title: 'profile_poi_down',
            icons: [['fa', 'chevron-down']],
            value: formatElevation(profile.minElevation),
        },
        {
            title: 'profile_distance',
            icons: [
                ['fa', 'globe'],
                ['fa', 'arrows-alt-h'],
            ],
            value: formatDistance(profile.maxDist),
        },
        {
            title: 'profile_slope_distance',
            icons: [
                ['fa', 'mountain-sun'],
                ['fa', 'arrows-alt-h'],
            ],
            value: formatDistance(profile.slopeDistance),
        },
        {
            title: 'profile_hike_time',
            icons: [['far', 'clock']],
            value: formatMinutesTime(profile.hikingTime),
        },
    ]
})

function formatDistance(value) {
    if (isNaN(value) || value === null) {
        return '0.00m'
    }
    if (value < 1000) {
        return `${value.toFixed(2)}m`
    }
    return `${(value / 1000).toFixed(2)}km`
}

function formatElevation(value) {
    if (isNaN(value) || value === null) {
        return '0.00m'
    }
    if (value < 1000) {
        return `${value.toFixed(2)}m`
    }
    return `${format(Math.round(value), 3)}m`
}
</script>

<template>
    <div class="d-flex p-1 profile-info">
        <div
            v-if="profile && profile.hasElevationData"
            class="profile-info-container d-flex border border-light p-2"
            data-cy="profile-popup-info-container"
        >
            <GeoadminTooltip
                v-for="(info, index) in profileInformationFormat"
                :key="index"
                :tooltip-content="t(info.title)"
            >
                <small
                    :key="info.title"
                    class="px-2 text-nowrap profile-info-element"
                    :class="{
                        'border-end': index !== profileInformationFormat.length - 1,
                    }"
                    :data-cy="`profile-popup-info-${info.title}`"
                >
                    <FontAwesomeIcon
                        v-for="(icon, indexIcon) in info.icons"
                        :key="`${info.title}-${indexIcon}`"
                        :icon="icon"
                        class="me-1"
                    />
                    <span data-cy="profile-popup-info">
                        {{ info.value }}
                    </span>
                </small>
            </GeoadminTooltip>
        </div>
        <slot />
    </div>
</template>

<style lang="scss" scoped>
.profile-info {
    &-container {
        overflow-x: auto;
        max-width: 100%;
    }
}
</style>
