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
const isPhoneMode = computed(() => store.getters.isPhoneMode)

// Getting how much "category" of features there is, one per layer with features, and one for all editable features
const amountOfFeatureCategories = computed(() => {
    const isThereEditableFeatures = store.state.features.selectedEditableFeatures.length > 0
    return (
        Object.keys(store.state.features.selectedFeaturesByLayerId).length +
        (isThereEditableFeatures ? 1 : 0)
    )
})
// Selecting the smallest amount of column for the features in the infobox, limiting the horizontal
// growth so that categories can have at least 357px of space (size of the floating tooltip)
const columns = computed(() =>
    Math.min(amountOfFeatureCategories.value, Math.floor(store.state.ui.width / 357))
)

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
        <div class="infobox-header card-header d-flex justify-content-end" data-cy="infobox-header">
            <div
                v-if="!showDrawingOverlay && showElevationProfile"
                class="d-flex justify-content-center flex-grow-1"
            >
                <button class="btn btn-light btn-xs" @click.stop="onHideProfile">
                    <FontAwesomeIcon icon="chevron-left" class="me-1" />{{ i18n.t('hide_profile') }}
                </button>
                <strong
                    class="flex-grow-1 text-center d-flex align-items-center justify-content-center lh-1"
                >
                    {{ i18n.t('profile_title') }} :&nbsp;
                    <span v-if="profileFeature.layer">{{ profileFeature.layer.name }}&nbsp;</span>
                    {{ profileFeature.title }}
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

        <div v-show="showContent" ref="content" class="infobox-content" data-cy="infobox-content">
            <div
                v-if="isEditingDrawingFeature"
                :class="{
                    'feature-profile-split-view': !isPhoneMode && showElevationProfile,
                }"
            >
                <FeatureStyleEdit
                    v-if="showFeatureInfoInBottomPanel"
                    :feature="selectedFeature"
                    class="feature-edit p-2"
                />
                <FeatureElevationProfile v-if="showElevationProfile" class="feature-profile" />
            </div>
            <div v-else>
                <Transition name="slide-fade">
                    <div v-if="showElevationProfile" key="profile-detail">
                        <div class="d-flex">
                            <FeatureDetail
                                v-if="profileFeature"
                                :feature="profileFeature"
                                class="w-25 p-2"
                            />
                            <FeatureElevationProfile
                                v-if="showElevationProfile"
                                class="feature-profile flex-grow-1"
                            />
                        </div>
                    </div>
                </Transition>
                <Transition name="invert-slide-fade">
                    <FeatureList
                        v-if="showFeatureInfoInBottomPanel"
                        v-show="!showElevationProfile"
                        key="feature-list"
                        :columns="columns"
                    />
                </Transition>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/variables';

$infoboxHeaderHeight: 2rem;

.infobox {
    width: 100%;
    &-header {
        height: $infoboxHeaderHeight;
    }
    &-content {
        width: 100%;
        .feature-profile-split-view {
            display: flex;
            .feature-edit {
                min-width: min($overlay-width, 33%);
            }
            .feature-profile {
                flex-grow: 1;
                max-width: max(66%, calc(100vw - $overlay-width));
            }
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
.slide-fade-leave-from,
.invert-slide-fade-enter-to,
.invert-slide-fade-leave-from {
    position: absolute;
    width: 100%;
}

.slide-fade-enter-to,
.slide-fade-leave-from,
.invert-slide-fade-enter-to,
.invert-slide-fade-enter-from {
    top: $infoboxHeaderHeight;
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
