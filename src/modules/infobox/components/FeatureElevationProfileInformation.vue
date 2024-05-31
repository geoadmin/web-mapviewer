<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, toRefs } from 'vue'

import ElevationProfile from '@/api/profile/ElevationProfile.class'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'
import { format } from '@/utils/numberUtils'
import { formatMinutesTime } from '@/utils/utils'

const props = defineProps({
    profile: {
        type: ElevationProfile,
        default: null,
    },
})

const { profile } = toRefs(props)

const profileInformationFormat = computed(() => {
    if (!profile.value) {
        return []
    }
    return [
        {
            title: 'profile_elevation_difference',
            icons: [['fa', 'arrows-alt-v']],
            value: formatElevation(profile.value.elevationDifference),
        },
        {
            title: 'profile_elevation_up',
            icons: [['fa', 'sort-amount-up-alt']],
            value: formatElevation(profile.value.totalAscent),
        },
        {
            title: 'profile_elevation_down',
            icons: [['fa', 'sort-amount-down-alt']],
            value: formatElevation(profile.value.totalDescent),
        },
        {
            title: 'profile_poi_up',
            icons: [['fa', 'chevron-up']],
            value: formatElevation(profile.value.maxElevation),
        },
        {
            title: 'profile_poi_down',
            icons: [['fa', 'chevron-down']],
            value: formatElevation(profile.value.minElevation),
        },
        {
            title: 'profile_distance',
            icons: [
                ['fa', 'globe'],
                ['fa', 'arrows-alt-h'],
            ],
            value: formatDistance(profile.value.maxDist),
        },
        {
            title: 'profile_slope_distance',
            icons: [
                ['fa', 'mountain-sun'],
                ['fa', 'arrows-alt-h'],
            ],
            value: formatDistance(profile.value.slopeDistance),
        },
        {
            title: 'profile_hike_time',
            icons: [['far', 'clock']],
            value: formatMinutesTime(profile.value.hikingTime),
        },
    ]
})

useTippyTooltip('.profile-info-element[data-tippy-content]')

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
            <small
                v-for="(info, index) in profileInformationFormat"
                :key="info.title"
                :data-tippy-content="info.title"
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
