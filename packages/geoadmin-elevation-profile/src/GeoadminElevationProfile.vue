<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    allCoordinateSystems,
    type CoordinateSystem,
    LV95,
    type SingleCoordinate,
    WGS84,
} from '@geoadmin/coordinates'
import GeoadminTooltip from '@geoadmin/tooltip'
import proj4 from 'proj4'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { SupportedLocales } from '@/config.ts'
import type { ElevationProfileMetadata } from '@/utils'
import type { VueI18nTranslateFunction } from '@/vue-i18n'

import GeoadminElevationProfileInformation from '@/GeoadminElevationProfileInformation.vue'
import GeoadminElevationProfilePlot from '@/GeoadminElevationProfilePlot.vue'
import getProfile, { type ElevationProfile, ElevationProfileError } from '@/profile.api'

interface ElevationProfileProps {
    title?: string
    points?: SingleCoordinate[]
    projection?: string
}

const {
    title = undefined,
    points = [],
    projection = LV95.epsg,
} = defineProps<ElevationProfileProps>()

type ElevationProfileErrorMessages = {
    profile_network_error: string
    profile_too_many_points_error: string
    profile_could_not_generate: string
}

const { t }: { t: VueI18nTranslateFunction<ElevationProfileErrorMessages> } = useI18n<
    ElevationProfileErrorMessages,
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
        return undefined
    }
    return profileData.value.metadata
})

onMounted(() => {
    loadElevationProfileData()
})

watch(reverse, loadElevationProfileData)
watch(() => points, loadElevationProfileData)

function loadElevationProfileData() {
    profileRequestError.value = undefined
    getProfile(reverse.value ? points.toReversed() : points, coordinateSystem.value)
        .then((profile) => {
            profileData.value = profile
        })
        .catch((err) => {
            profileRequestError.value = err
        })
}

function revertProfileDirection() {
    reverse.value = !reverse.value
}

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
            <GeoadminTooltip tooltip-content="profile_invert">
                <button
                    class="tw:bg-neutral-100 tw:hover:bg-neutral-200 tw:border tw:rounded tw:border-neutral-400 tw:print:hidden tw:min-w-[2.5rem] tw:cursor-pointer"
                    @click="revertProfileDirection"
                >
                    <FontAwesomeIcon icon="shuffle" />
                </button>
            </GeoadminTooltip>
            <GeoadminTooltip tooltip-content="profile_download_csv">
                <button
                    class="tw:bg-neutral-100 tw:hover:bg-neutral-200 tw:border tw:rounded tw:border-neutral-400 tw:print:hidden tw:min-w-[2.5rem] tw:cursor-pointer"
                    data-cy="profile-popup-csv-download-button"
                    @click="onCSVDownload"
                >
                    <FontAwesomeIcon icon="download" />
                </button>
            </GeoadminTooltip>
            <slot name="extra-buttons" />
        </GeoadminElevationProfileInformation>
    </div>
</template>

<style>
@import '@/style.css';
</style>
