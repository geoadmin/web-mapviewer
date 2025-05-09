<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { MAX_WIDTH_SHOW_FLOATING_TOOLTIP } from '@/config/responsive.config'
import InfoboxContent from '@/modules/infobox/components/InfoboxContent.vue'
import { FeatureInfoPositions } from '@/store/modules/ui.store'
import PrintButton from '@/utils/components/PrintButton.vue'
import TextTruncate from '@/utils/components/TextTruncate.vue'
import ZoomToExtentButton from '@/utils/components/ZoomToExtentButton.vue'

const dispatcher = { dispatcher: 'InfoboxModule.vue' }
const showContent = ref(true)

const { t } = useI18n()
const store = useStore()

const selectedFeatures = computed(() => store.getters.selectedFeatures)
const showFeatureInfoInBottomPanel = computed(() => store.getters.showFeatureInfoInBottomPanel)
const showFeatureInfoInTooltip = computed(() => store.getters.showFeatureInfoInTooltip)
const showDrawingOverlay = computed(() => store.state.drawing.drawingOverlay.show)
const width = computed(() => store.state.ui.width)

const profileFeature = computed(() => store.state.profile.feature)
const showElevationProfile = computed(() => !!profileFeature.value)
const profileExtent = computed(() => store.getters.currentProfileExtent)

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
    if (showDrawingOverlay.value) {
        if (showElevationProfile.value && !showFeatureInfoInBottomPanel.value) {
            return t('profile_title')
        }
        return t('draw_modify_description')
    } else if (showElevationProfile.value) {
        return `${t('profile_title')}: ${profileFeature.value.title}`
    }
    return t('object_information')
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
                v-if="showElevationProfile && showFeatureInfoInBottomPanel"
                class="btn btn-light btn-xs justify-content-left text-nowrap align-middle"
                data-cy="infobox-hide-profile-button"
                @click.stop="onHideProfile"
            >
                <FontAwesomeIcon
                    icon="chevron-left"
                    class="me-1"
                />
                <span
                    :class="{
                        'd-inline': showDrawingOverlay,
                        'd-none d-md-inline': !showDrawingOverlay,
                    }"
                >
                    {{ t('hide_profile') }}
                </span>
            </button>
            <div
                class="d-flex flex-grow-1 align-content-center justify-content-left ms-1 overflow-hidden"
            >
                <label>
                    <TextTruncate>{{ title }}</TextTruncate>
                </label>
            </div>
            <ZoomToExtentButton
                v-if="showElevationProfile && profileExtent"
                :extent="profileExtent"
                class="zoom-to-extent-button btn-light"
            />
            <PrintButton>
                <div class="card rounded">
                    <div
                        class="header-title d-flex flex-grow-1 justify-content-center border-bottom p-2"
                    >
                        <TextTruncate>{{ title }}</TextTruncate>
                    </div>
                    <InfoboxContent :animation="false" />
                </div>
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
                <FontAwesomeIcon
                    v-if="showContent"
                    icon="window-minimize"
                />
                <FontAwesomeIcon
                    v-else
                    icon="window-maximize"
                />
            </button>
            <button
                class="btn btn-light btn-sm d-flex align-items-center"
                data-cy="infobox-close"
                @click.stop="onClose"
            >
                <FontAwesomeIcon icon="times" />
            </button>
        </div>
        <InfoboxContent v-if="showContent" />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/variables.module';
@import '@/scss/media-query.mixin';

.infobox {
    width: 100%;
    .drawing-feature {
        max-width: 100%;
        &-edit {
            min-width: $overlay-width;
        }
    }

    .zoom-to-extent-button {
        min-width: 2rem;
    }
}
</style>
