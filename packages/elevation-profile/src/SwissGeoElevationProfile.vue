<script setup lang="ts">
import type { ElevationProfile, ElevationProfileMetadata } from '@swissgeo/api'
import type { CoordinateSystem, SingleCoordinate } from '@swissgeo/coordinates'
import type { Staging, SupportedLocales } from '@swissgeo/staging-config'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ElevationProfileError, profileAPI } from '@swissgeo/api'
import { allCoordinateSystems, LV95, WGS84 } from '@swissgeo/coordinates'
import log from '@swissgeo/log'
import SwissGeoTooltip from '@swissgeo/tooltip'
import { lineString, simplify as simplifyGeometry } from '@turf/turf'
import proj4 from 'proj4'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { GEOMETRY_SIMPLIFICATION_TOLERANCE, logConfig } from '@/config'
import SwissGeoElevationProfileInformation from '@/SwissGeoElevationProfileInformation.vue'
import SwissGeoElevationProfilePlot from '@/SwissGeoElevationProfilePlot.vue'

import type { VueI18nTranslateFunction } from '../types/vue-i18n'

const {
    points = [],
    projection = LV95.epsg,
    simplify = false,
    staging = 'production',
    filename = 'export',
} = defineProps<{
    points?: SingleCoordinate[]
    projection?: string
    simplify?: boolean
    staging?: Staging
    filename?: string
}>()

interface ElevationProfileMessages {
    profile_download_csv: string
    profile_invert: string
    profile_network_error: string
    profile_too_many_points_error: string
    profile_could_not_generate: string
    profile_out_of_bounds: string
}

const { t }: { t: VueI18nTranslateFunction<ElevationProfileMessages> } = useI18n<
    ElevationProfileMessages,
    SupportedLocales
>()

const coordinateSystem = computed<CoordinateSystem>(
    () => allCoordinateSystems.find((cs) => cs.epsg === projection) ?? LV95
)
const profileData = ref<ElevationProfile>()
const profileRequestError = ref<ElevationProfileError>()
const reverse = ref<boolean>(false)
const hasData = computed<boolean>(() => !!profileData.value?.metadata?.hasElevationData)

const profileMetadata = computed<ElevationProfileMetadata | undefined>(() => {
    if (!profileData.value) {
        return
    }
    return profileData.value.metadata
})

onMounted(() => {
    loadElevationProfileData()
})

watch(reverse, loadElevationProfileData)
watch(() => simplify, loadElevationProfileData)
watch(() => points, loadElevationProfileData, { deep: true })

function loadElevationProfileData() {
    if (!Array.isArray(points)) {
        profileRequestError.value = new ElevationProfileError(
            'profile_could_not_generate',
            new Error('Missing points, could not generate a profile')
        )
        return
    }
    let pointsForProfile = [...points]
    profileRequestError.value = undefined
    if (simplify) {
        pointsForProfile = simplifyGeometry(lineString(pointsForProfile), {
            tolerance: GEOMETRY_SIMPLIFICATION_TOLERANCE,
        }).geometry.coordinates as SingleCoordinate[]
    }
    if (reverse.value) {
        pointsForProfile = pointsForProfile.toReversed()
    }
    profileAPI
        .getProfile(pointsForProfile, coordinateSystem.value, staging)
        .then((profile: ElevationProfile) => {
            profileData.value = profile
        })
        .catch((err: ElevationProfileError) => {
            profileRequestError.value = err
            log.error({
                ...logConfig,
                messages: [
                    'Error while loading elevation profile data',
                    err.message,
                    err.technicalError?.message,
                ],
            })
        })
}

function revertProfileDirection() {
    reverse.value = !reverse.value
}

function triggerDownload(blob: Blob) {
    /**
     * A link is needed to be able to set the fileName of the downloaded file, as window.open() does
     * not support that
     */
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    if (!filename.endsWith('.csv')) {
        link.download = `${filename}.csv`
    } else {
        link.download = filename
    }

    link.click()
    URL.revokeObjectURL(link.href)
}

function onCSVDownload() {
    if (!profileData.value || !hasData.value) {
        return
    }
    const csvData =
        [
            ['Distance', 'Altitude', 'Easting', 'Northing', 'Longitude', 'Latitude'],
            ...profileData.value.chunks
                .flatMap((chunk) => chunk.points)
                .map((point) => {
                    const [lon, lat] = proj4(
                        coordinateSystem.value.epsg,
                        WGS84.epsg,
                        point.coordinate
                    )
                    const [x, y] = proj4(coordinateSystem.value.epsg, LV95.epsg, point.coordinate)
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
    triggerDownload(new Blob([csvData], { type: 'text/csv' }))
}
</script>

<template>
    <div
        data-cy="profile-popup-content"
        class="flex h-auto min-h-50 flex-col p-2"
    >
        <div v-if="!hasData && profileRequestError">
            <span
                class="flex items-center gap-1 font-bold"
                data-cy="profile-error-message"
            >
                <FontAwesomeIcon
                    icon="exclamation-triangle"
                    size="2x"
                    class="text-amber-500"
                />
                {{ t(profileRequestError.message) }}
            </span>
        </div>
        <SwissGeoElevationProfilePlot
            v-if="profileData && hasData"
            :profile="profileData"
        >
            <slot />
        </SwissGeoElevationProfilePlot>
        <SwissGeoElevationProfileInformation
            v-if="profileMetadata"
            :metadata="profileMetadata"
        >
            <SwissGeoTooltip :tooltip-content="t('profile_invert')">
                <button
                    class="h-full min-w-10 cursor-pointer rounded border border-neutral-400 bg-neutral-100 hover:bg-neutral-200 print:hidden"
                    @click="revertProfileDirection"
                >
                    <FontAwesomeIcon icon="shuffle" />
                </button>
            </SwissGeoTooltip>
            <SwissGeoTooltip :tooltip-content="t('profile_download_csv')">
                <button
                    class="h-full min-w-10 cursor-pointer rounded border border-neutral-400 bg-neutral-100 hover:bg-neutral-200 print:hidden"
                    data-cy="profile-popup-csv-download-button"
                    @click="onCSVDownload"
                >
                    <FontAwesomeIcon icon="download" />
                </button>
            </SwissGeoTooltip>
            <slot name="extra-buttons" />
        </SwissGeoElevationProfileInformation>
    </div>
</template>
