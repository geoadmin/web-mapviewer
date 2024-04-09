<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import FeatureDetail from '@/modules/infobox/components/FeatureDetail.vue'
import FeatureElevationProfile from '@/modules/infobox/components/FeatureElevationProfile.vue'
import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import FeatureStyleEdit from '@/modules/infobox/components/styling/FeatureStyleEdit.vue'
import { FeatureInfoPositions } from '@/store/modules/ui.store'
import promptUserToPrintHtmlContent from '@/utils/print'

const dispatcher = { dispatcher: 'InfoboxModule.vue' }
const showContent = ref(true)
const content = ref(null)

const i18n = useI18n()
const store = useStore()

const selectedFeatures = computed(() => store.getters.selectedFeatures)
const showFeatureInfoInBottomPanel = computed(() => store.getters.showFeatureInfoInBottomPanel)
const showFeatureInfoInTooltip = computed(() => store.getters.showFeatureInfoInTooltip)
const showDrawingOverlay = computed(() => store.state.ui.showDrawingOverlay)

const selectedFeature = computed(() => selectedFeatures.value[0])

const isSelectedFeatureEditable = computed(() => selectedFeature.value?.isEditable)
const isEditingDrawingFeature = computed(
    () => showDrawingOverlay.value && isSelectedFeatureEditable.value
)

const profileFeature = computed(() => store.state.features.profileFeature)
const showElevationProfile = computed(() => profileFeature.value !== null)

const showContainer = computed(() => {
    return (
        selectedFeatures.value.length > 0 &&
        (showFeatureInfoInBottomPanel.value ||
            (showElevationProfile.value && showFeatureInfoInTooltip.value))
    )
})
const showTooltipToggle = computed(() => showFeatureInfoInBottomPanel.value)

watch(selectedFeatures, (features) => {
    if (features.length === 0) {
        return
    }
    showContent.value = true
    nextTick(() => {
        content.value?.scrollTo(0, 0)
    })
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
function onPrint() {
    promptUserToPrintHtmlContent(content.value)
}
function onClose() {
    store.dispatch('clearAllSelectedFeatures', dispatcher)
    store.dispatch('clearClick', dispatcher)
}
function onHideProfile() {
    store.dispatch('setProfileFeature', { feature: null, ...dispatcher })
}
</script>

<template>
    <div v-if="showContainer" class="infobox card rounded-0" data-cy="infobox" @contextmenu.stop>
        <div
            class="infobox-header card-header d-flex justify-content-end m-0"
            data-cy="infobox-header"
        >
            <div
                v-if="!showDrawingOverlay && showElevationProfile"
                class="d-flex justify-content-center align-items-center flex-grow-1"
            >
                <button class="btn btn-light btn-xs align-middle" @click.stop="onHideProfile">
                    <FontAwesomeIcon icon="chevron-left" class="me-1" />
                    {{ i18n.t('hide_profile') }}
                </button>
                <strong class="flex-grow-1 d-flex justify-content-center mt-1 text-nowrap">
                    {{ i18n.t('profile_title') }}
                    <span class="d-none d-md-inline">&nbsp;:&nbsp;{{ profileFeature.title }}</span>
                </strong>
            </div>
            <button
                v-if="showTooltipToggle"
                class="btn btn-light btn-sm d-flex align-items-center"
                data-cy="infobox-toggle-floating"
                @click.stop="setTooltipInfoPosition"
            >
                <FontAwesomeIcon icon="caret-up" />
            </button>
            <button class="btn btn-light btn-sm d-flex align-items-center" @click.stop="onPrint">
                <FontAwesomeIcon icon="print" />
            </button>
            <button
                class="btn btn-light btn-sm d-flex align-items-center"
                data-cy="infobox-minimize-maximize"
                @click="onToggleContent"
            >
                <FontAwesomeIcon v-if="!showContent" icon="window-maximize" />
                <FontAwesomeIcon v-if="showContent" icon="window-minimize" />
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
            class="infobox-content d-flex flex-column"
            data-cy="infobox-content"
        >
            <div
                v-if="isEditingDrawingFeature"
                class="drawing-feature d-flex flex-column"
                :class="{
                    'split-view': showElevationProfile && showFeatureInfoInBottomPanel,
                }"
            >
                <FeatureStyleEdit
                    v-if="showFeatureInfoInBottomPanel"
                    :feature="selectedFeature"
                    class="p-2"
                />
                <FeatureElevationProfile v-if="showElevationProfile" class="flex-grow-1" />
            </div>
            <div v-else class="d-flex flex-column h-100 overflow-y-auto">
                <Transition name="slide-fade">
                    <div
                        v-if="showElevationProfile"
                        key="profile-detail"
                        class="h-100 d-flex flex-column flex-md-row align-content-stretch"
                    >
                        <FeatureDetail
                            v-if="profileFeature"
                            :feature="profileFeature"
                            class="feature-with-profile p-2 d-none d-lg-block"
                        />
                        <FeatureElevationProfile
                            v-if="showElevationProfile"
                            class="flex-grow-1 profile-with-feature"
                        />
                    </div>
                </Transition>
                <Transition name="invert-slide-fade">
                    <FeatureList
                        v-if="showFeatureInfoInBottomPanel"
                        v-show="!showElevationProfile"
                    />
                </Transition>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
@import '@/scss/variables';
@import '@/modules/infobox/scss/infobox';

$infoboxHeaderHeight: 2rem;

.infobox {
    max-width: 100vw;
    &-header {
        max-height: $infoboxHeaderHeight;
    }
    &-content {
        overflow-y: auto;
        height: $infoboxContentMobileHeight;
    }
}

@include respond-above(sm) {
    .infobox {
        &-content {
            height: $infoboxContentTabletHeight;
        }
    }
}

@include respond-above(lg) {
    .infobox {
        // splitting space between the feature and the profile in a 1/3 - 2/3 fashion
        .feature-with-profile {
            min-width: 33%;
            max-width: 33%;
        }
        .profile-with-feature {
            min-width: 67%;
            max-width: 67%;
        }
        &-content {
            height: $infoboxContentDesktopHeight;
        }
    }
}

.slide-fade-enter-active,
.slide-fade-leave-active,
.invert-slide-fade-enter-active,
.invert-slide-fade-leave-active {
    transition: all 0.5s ease-out;
}

.slide-fade-enter-to,
.slide-fade-leave-to,
.invert-slide-fade-enter-to,
.invert-slide-fade-leave-from {
    position: absolute;
    width: 100%;
}

.slide-fade-enter-from,
.slide-fade-leave-to,
.invert-slide-fade-enter-from,
.invert-slide-fade-leave-to {
    opacity: 0;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(100%);
}
.invert-slide-fade-enter-from,
.invert-slide-fade-leave-to {
    transform: translateX(-100%);
}
</style>
