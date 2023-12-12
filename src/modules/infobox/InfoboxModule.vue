<template>
    <teleport to="#map-footer-middle">
        <div
            v-show="showContainer"
            class="infobox card rounded-0"
            data-cy="infobox"
            @contextmenu.stop
        >
            <div
                class="card-header d-flex justify-content-end"
                data-cy="infobox-header"
                @click="onToggleContent"
            >
                <button
                    v-if="showFloatingToggle"
                    class="btn btn-light btn-sm d-flex align-items-center"
                    data-cy="infobox-toggle-floating"
                    @click.stop="onToggleFloating"
                >
                    <FontAwesomeIcon icon="caret-up" />
                </button>
                <button
                    v-if="showPrintBtn"
                    class="btn btn-light btn-sm d-flex align-items-center"
                    @click.stop="onPrint"
                >
                    <FontAwesomeIcon icon="print" />
                </button>
                <button
                    class="btn btn-light btn-sm d-flex align-items-center"
                    data-cy="infobox-close"
                    @click.stop="onClose"
                >
                    <FontAwesomeIcon icon="times" />
                </button>
            </div>

            <div
                v-show="showContent"
                ref="content"
                class="infobox-content"
                data-cy="infobox-content"
            >
                <FeatureElevationProfile
                    v-if="showElevationProfile && !isCombo"
                    class="card-body"
                    :feature="selectedFeature"
                    :read-only="!showDrawingOverlay"
                    :projection="projection"
                />

                <FeatureCombo
                    v-else-if="isCombo"
                    class="card-body"
                    :feature="selectedFeature"
                    :read-only="!showDrawingOverlay"
                />

                <FeatureEdit
                    v-else-if="isEdit"
                    class="card-body"
                    :feature="selectedFeature"
                    :read-only="!showDrawingOverlay"
                />

                <FeatureList v-else-if="isList" />
            </div>
        </div>
    </teleport>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapActions, mapState } from 'vuex'

import { EditableFeatureTypes } from '@/api/features.api'
import promptUserToPrintHtmlContent from '@/utils/print'

import FeatureCombo from './components/FeatureCombo.vue'
import FeatureEdit from './components/FeatureEdit.vue'
import FeatureElevationProfile from './components/FeatureElevationProfile.vue'
import FeatureList from './components/FeatureList.vue'

export default {
    components: {
        FontAwesomeIcon,
        FeatureCombo,
        FeatureEdit,
        FeatureElevationProfile,
        FeatureList,
    },
    data() {
        return {
            /** Allows infobox to be "minimized". */
            showContent: true,
        }
    },
    computed: {
        ...mapState({
            selectedFeatures: (state) => state.features.selectedFeatures,
            floatingTooltip: (state) => state.ui.floatingTooltip,
            showDrawingOverlay: (state) => state.ui.showDrawingOverlay,
            projection: (state) => state.position.projection,
            importOverlay: (state) => state.ui.importOverlay,
        }),
        selectedFeature() {
            return this.selectedFeatures[0]
        },
        isList() {
            return !this.floatingTooltip && !this.isEdit && this.selectedFeatures.length > 0
        },
        isEdit() {
            return !this.floatingTooltip && this.selectedFeature?.isEditable
        },
        showElevationProfile() {
            return (
                this.selectedFeature &&
                (this.selectedFeature.featureType === EditableFeatureTypes.MEASURE ||
                    (this.selectedFeature.featureType === EditableFeatureTypes.LINEPOLYGON &&
                        this.floatingTooltip))
            )
        },
        isCombo() {
            return (
                this.isEdit &&
                [EditableFeatureTypes.LINEPOLYGON, EditableFeatureTypes.MEASURE].includes(
                    this.selectedFeature.featureType
                )
            )
        },
        showContainer() {
            return (
                this.isList ||
                this.isEdit ||
                this.showElevationProfile ||
                this.isCombo ||
                this.importOverlay
            )
        },
        showFloatingToggle() {
            return (
                this.isList ||
                (this.isEdit && !this.showElevationProfile) ||
                (this.isCombo && !this.floatingTooltip)
            )
        },
        showPrintBtn() {
            return !this.importOverlay
        },
    },
    watch: {
        selectedFeatures(features) {
            if (features.length === 0) {
                return
            }
            this.showContent = true

            this.$nextTick(() => {
                // Reset the container's scroll when the content changes.
                this.$refs.content.scrollTo(0, 0)
            })
        },
    },
    methods: {
        ...mapActions(['clearAllSelectedFeatures', 'toggleFloatingTooltip', 'toggleImportOverlay']),
        onToggleContent() {
            this.showContent = !this.showContent
        },
        onToggleFloating() {
            this.toggleFloatingTooltip()
        },
        onPrint() {
            promptUserToPrintHtmlContent(this.$refs.content)
        },
        onClose() {
            if (this.importOverlay) {
                this.toggleImportOverlay()
            } else {
                this.clearAllSelectedFeatures()
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/variables';

.infobox {
    width: 100%;

    &-header {
        cursor: pointer;
    }
}
</style>
