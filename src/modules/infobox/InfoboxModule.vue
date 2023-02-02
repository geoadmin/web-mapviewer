<template>
    <teleport v-if="readyForTeleport" to="#map-footer-middle">
        <div
            v-show="showContainer"
            class="infobox card rounded-0"
            data-cy="infobox"
            @contextmenu.stop
        >
            <div
                class="infobox-header card-header"
                data-cy="infobox-header"
                @click="onToggleContent"
            >
                <ButtonWithIcon
                    v-if="showFloatingToggle"
                    :button-font-awesome-icon="['fa', 'caret-up']"
                    small
                    data-cy="infobox-toggle-floating"
                    @click.stop="onToggleFloating"
                />
                <ButtonWithIcon
                    :button-font-awesome-icon="['fa', 'print']"
                    small
                    @click.stop="onPrint"
                />
                <ButtonWithIcon
                    :button-font-awesome-icon="['fa', 'times']"
                    small
                    data-cy="infobox-close"
                    @click.stop="onClose"
                />
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

                <FeatureList v-else-if="isList" />
            </div>
        </div>
    </teleport>
</template>

<script>
import { EditableFeatureTypes } from '@/api/features.api'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
import promptUserToPrintHtmlContent from '@/utils/print'
import { mapActions, mapState } from 'vuex'
import FeatureCombo from './components/FeatureCombo.vue'
import FeatureEdit from './components/FeatureEdit.vue'
import FeatureElevationProfile from './components/FeatureElevationProfile.vue'
import FeatureList from './components/FeatureList.vue'
export default {
    components: {
        ButtonWithIcon,
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
            return this.isList || this.isEdit || this.showElevationProfile || this.isCombo
        },
        showFloatingToggle() {
            return (
                this.isList ||
                (this.isEdit && !this.showElevationProfile) ||
                (this.isCombo && !this.floatingTooltip)
            )
        },
    },
    watch: {
        showContainer(visible) {
            if (visible) {
                this.$nextTick(this.setMaxHeight)
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
            this.setMaxHeight()
        })
    },
    methods: {
        ...mapActions(['clearAllSelectedFeatures', 'toggleFloatingTooltip']),

        onToggleContent() {
            this.showContent = !this.showContent

            if (this.showContent) {
                this.$nextTick(this.setMaxHeight)
            }
        },
        onToggleFloating() {
            this.toggleFloatingTooltip()
        },
        onPrint() {
            promptUserToPrintHtmlContent(this.$refs.content)
        },
        onClose() {
            this.clearAllSelectedFeatures()
        },

        setMaxHeight() {
            if (!this.showContainer) {
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
        display: flex;
        justify-content: flex-end;
        align-items: center;
        cursor: pointer;
    }

    &-content {
        // The real max-height will be set dynamically. (setMaxHeight)
        max-height: 0;
        overflow-y: auto;
    }
}
</style>
