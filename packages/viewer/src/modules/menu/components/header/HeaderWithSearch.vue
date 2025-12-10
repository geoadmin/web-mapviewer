<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import AdditionalInfoCollapsable from '@/modules/menu/components/header/AdditionalInfoCollapsable.vue'
import ConfederationFullLogo from '@/modules/menu/components/header/ConfederationFullLogo.vue'
import HeaderLangSelector from '@/modules/menu/components/header/HeaderLangSelector.vue'
import HeaderMenuButton from '@/modules/menu/components/header/HeaderMenuButton.vue'
import FeedbackButton from '@/modules/menu/components/help/feedback/FeedbackButton.vue'
import HelpLink from '@/modules/menu/components/help/HelpLink.vue'
import ReportProblemButton from '@/modules/menu/components/help/ReportProblemButton.vue'
import SearchBar from '@/modules/menu/components/search/SearchBar.vue'
import useCesiumStore from '@/store/modules/cesium'
import useDrawingStore from '@/store/modules/drawing'
import useFeaturesStore from '@/store/modules/features'
import useGeolocationStore from '@/store/modules/geolocation'
import useI18nStore from '@/store/modules/i18n'
import useLayersStore from '@/store/modules/layers'
import useMapStore from '@/store/modules/map'
import usePositionStore from '@/store/modules/position'
import usePrintStore from '@/store/modules/print'
import useProfileStore from '@/store/modules/profile'
import useSearchStore from '@/store/modules/search'
import useShareStore from '@/store/modules/share'
import useTopicsStore from '@/store/modules/topics'
import useUIStore from '@/store/modules/ui'
import { FeatureInfoPositions } from '@/store/modules/ui/types/featureInfoPositions.enum'
import TextTruncate from '@/utils/components/TextTruncate.vue'

const dispatcher = { name: 'HeaderWithSearch.vue' }

const header = useTemplateRef('header')
const isResetting = ref(false)

const { t } = useI18n()
const cesiumStore = useCesiumStore()
const drawingStore = useDrawingStore()
const featuresStore = useFeaturesStore()
const geolocationStore = useGeolocationStore()
const i18nStore = useI18nStore()
const layersStore = useLayersStore()
const mapStore = useMapStore()
const positionStore = usePositionStore()
const printStore = usePrintStore()
const profileStore = useProfileStore()
const searchStore = useSearchStore()
const shareStore = useShareStore()
const topicsStore = useTopicsStore()
const uiStore = useUIStore()

const currentBackground = computed(() => layersStore.currentBackgroundLayerId)
const currentLang = computed(() => i18nStore.lang)
const currentTopic = computed(() => topicsStore.currentTopic)
const currentTopicId = computed(() => topicsStore.current)
const hasDevSiteWarning = computed(() => uiStore.hasDevSiteWarning)
const hasGiveFeedbackButton = computed(() => uiStore.hasGiveFeedbackButton)
const hasReportProblemButton = computed(() => uiStore.hasReportProblemButton)
const isPhoneMode = computed(() => uiStore.isPhoneMode)

onMounted(() => {
    nextTick(() => {
        // Initial height
        updateHeaderHeight()
        // Watch for changes in height
        window.addEventListener('resize', updateHeaderHeight)
    }).catch((_) => {})
})
onBeforeUnmount(() => {
    // Remove the event listener when the component is destroyed
    window.removeEventListener('resize', updateHeaderHeight)
})

function updateHeaderHeight() {
    if (header.value?.clientHeight) {
        uiStore.setHeaderHeight(header.value.clientHeight, dispatcher)
    }
}

function resetApp() {
    // Show loading indicator
    isResetting.value = true

    // Preserve the values we want to keep
    const langToKeep = currentLang.value
    const topicToKeep = currentTopicId.value
    const defaultBackgroundLayerId =
        currentTopic.value?.defaultBackgroundLayer?.id ?? currentBackground.value

    // Clear user-added data through store actions (but NOT layers - we'll reset those via topic change)
    drawingStore.clearDrawingFeatures(dispatcher)
    featuresStore.clearAllSelectedFeatures(dispatcher)
    mapStore.clearClick(dispatcher)
    mapStore.clearPinnedLocation(dispatcher)
    mapStore.clearPreviewPinnedLocation(dispatcher)
    mapStore.clearLocationPopupCoordinates(dispatcher)
    shareStore.clearShortLinks(dispatcher)

    // Reset stores that don't contain critical config or viewport dimensions
    cesiumStore.$reset()
    geolocationStore.$reset()
    positionStore.$reset()
    printStore.$reset()
    profileStore.$reset()
    searchStore.$reset()

    uiStore.setCompareSliderActive(false, dispatcher)
    uiStore.setTimeSliderActive(false, dispatcher)
    uiStore.setFeatureInfoPosition(FeatureInfoPositions.None, dispatcher)

    // Restore preserved values - this will trigger URL sync through store plugins
    // Language is preserved
    if (i18nStore.lang !== langToKeep) {
        i18nStore.setLang(langToKeep, dispatcher)
    }

    // Changing topic will automatically:
    // 1. Load the topic's default layers (layersToActivate)
    // 2. Set the default background layer
    // This effectively resets the layers to the topic's defaults
    if (topicsStore.current !== topicToKeep) {
        topicsStore.changeTopic(topicToKeep, dispatcher)
    } else {
        // If we're already on the target topic, we need to manually reload it with default layers
        topicsStore.loadTopic({ changeLayers: true }, dispatcher)
    }

    // Ensure the correct background layer is set (in case it's different from topic default)
    if (layersStore.currentBackgroundLayerId !== defaultBackgroundLayerId) {
        layersStore.setBackground(defaultBackgroundLayerId, dispatcher)
    }

    // Hide loading indicator after a short delay to ensure stores have updated
    setTimeout(() => {
        isResetting.value = false
    }, 500)
}
</script>

<template>
    <div
        ref="header"
        class="header"
        data-cy="app-header"
    >
        <div class="header-content p-sm-0 p-md-1 d-flex align-items-center w-100">
            <div class="logo-container position-relative">
                <ConfederationFullLogo
                    class="cursor-pointer"
                    :class="{ 'opacity-50': isResetting }"
                    @click="resetApp"
                />
                <div
                    v-if="isResetting"
                    class="reset-spinner position-absolute translate-middle start-50 top-50"
                >
                    <div
                        class="spinner-border spinner-border-sm text-primary"
                        role="status"
                    >
                        <span class="visually-hidden">{{ t('loading') }}</span>
                    </div>
                </div>
            </div>
            <div
                class="search-bar-section d-flex-column me-2 flex-grow-1"
                :class="{ 'align-self-center': !hasDevSiteWarning }"
            >
                <SearchBar />
            </div>
            <HeaderMenuButton
                v-if="isPhoneMode"
                class="mx-1"
            />
        </div>
        <div
            class="header-settings-section"
            data-cy="header-settings-section"
        >
            <FeedbackButton
                v-if="hasGiveFeedbackButton"
                show-as-link
            />
            <ReportProblemButton
                v-if="hasReportProblemButton"
                show-as-link
            />
            <AdditionalInfoCollapsable />
            <HelpLink small />
            <HeaderLangSelector
                id="menu-lang-selector"
                data-cy="menu-lang-selector"
            />
        </div>
        <div
            v-if="hasDevSiteWarning"
            class="header-warning-dev bg-danger fw-bold px-1 text-center text-white"
        >
            <TextTruncate
                text="test_host_warning"
                :max-lines="1"
                class="text-truncate"
            >
                {{ t('test_host_warning') }}
            </TextTruncate>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
@import '@/scss/variables.module';

$animation-time: 0.5s;

.header {
    background: rgba($white, 0.9);
    box-shadow: 6px 6px 12px rgb(0 0 0 / 18%);
    height: $header-height;
    transition: height $animation-time;
    z-index: $zindex-menu-header;
    .header-content {
        height: $header-height;
        transition: height $animation-time;
    }
}
.header-warning-dev {
    height: $dev-disclaimer-height;
}

.logo-container {
    display: inline-block;
}

.reset-spinner {
    pointer-events: none;
}

.search-bar-section {
    // On desktop we limit hte maximum size of the search bar just
    // to have a better look and feel.
    max-width: 800px;
}

.header-settings-section {
    position: absolute;
    top: 0;
    right: 0;
    width: auto;
    display: flex;
}

.search-header-swiss-confederation-text,
.search-title {
    font-size: 0.825rem;
}

@include respond-below(lg) {
    .header-settings-section {
        // See MenuTray.vue where the help section is enable above lg
        display: none !important;
    }
}

@include respond-above(lg) {
    .header {
        height: 2 * $header-height;
        .header-content {
            height: 2 * $header-height;
            .menu-tray {
                top: 2 * $header-height;
            }
        }
    }
    .search-title {
        display: block;
    }
}
</style>
