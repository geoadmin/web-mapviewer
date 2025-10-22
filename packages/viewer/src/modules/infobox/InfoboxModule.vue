<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { MAX_WIDTH_SHOW_FLOATING_TOOLTIP } from '@/config/responsive.config'
import InfoboxContent from '@/modules/infobox/components/InfoboxContent.vue'
import { FeatureInfoPositions } from '@/store/modules/ui'
import PrintButton from '@/utils/components/PrintButton.vue'
import TextTruncate from '@/utils/components/TextTruncate.vue'
import ZoomToExtentButton from '@/utils/components/ZoomToExtentButton.vue'

import useFeaturesStore from '@/store/modules/features'
import useDrawingStore from '@/store/modules/drawing'
import useMapStore from '@/store/modules/map'
import useProfileStore from '@/store/modules/profile'
import useUiStore from '@/store/modules/ui'

const dispatcher = { name: 'InfoboxModule.vue' }
const showContent = ref(true)

const { t } = useI18n()

const featuresStore = useFeaturesStore()
const drawingStore = useDrawingStore()
const uiStore = useUiStore()
const profileStore = useProfileStore()
const mapStore = useMapStore()

const { selectedFeatures } = storeToRefs(featuresStore)
const { drawingOverlay } = storeToRefs(drawingStore)
const { showFeatureInfoInBottomPanel, showFeatureInfoInTooltip, width } = storeToRefs(uiStore)
const { feature, currentProfileExtent } = storeToRefs(profileStore)

const showElevationProfile = computed(() => !!feature)

const showContainer = computed(() => {
    return (
        (selectedFeatures.value?.length ?? 0) > 0 &&
        (showFeatureInfoInBottomPanel.value ||
            (showElevationProfile.value && showFeatureInfoInTooltip.value))
    )
})
const showTooltipToggle = computed(
    () => showFeatureInfoInBottomPanel.value && width.value >= MAX_WIDTH_SHOW_FLOATING_TOOLTIP
)
const showDrawingOverlay = computed(() => Boolean(drawingOverlay.value?.show))

const title = computed(() => {
    if (showDrawingOverlay.value) {
        if (showElevationProfile.value && !showFeatureInfoInBottomPanel.value) {
            return t('profile_title')
        }
        return t('draw_modify_description')
    } else if (showElevationProfile.value) {
        return `${t('profile_title')}: ${feature?.value?.title ?? ''}`
    }
    return t('object_information')
})

watch(selectedFeatures, (features) => {
    if (!features || features.length === 0) {
        return
    }
    showContent.value = true
})

function onToggleContent(): void {
    showContent.value = !showContent.value
}
function setTooltipInfoPosition(): void {
    uiStore.setFeatureInfoPosition(FeatureInfoPositions.ToolTip, dispatcher)
}
function onClose(): void {
    if (showFeatureInfoInBottomPanel.value) {
        featuresStore.clearAllSelectedFeatures(dispatcher)
        mapStore.clearClick(dispatcher)
    } else if (showElevationProfile.value) {
        onHideProfile()
    }
}
function onHideProfile(): void {
    profileStore.setProfileFeature(undefined, dispatcher)
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
                class="btn btn-light btn-xs justify-content-left align-middle text-nowrap"
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
                class="d-flex align-content-center justify-content-left ms-1 flex-grow-1 overflow-hidden"
            >
                <label>
                    <TextTruncate>{{ title }}</TextTruncate>
                </label>
            </div>
            <ZoomToExtentButton
                v-if="showElevationProfile && currentProfileExtent"
                :extent="currentProfileExtent"
                class="zoom-to-extent-button btn-light"
            />
            <PrintButton>
                <div class="card rounded">
                    <div
                        class="header-title d-flex justify-content-center border-bottom flex-grow-1 p-2"
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
