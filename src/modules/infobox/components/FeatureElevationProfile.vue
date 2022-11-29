<template>
    <div
        data-cy="profile-popup-content"
        data-infobox="height-reference"
        class="profile-popup-content"
    >
        <FeatureElevationProfilePlot
            v-if="elevationProfileHasData"
            :feature="feature"
            :elevation-profile="elevationProfile"
            @update="onElevationProfilePlotUpdate"
        />
        <FeatureElevationProfileInformation :profile="elevationProfile">
            <ButtonWithIcon
                v-if="elevationProfileHasData"
                :button-font-awesome-icon="['fas', 'download']"
                data-cy="profile-popup-csv-download-button"
                @click="onCSVDownload"
            />
            <ButtonWithIcon
                v-if="showDeleteButton"
                :button-font-awesome-icon="['far', 'trash-alt']"
                data-cy="profile-popup-delete-button"
                @click="onDelete"
            />
        </FeatureElevationProfileInformation>
    </div>
</template>

<script>
import { EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import { profileCsv, profileJson } from '@/api/profile.api'
import { toLv95 } from '@/modules/drawing/lib/drawingUtils'
import { generateFilename } from '@/modules/drawing/lib/export-utils'
import FeatureElevationProfileInformation from '@/modules/infobox/components/FeatureElevationProfileInformation.vue'
import FeatureElevationProfilePlot from '@/modules/infobox/components/FeatureElevationProfilePlot.vue'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import { CoordinateSystems } from '@/utils/coordinateUtils'
import log from '@/utils/logging'
import { mapActions } from 'vuex'

export default {
    components: { FeatureElevationProfilePlot, FeatureElevationProfileInformation, ButtonWithIcon },
    inject: ['getMap'],
    props: {
        feature: {
            type: EditableFeature,
            required: true,
        },
    },
    emits: ['updateElevationProfilePlot'],
    data() {
        return {
            /** @type {ElevationProfile} */
            elevationProfile: null,
        }
    },
    computed: {
        elevationProfileHasData() {
            return this.elevationProfile && this.elevationProfile.hasData
        },
        featureGeodesicCoordinates() {
            if (this.feature.geodesicCoordinates) {
                return this.feature.geodesicCoordinates
            }
            // fallback to the drawing coordinates
            log.error('No Geodesic Coordinate available, falling back to the regular coordinates')
            return this.feature.coordinates
        },
        /**
         * We only show the delete button if the feature being shown is of type "measure", for
         * "line" type, the UI will show a FeatureEdit portion that also includes a delete button
         * (no duplicate this way)
         *
         * @returns {Boolean} True if the feature being shown is of type "measure"
         */
        showDeleteButton() {
            return this.feature && this.feature.featureType === EditableFeatureTypes.MEASURE
        },
    },
    watch: {
        featureGeodesicCoordinates() {
            this.updateElevationProfileData()
        },
    },
    mounted() {
        this.updateElevationProfileData()
    },
    methods: {
        ...mapActions(['deleteDrawingFeature']),
        onDelete() {
            const id = this.feature.id
            this.deleteDrawingFeature(id)
        },
        onCSVDownload() {
            this.getElevationProfile(profileCsv).then((data) => {
                const dataBlob = new Blob([data], { type: 'text/csv', endings: 'native' })
                this.triggerDownload(dataBlob, generateFilename('.csv'))
            })
        },
        onElevationProfilePlotUpdate() {
            // bubbling up the event so that the infobox module can set its height accordingly
            this.$emit('updateElevationProfilePlot')
        },
        async updateElevationProfileData() {
            this.elevationProfile = await this.getElevationProfile()
        },
        async getElevationProfile(apiFunction = profileJson) {
            const coordinatesLv95 = toLv95(
                this.featureGeodesicCoordinates,
                CoordinateSystems.WEBMERCATOR.epsg
            )
            try {
                return await apiFunction(coordinatesLv95)
            } catch (e) {
                log.error('Error while getting elevation profile: ', e)
                return []
            }
        },
        triggerDownload(blob, fileName) {
            /**
             * A link is needed to be able to set the fileName of the downloaded file, as
             * window.open() does not support that
             */
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = fileName

            link.click()
            URL.revokeObjectURL(link.href)
        },
    },
}
</script>

<style lang="scss" scoped>
.profile-popup-content {
    // size of the profile information container, so that no scroll bar shows up when drawing a profile outside of CH
    min-height: 50px;
}
.profile-circle-current-hover-pos {
    height: 20px;
    width: 20px;
    border-radius: 50%;
}
</style>
