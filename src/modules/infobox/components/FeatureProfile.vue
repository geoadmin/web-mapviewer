<template>
    <div
        data-cy="profile-popup-content"
        data-infobox="height-reference"
        class="profile-popup-content"
    >
        <FeatureProfilePlot
            v-if="profileHasData"
            :feature="feature"
            :profile-data="profileData"
            @update="onProfilePlotUpdate"
        />
        <FeatureProfileInformation :profile="profileData">
            <ButtonWithIcon
                v-if="profileHasData"
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
        </FeatureProfileInformation>
    </div>
</template>

<script>
import { EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import { profileCsv, profileJson } from '@/api/profile.api'
import { toLv95 } from '@/modules/drawing/lib/drawingUtils'
import { generateFilename } from '@/modules/drawing/lib/export-utils'
import FeatureProfileInformation from '@/modules/infobox/components/FeatureProfileInformation.vue'
import FeatureProfilePlot from '@/modules/infobox/components/FeatureProfilePlot.vue'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import { CoordinateSystems } from '@/utils/coordinateUtils'
import log from '@/utils/logging'
import { mapActions } from 'vuex'

export default {
    components: { FeatureProfilePlot, FeatureProfileInformation, ButtonWithIcon },
    inject: ['getMap'],
    props: {
        feature: {
            type: EditableFeature,
            required: true,
        },
    },
    emits: ['updateProfilePlot'],
    data() {
        return {
            /** @type {GeoAdminProfile} */
            profileData: null,
        }
    },
    computed: {
        profileHasData() {
            return this.profileData && this.profileData.hasData
        },
        featureGeodesicCoordinates() {
            if (this.feature.geodesicCoordinates) {
                return this.feature.geodesicCoordinates
            }
            // fallback to the drawing coordinates
            log.error('No Geodesic Coordinate available, falling back to the regular coordinates')
            return this.feature.coordinates
        },
        showDeleteButton() {
            return this.feature && this.feature.featureType === EditableFeatureTypes.MEASURE
        },
    },
    watch: {
        featureGeodesicCoordinates() {
            this.updateProfileData()
        },
    },
    mounted() {
        this.updateProfileData()
    },
    methods: {
        ...mapActions(['deleteDrawingFeature']),
        onDelete() {
            const id = this.feature.id.replace('drawing_feature_', '')
            this.deleteDrawingFeature(id)
        },
        onCSVDownload() {
            this.getProfile(profileCsv).then((data) => {
                const dataBlob = new Blob([data], { type: 'text/csv', endings: 'native' })
                this.triggerDownload(dataBlob, generateFilename('.csv'))
            })
        },
        onProfilePlotUpdate() {
            // bubbling up the event so that the infobox module can set its height accordingly
            this.$emit('updateProfilePlot')
        },
        async updateProfileData() {
            this.profileData = await this.getProfile()
        },
        async getProfile(apiFunction = profileJson) {
            const coordinatesLv95 = toLv95(
                this.featureGeodesicCoordinates,
                CoordinateSystems.WEBMERCATOR.epsg
            )
            try {
                return await apiFunction(coordinatesLv95)
            } catch (e) {
                log.error('Error while getting profile: ', e)
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
