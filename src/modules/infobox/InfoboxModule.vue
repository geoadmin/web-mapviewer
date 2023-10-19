<template>
    <teleport v-if="readyForTeleport" to="#map-footer-middle">
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
                    v-if="showElevationProfile"
                    class="card-body"
                    :feature="selectedFeature"
                    :read-only="!showDrawingOverlay"
                    :projection="projection"
                    @update-elevation-profile-plot="setMaxHeight"
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

                <ImportContent v-else-if="importOverlay" class="card-body" />

                <FeatureList v-else-if="isList" />
            </div>
        </div>
    </teleport>
</template>

<script>
import { EditableFeatureTypes } from '@/api/features.api'
import promptUserToPrintHtmlContent from '@/utils/print'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapActions, mapState } from 'vuex'
import FeatureCombo from './components/FeatureCombo.vue'
import FeatureEdit from './components/FeatureEdit.vue'
import FeatureElevationProfile from './components/FeatureElevationProfile.vue'
import FeatureList from './components/FeatureList.vue'
import ImportContent from '@/modules/infobox/components/ImportContent.vue'

export default {
    components: {
        ImportContent,
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
            /** Delay teleport until view is rendered. Updated in mounted-hook. */
            readyForTeleport: false,
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
                this.isEdit && this.selectedFeature.featureType === EditableFeatureTypes.LINEPOLYGON
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
        showContainer(visible) {
            if (visible) {
                this.computeHeightNextTick()
            }
        },
        selectedFeatures(features) {
            if (features.length === 0) {
                return
            }
            this.showContent = true

            this.$nextTick(() => {
                // Update maxHeight when the features change while the box is open.
                this.setMaxHeight()
                // Reset the container's scroll when the content changes.
                this.$refs.content.scrollTo(0, 0)
            })
        },
    },
    mounted() {
        // We can enable the teleport after the view has been rendered.
        this.$nextTick(() => {
            this.readyForTeleport = true
            this.computeHeightNextTick()
        })
    },
    methods: {
        ...mapActions(['clearAllSelectedFeatures', 'toggleFloatingTooltip', 'toggleImportOverlay']),
        computeHeightNextTick() {
            this.$nextTick(() => {
                this.setMaxHeight()
            })
        },
        onToggleContent() {
            this.showContent = !this.showContent
            if (this.showContent) {
                this.computeHeightNextTick()
            }
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
        setMaxHeight() {
            if (!this.showContainer || !this.$refs.content) {
                return
            }
            const container = this.$refs.content
            const { paddingTop, paddingBottom } = getComputedStyle(container)
            const verticalPadding = parseInt(paddingTop) + parseInt(paddingBottom)
            const childHeight = Array.from(
                container.querySelectorAll('[data-infobox="height-reference"]')
            )
                .map((child) => parseInt(child.offsetHeight))
                .reduce((max, height) => Math.max(max, height), 0)
            // We set max-height because setting the height would influence the
            // height of the children which in turn breaks this calculation.
            container.style.maxHeight = `min(${verticalPadding + childHeight}px, 35vh)`
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

    &-content {
        // The real max-height will be set dynamically. (setMaxHeight)
        max-height: 0;
        overflow-y: auto;
    }
}
</style>
