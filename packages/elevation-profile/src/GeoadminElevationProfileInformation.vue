<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { SupportedLocales } from '@/config'
import type { VueI18nTranslateFunction } from '@/vue-i18n'

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

interface ElevationProfileInformationMessages {
    profile_distance: string
    profile_elevation_difference: string
    profile_elevation_down: string
    profile_elevation_up: string
    profile_hike_time: string
    profile_poi_down: string
    profile_poi_up: string
    profile_slope_distance: string
}
const { t }: { t: VueI18nTranslateFunction<ElevationProfileInformationMessages> } = useI18n<
    ElevationProfileInformationMessages,
    SupportedLocales
>()

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
    <div class="tw:flex tw:gap-1 tw:p-1">
        <div
            v-if="metadata.hasElevationData"
            class="tw:flex tw:border tw:rounded tw:border-neutral-300 tw:p-1 tw:py-2 tw:md:p-2 tw:md:py-3 tw:overflow-x-auto tw:gap-2"
            data-cy="profile-popup-info-container"
        >
            <GeoadminTooltip
                v-for="(data, index) in metadataEntries"
                :key="data.title"
                :tooltip-content="t(data.title)"
            >
                <small
                    class="tw:text-nowrap tw:flex tw:gap-1 tw:items-center"
                    :class="{
                        'tw:pe-2 tw:border-r-1 tw:border-neutral-300':
                            index !== metadataEntries.length - 1,
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
            </GeoadminTooltip>
        </div>
        <div class="tw:flex tw:gap-1">
            <slot />
        </div>
    </div>
</template>
