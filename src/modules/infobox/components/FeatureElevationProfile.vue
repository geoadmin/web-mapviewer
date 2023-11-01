<template>
    <div
        data-cy="profile-popup-content"
        data-infobox="height-reference"
        class="profile-popup-content p-1 position-relative"
    >
        <LoadingBar v-if="request.pending" />
        <FeatureElevationProfilePlot
            v-if="elevationProfile"
            :elevation-profile="elevationProfile"
            :tracking-point-color="feature.fillColor"
            @update="onElevationProfilePlotUpdate"
        />
        <FeatureElevationProfileInformation :profile="elevationProfile">
            <button
                v-if="elevationProfileHasData"
                class="btn btn-light d-flex align-items-center"
                data-cy="profile-popup-csv-download-button"
                @click="onCSVDownload"
            >
                <FontAwesomeIcon icon="download" />
            </button>
            <button
                v-if="showDeleteButton"
                class="btn btn-light d-flex align-items-center"
                data-cy="profile-popup-delete-button"
                @click="onDelete"
            >
                <FontAwesomeIcon icon="far fa-trash-alt" />
            </button>
        </FeatureElevationProfileInformation>
    </div>
</template>

<script>
import { EditableFeature, EditableFeatureTypes } from '@/api/features.api'
import getProfile from '@/api/profile/profile.api'
import { generateFilename } from '@/modules/drawing/lib/export-utils'
import FeatureElevationProfileInformation from '@/modules/infobox/components/FeatureElevationProfileInformation.vue'
import FeatureElevationProfilePlot from '@/modules/infobox/components/FeatureElevationProfilePlot.vue'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import LoadingBar from '@/utils/LoadingBar.vue'
import log from '@/utils/logging'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import proj4 from 'proj4'
import { mapActions } from 'vuex'

export default {
    components: {
        FontAwesomeIcon,
        LoadingBar,
        FeatureElevationProfilePlot,
        FeatureElevationProfileInformation,
    },
    props: {
        feature: {
            type: EditableFeature,
            required: true,
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
        projection: {
            type: CoordinateSystem,
            required: true,
        },
    },
    emits: ['updateElevationProfilePlot'],
    data() {
        return {
            /** @type {ElevationProfile} */
            elevationProfile: null,
            request: {
                pending: false,
            },
        }
    },
    computed: {
        elevationProfileHasData() {
            return this.elevationProfile?.hasElevationData
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
            return (
                !this.readOnly &&
                this.feature &&
                this.feature.featureType === EditableFeatureTypes.MEASURE
            )
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
            if (this.elevationProfileHasData) {
                const csvData =
                    [
                        ['Distance', 'Altitude', 'Easting', 'Northing', 'Longitude', 'Latitude'],
                        ...this.elevationProfile.points.map((point) => {
                            const [lon, lat] = proj4(
                                this.projection.epsg,
                                WGS84.epsg,
                                point.coordinate
                            )
                            const [easting, northing] = proj4(
                                this.projection.epsg,
                                LV95.epsg,
                                point.coordinate
                            )
                            return [
                                point.dist,
                                point.elevation,
                                LV95.roundCoordinateValue(easting),
                                LV95.roundCoordinateValue(northing),
                                WGS84.roundCoordinateValue(lon),
                                WGS84.roundCoordinateValue(lat),
                            ]
                        }),
                    ]
                        .map((row) => row.join(';'))
                        .join('\n') + '\n' // with an added empty line
                this.triggerDownload(
                    new Blob([csvData], { type: 'text/csv' }),
                    generateFilename('.csv')
                )
            }
        },
        onElevationProfilePlotUpdate() {
            // bubbling up the event so that the infobox module can set its height accordingly
            this.$emit('updateElevationProfilePlot')
        },
        updateElevationProfileData() {
            this.request.pending = true
            getProfile(this.featureGeodesicCoordinates, this.projection)
                .then((profile) => {
                    this.elevationProfile = profile
                })
                .catch((error) => {
                    log.error('Error while fetching profile data', error)
                })
                .finally(() => {
                    this.request.pending = false
                })
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
</style>
