<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { LV95, WGS84 } from '@geoadmin/coordinates'
import proj4 from 'proj4'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import FeatureElevationProfileInformation from '@/modules/infobox/components/FeatureElevationProfileInformation.vue'
import FeatureElevationProfilePlot from '@/modules/infobox/components/FeatureElevationProfilePlot.vue'
import LoadingBar from '@/utils/components/LoadingBar.vue'
import { RED } from '@/utils/featureStyleUtils'
import { generateFilename } from '@/utils/utils'

const dispatcher = { dispatcher: 'FeatureElevationProfile.vue' }

const { animation } = defineProps({ animation: { type: Boolean, default: true } })

const { t } = useI18n()
const store = useStore()
const projection = computed(() => store.state.position.projection)
const profileFeature = computed(() => store.state.features.profileFeature)
const profileData = computed(() => store.state.features.profileData)
const profileRequestError = computed(() => store.state.features.profileRequestError)
const hasData = computed(() => !!profileData.value?.hasElevationData)
const isFeatureEditable = computed(
    () => store.state.drawing.drawingOverlay.show && profileFeature.value.isEditable
)

function onDelete() {
    if (isFeatureEditable.value) {
        store.dispatch('deleteDrawingFeature', {
            featureId: profileFeature.value.id,
            ...dispatcher,
        })
    }
}

function triggerDownload(blob, fileName) {
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
    if (hasData.value) {
        const csvData =
            [
                ['Distance', 'Altitude', 'Easting', 'Northing', 'Longitude', 'Latitude'],
                ...profileData.value.points.map((point) => {
                    const [lon, lat] = proj4(projection.value.epsg, WGS84.epsg, point.coordinate)
                    const [x, y] = proj4(projection.value.epsg, LV95.epsg, point.coordinate)
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
        triggerDownload(new Blob([csvData], { type: 'text/csv' }), generateFilename('.csv'))
    }
}
</script>

<template>
    <div
        data-cy="profile-popup-content"
        class="profile-popup-content p-1 d-flex flex-column"
    >
        <div v-if="!hasData">
            <LoadingBar v-if="!profileRequestError" />
            <span
                v-else
                class="text-danger"
                data-cy="profile-error-message"
            >
                {{ t(profileRequestError.messageKey) }}
            </span>
        </div>
        <FeatureElevationProfilePlot
            v-if="hasData"
            :elevation-profile="profileData"
            :tracking-point-color="RED"
            :animation="animation"
            class="flex-grow-1"
        />
        <FeatureElevationProfileInformation
            v-if="hasData"
            :profile="profileData"
        >
            <button
                class="btn btn-light d-flex align-items-center mx-1 no-print"
                data-cy="profile-popup-csv-download-button"
                @click="onCSVDownload"
            >
                <FontAwesomeIcon icon="download" />
            </button>
            <button
                v-if="isFeatureEditable"
                class="btn btn-light d-flex align-items-center no-print"
                data-cy="profile-popup-delete-button"
                @click="onDelete"
            >
                <FontAwesomeIcon icon="far fa-trash-alt" />
            </button>
        </FeatureElevationProfileInformation>
    </div>
</template>

<style lang="scss" scoped>
.profile-popup-content {
    // size of the profile information container, so that no scroll bar shows up when drawing a profile outside of CH
    min-height: 2rem;
    // so that we break the min-width: auto; applied by default by the flexbox
    // without this, the profile content can overflow the parent
    // see https://gaurav5430.medium.com/css-flex-positioning-gotchas-child-expands-to-more-than-the-width-allowed-by-the-parent-799c37428dd6
    min-width: 0;
}
</style>
