<script setup lang="ts">
import type { ElevationProfileMetadata } from '@swissgeo/api'
import type { SupportedLocales } from '@swissgeo/staging-config'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { profileUtils } from '@swissgeo/api/utils'
import GeoadminTooltip from '@swissgeo/tooltip'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { VueI18nTranslateFunction } from '../types/vue-i18n'

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
            value: profileUtils.formatElevation(metadata.elevationDifference),
        },
        {
            title: 'profile_elevation_up',
            icons: [['fa', 'sort-amount-up-alt']],
            value: profileUtils.formatElevation(metadata.totalAscent),
        },
        {
            title: 'profile_elevation_down',
            icons: [['fa', 'sort-amount-down-alt']],
            value: profileUtils.formatElevation(metadata.totalDescent),
        },
        {
            title: 'profile_poi_up',
            icons: [['fa', 'chevron-up']],
            value: profileUtils.formatElevation(metadata.maxElevation),
        },
        {
            title: 'profile_poi_down',
            icons: [['fa', 'chevron-down']],
            value: profileUtils.formatElevation(metadata.minElevation),
        },
        {
            title: 'profile_distance',
            icons: [
                ['fa', 'globe'],
                ['fa', 'arrows-alt-h'],
            ],
            value: profileUtils.formatDistance(metadata.totalLinearDist),
        },
        {
            title: 'profile_slope_distance',
            icons: [
                ['fa', 'mountain-sun'],
                ['fa', 'arrows-alt-h'],
            ],
            value: profileUtils.formatDistance(metadata.slopeDistance),
        },
        {
            title: 'profile_hike_time',
            icons: [['far', 'clock']],
            value: profileUtils.formatMinutesTime(metadata.hikingTime),
        },
    ]
})
</script>

<template>
    <div class="flex gap-1 p-1">
        <div
            v-if="metadata.hasElevationData"
            class="flex gap-2 overflow-x-auto rounded border border-neutral-300 p-1 py-2 md:p-2 md:py-3"
            data-cy="profile-popup-info-container"
        >
            <GeoadminTooltip
                v-for="(data, index) in metadataEntries"
                :key="data.title"
                :tooltip-content="t(data.title)"
            >
                <small
                    class="flex items-center gap-1 text-nowrap"
                    :class="{
                        'border-r-1 border-neutral-300 pe-2': index !== metadataEntries.length - 1,
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
        <div class="flex gap-1">
            <slot />
        </div>
    </div>
</template>
