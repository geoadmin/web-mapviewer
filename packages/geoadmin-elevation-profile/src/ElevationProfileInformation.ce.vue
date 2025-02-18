<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, useTemplateRef } from 'vue'

import {
    type ElevationProfileMetadata,
    formatDistance,
    formatElevation,
    formatMinutesTime,
} from '@/utils'

interface ElevationProfileInformationProps {
    metadata: ElevationProfileMetadata
}

const { metadata } = defineProps<ElevationProfileInformationProps>()

const metadataEntry = useTemplateRef<HTMLElement[]>('metadataEntry')

const metadataEntries = computed(() => {
    return [
        {
            title: 'profile_elevation_difference',
            icons: [['fa', 'arrows-alt-v']],
            value: formatElevation(metadata.elevationDifference),
        },
        {
            title: 'profile_elevation_up',
            icons: [['fa', 'sort-amount-up-alt']],
            value: formatElevation(metadata.totalAscent),
        },
        {
            title: 'profile_elevation_down',
            icons: [['fa', 'sort-amount-down-alt']],
            value: formatElevation(metadata.totalDescent),
        },
        {
            title: 'profile_poi_up',
            icons: [['fa', 'chevron-up']],
            value: formatElevation(metadata.maxElevation),
        },
        {
            title: 'profile_poi_down',
            icons: [['fa', 'chevron-down']],
            value: formatElevation(metadata.minElevation),
        },
        {
            title: 'profile_distance',
            icons: [
                ['fa', 'globe'],
                ['fa', 'arrows-alt-h'],
            ],
            value: formatDistance(metadata.totalLinearDist),
        },
        {
            title: 'profile_slope_distance',
            icons: [
                ['fa', 'mountain-sun'],
                ['fa', 'arrows-alt-h'],
            ],
            value: formatDistance(metadata.slopeDistance),
        },
        {
            title: 'profile_hike_time',
            icons: [['far', 'clock']],
            value: formatMinutesTime(metadata.hikingTime),
        },
    ]
})
</script>

<template>
    <div class="flex gap-1 p-1">
        <div
            v-if="metadata.hasElevationData"
            class="flex border rounded border-neutral-300 p-2 py-3 overflow-x-auto gap-2"
            data-cy="profile-popup-info-container"
        >
            <small
                v-for="(data, index) in metadataEntries"
                :key="data.title"
                ref="metadataEntry"
                :data-tippy-content="data.title"
                class="text-nowrap flex gap-1 items-center"
                :class="{
                    'pe-2 border-r-1 border-neutral-300': index !== metadataEntries.length - 1,
                }"
                :data-cy="`profile-popup-info-${data.title}`"
            >
                <FontAwesomeIcon
                    v-for="(icon, indexIcon) in data.icons"
                    :key="`${data.title}-${indexIcon}`"
                    :icon="icon"
                />
                <span data-cy="profile-popup-info">
                    {{ data.value }}
                </span>
            </small>
        </div>
        <div class="flex gap-2">
            <slot />
        </div>
    </div>
</template>
