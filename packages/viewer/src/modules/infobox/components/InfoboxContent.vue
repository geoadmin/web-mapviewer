<script setup>
import GeoadminElevationProfile, {
    GeoadminElevationProfileCesiumBridge,
    GeoadminElevationProfileOpenLayersBridge,
} from '@swissgeo/elevation-profile'
import { computed, inject, nextTick, onUnmounted, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { ENVIRONMENT } from '@/config/staging.config'
import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import FeatureStyleEdit from '@/modules/infobox/components/styling/FeatureStyleEdit.vue'
import { generateFilename } from '@/utils/utils'

const dispatcher = { dispatcher: 'InfoboxContent.vue' }

const content = useTemplateRef('content')

const store = useStore()
const { t } = useI18n()

const olMap = inject('olMap')
const getCesiumViewer = inject('getViewer', () => undefined, true)

const selectedFeatures = computed(() => store.getters.selectedFeatures)
const showFeatureInfoInBottomPanel = computed(() => store.getters.showFeatureInfoInBottomPanel)
const showDrawingOverlay = computed(() => store.state.drawing.drawingOverlay.show)
const projection = computed(() => store.state.position.projection)
const currentLang = computed(() => store.state.i18n.lang)
const is3dActive = computed(() => store.state.cesium.active)

const selectedFeature = computed(() => selectedFeatures.value[0])

const isSelectedFeatureEditable = computed(() => selectedFeature.value?.isEditable)
const isEditingDrawingFeature = computed(
    () => showDrawingOverlay.value && isSelectedFeatureEditable.value
)

const profileFeature = computed(() => store.state.profile.feature)
const isMultiFeature = computed(() => store.getters.isProfileFeatureMultiFeature)

/** Used to track MultiLineString or MultiPolygon element to give to the profile component */
const currentFeatureSegmentIndex = computed(() => store.state.profile.currentFeatureSegmentIndex)
const currentGeometryElements = computed(() => profileFeature.value?.geometry.coordinates)

const currentProfileCoordinates = computed(() => store.getters.currentProfileCoordinates)
const showElevationProfile = computed(() => !!profileFeature.value)

watch(selectedFeatures, (features) => {
    if (features.length === 0) {
        return
    }
    nextTick(() => {
        content.value?.scrollTo(0, 0)
    })
})

function setCurrentSegmentIndex(index) {
    if (index === currentFeatureSegmentIndex.value) {
        return
    }
    store.dispatch('setCurrentFeatureSegmentIndex', {
        index,
        ...dispatcher,
    })
}

onUnmounted(() => {
    setCurrentSegmentIndex(0)
})
</script>

<template>
    <div
        ref="content"
        class="infobox-content d-flex flex-column"
        data-cy="infobox-content"
    >
        <div class="d-flex h-100 justify-content-stretch flex-column flex-md-row overflow-y-auto">
            <div
                v-if="showElevationProfile"
                key="profile-detail"
                class="d-flex flex-column align-content-stretch infobox-content"
            >
                <div
                    v-if="isMultiFeature && currentGeometryElements.length > 1"
                    class="d-flex ps-1 pt-1"
                >
                    <div class="d-flex mw-100 gap-1 overflow-x-auto">
                        <button
                            v-for="(_, index) in currentGeometryElements"
                            :key="index"
                            class="btn btn-sm text-nowrap"
                            :class="{
                                'btn-secondary': index === currentFeatureSegmentIndex,
                                'btn-light': index !== currentFeatureSegmentIndex,
                            }"
                            :data-cy="`profile-segment-button-${index}`"
                            @click="setCurrentSegmentIndex(index)"
                        >
                            {{ t('profile_segment', { segmentNumber: index + 1 }) }}
                        </button>
                    </div>
                </div>
                <GeoadminElevationProfile
                    :points="currentProfileCoordinates"
                    :projection="projection.epsg"
                    :locale="currentLang"
                    :staging="ENVIRONMENT"
                    :filename="generateFilename('.csv')"
                >
                    <GeoadminElevationProfileCesiumBridge
                        v-if="is3dActive && getCesiumViewer()"
                        :cesium-instance="getCesiumViewer()"
                    />
                    <GeoadminElevationProfileOpenLayersBridge
                        v-else-if="olMap"
                        :ol-instance="olMap"
                    />
                </GeoadminElevationProfile>
            </div>
            <FeatureStyleEdit
                v-if="isEditingDrawingFeature && showFeatureInfoInBottomPanel"
                v-show="!showElevationProfile"
                :feature="selectedFeature"
                class="drawing-feature-edit p-3"
                :class="{ 'flex-grow-1': !showElevationProfile }"
            />
            <FeatureList
                v-if="showFeatureInfoInBottomPanel"
                v-show="!showElevationProfile"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';

.infobox-content {
    max-height: 50vh;
    max-width: 100%;
    overflow-x: hidden;
}
@include respond-above(phone) {
    .infobox-content {
        max-height: 33vh;
    }
}
@include respond-above(tablet) {
    .infobox-content {
        max-height: 25vh;
    }
}
</style>
