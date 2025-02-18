<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    allCoordinateSystems,
    type CoordinateSystem,
    LV95,
    type SingleCoordinate,
    WGS84,
} from '@geoadmin/coordinates'
import proj4 from 'proj4'
import { computed, type ComputedRef, onMounted, type Ref, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { SupportedLocales } from '@/config.ts'
import type { ElevationProfileMetadata } from '@/utils'
import type { VueI18nTranslateFunction } from '@/vue-i18n'

import GeoadminElevationProfileInformation from '@/GeoadminElevationProfileInformation.vue'
import GeoadminElevationProfilePlot from '@/GeoadminElevationProfilePlot.vue'
import getProfile, { type ElevationProfile, ElevationProfileError } from '@/profile.api'

interface ElevationProfileProps {
    title?: string
    points: SingleCoordinate[]
    projection: string
}

const {
    title = undefined,
    points = [],
    projection = LV95.epsg,
} = defineProps<ElevationProfileProps>()

type ElevationProfileErrorMessages = {
    profile_network_error: string
    profile_too_many_points_error: string
    could_not_generate_profile: string
}

const { t }: { t: VueI18nTranslateFunction<ElevationProfileErrorMessages> } = useI18n<
    ElevationProfileErrorMessages,
    SupportedLocales
>()

const coordinateSystem: ComputedRef<CoordinateSystem> = computed(
    () => allCoordinateSystems.find((cs) => cs.epsg === projection) ?? LV95
)
const profileData: Ref<ElevationProfile | undefined> = ref(undefined)
const profileRequestError: Ref<ElevationProfileError | null> = ref(null)
const hasData: ComputedRef<boolean> = computed(
    () => !!profileData.value?.metadata?.hasElevationData
)

const profileMetadata: ComputedRef<ElevationProfileMetadata | undefined> = computed(() => {
    if (!profileData.value) {
        return undefined
    }
    return profileData.value.metadata
})

onMounted(() => {
    getProfile(points, coordinateSystem.value)
        .then((profile) => {
            profileData.value = profile
        })
        .catch((err) => {
            profileRequestError.value = err
        })
})

function triggerDownload(blob: Blob, fileName: string) {
    /**
     * A link is needed to be able to set the fileName of the downloaded file, as window.open() does
     * not support that
     */
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = fileName

    link.click()
    URL.revokeObjectURL(link.href)
}

function onCSVDownload() {
    if (profileData.value && hasData.value) {
        const csvData =
            [
                ['Distance', 'Altitude', 'Easting', 'Northing', 'Longitude', 'Latitude'],
                ...profileData.value.segments
                    .flatMap((segment) => segment.points)
                    .map((point) => {
                        const [lon, lat] = proj4(
                            coordinateSystem.value.epsg,
                            WGS84.epsg,
                            point.coordinate
                        )
                        const [x, y] = proj4(
                            coordinateSystem.value.epsg,
                            LV95.epsg,
                            point.coordinate
                        )
                        return [
                            point.dist,
                            point.elevation,
                            LV95.roundCoordinateValue(x),
                            LV95.roundCoordinateValue(y),
                            WGS84.roundCoordinateValue(lon),
                            WGS84.roundCoordinateValue(lat),
                        ]
                    }),
            ]
                .map((row) => row.join(';'))
                .join('\n') + '\n' // with an added empty line
        triggerDownload(new Blob([csvData], { type: 'text/csv' }), `${title ?? 'export'}.csv`)
    }
}
</script>

<template>
    <div
        data-cy="profile-popup-content"
        class="tw:flex tw:h-auto tw:min-h-[200px] tw:flex-col tw:p-2"
    >
        <div v-if="!hasData && profileRequestError">
            <span
                class="tw:text-danger"
                data-cy="profile-error-message"
            >
                {{ t(profileRequestError.message) }}
            </span>
        </div>
        <GeoadminElevationProfilePlot
            v-if="profileData && hasData"
            :profile="profileData"
        >
            <slot />
        </GeoadminElevationProfilePlot>
        <GeoadminElevationProfileInformation
            v-if="profileMetadata"
            :metadata="profileMetadata"
        >
            <button
                class="tw:bg-neutral-100 tw:hover:bg-neutral-200 tw:border tw:rounded tw:border-neutral-400 tw:mx-1 tw:print:hidden tw:min-w-[2.5rem] tw:cursor-pointer"
                data-cy="profile-popup-csv-download-button"
                @click="onCSVDownload"
            >
                <FontAwesomeIcon icon="download" />
            </button>
            <slot name="extra-buttons" />
        </GeoadminElevationProfileInformation>
    </div>
</template>

<style>
@import '@/style.css';
</style>
