<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { MAX_WIDTH_SHOW_FLOATING_TOOLTIP } from '@/config'
import InfoboxContent from '@/modules/infobox/components/InfoboxContent.vue'
import { FeatureInfoPositions } from '@/store/modules/ui.store'
import PrintButton from '@/utils/components/PrintButton.vue'
import TextTruncate from '@/utils/components/TextTruncate.vue'
import ZoomToExtentButton from '@/utils/components/ZoomToExtentButton.vue'

const dispatcher = { dispatcher: 'InfoboxModule.vue' }
const showContent = ref(true)

const i18n = useI18n()
const store = useStore()

const selectedFeatures = computed(() => store.getters.selectedFeatures)
const showFeatureInfoInBottomPanel = computed(() => store.getters.showFeatureInfoInBottomPanel)
const showFeatureInfoInTooltip = computed(() => store.getters.showFeatureInfoInTooltip)
const showDrawingOverlay = computed(() => store.state.drawing.drawingOverlay.show)
const width = computed(() => store.state.ui.width)

const profileFeature = computed(() => store.state.features.profileFeature)
const showElevationProfile = computed(() => profileFeature.value !== null)

const showContainer = computed(() => {
    return (
        selectedFeatures.value.length > 0 &&
        (showFeatureInfoInBottomPanel.value ||
            (showElevationProfile.value && showFeatureInfoInTooltip.value))
    )
})
const showTooltipToggle = computed(
    () => showFeatureInfoInBottomPanel.value && width.value >= MAX_WIDTH_SHOW_FLOATING_TOOLTIP
)
const title = computed(() => {
    if (!showDrawingOverlay.value && showElevationProfile.value) {
        return `${i18n.t('profile_title')}: ${profileFeature.value.title}`
    }
    if (
        showDrawingOverlay.value &&
        showElevationProfile.value &&
        !showFeatureInfoInBottomPanel.value
    ) {
        return i18n.t('profile_title')
    }
    if (showDrawingOverlay.value) {
        return i18n.t('draw_modify_description')
    }
    return i18n.t('object_information')
})

watch(selectedFeatures, (features) => {
    if (features.length === 0) {
        return
    }
    showContent.value = true
})

function onToggleContent() {
    showContent.value = !showContent.value
}
function setTooltipInfoPosition() {
    store.dispatch('setFeatureInfoPosition', {
        position: FeatureInfoPositions.TOOLTIP,
        ...dispatcher,
    })
}
function onClose() {
    if (showFeatureInfoInBottomPanel.value) {
        store.dispatch('clearAllSelectedFeatures', dispatcher)
        store.dispatch('clearClick', dispatcher)
    } else if (showElevationProfile.value) {
        // if feature details are shown in the floating tooltip we don't want to close the detail
        // when clicking on the X button, but only close the profile
        onHideProfile()
    }
}
function onHideProfile() {
    store.dispatch('setProfileFeature', { feature: null, ...dispatcher })
}
</script>

<template>
    <div
        v-if="showContainer"
        class="infobox card rounded-0 clear-no-ios-long-press"
        data-cy="infobox"
        @contextmenu.stop
    >
        <div
            class="infobox-header card-header d-flex justify-content-end m-0"
            data-cy="infobox-header"
        >
            <button
                v-if="!showDrawingOverlay && showElevationProfile && showFeatureInfoInBottomPanel"
                class="btn btn-light btn-xs align-middle text-nowrap justify-content-left"
                @click.stop="onHideProfile"
            >
                <FontAwesomeIcon icon="chevron-left" class="me-1" />
                {{ i18n.t('hide_profile') }}
            </button>
            <div class="header-title d-flex flex-grow-1 justify-content-center mt-1">
                <TextTruncate>{{ title }}</TextTruncate>
            </div>
            <ZoomToExtentButton
                v-if="showElevationProfile && profileFeature.extent"
                :extent="profileFeature.extent"
                class="zoom-to-extent-button btn-light"
            />
            <PrintButton>
                <div class="header-title d-flex flex-grow-1 justify-content-center mt-1">
                    <TextTruncate>{{ title }}</TextTruncate>
                </div>
                <InfoboxContent />
            </PrintButton>
            <button
                v-if="showTooltipToggle"
                class="btn btn-light btn-sm d-flex align-items-center"
                data-cy="infobox-toggle-floating"
                @click.stop="setTooltipInfoPosition"
            >
                <FontAwesomeIcon icon="angles-up" />
            </button>
            <button
                class="btn btn-light btn-sm d-flex align-items-center"
                data-cy="infobox-minimize-maximize"
                @click="onToggleContent"
            >
                <FontAwesomeIcon v-if="showContent" icon="window-minimize" />
                <FontAwesomeIcon v-else icon="window-maximize" />
            </button>
            <button
                class="btn btn-light btn-sm d-flex align-items-center"
                data-cy="infobox-close"
                @click.stop="onClose"
            >
                <FontAwesomeIcon icon="times" />
            </button>
        </div>

        <!-- if we add d-flex directly in classes, Bootstap's !important overwrites Vue's display none and it is always visible -->
        <InfoboxContent v-show="showContent" />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/variables.module';
@import '@/scss/media-query.mixin';

.infobox {
    width: 100%;
    &-content {
        max-width: 100%;
    }
    .drawing-feature {
        max-width: 100%;
        &-edit {
            min-width: $overlay-width;
        }
    }

    .header-title {
        overflow: hidden;
    }

    .zoom-to-extent-button {
        min-width: 2rem;
    }
}
</style>
