<script setup>
import GeoadminElevationProfile, {
    GeoadminElevationProfileCesiumBridge,
    GeoadminElevationProfileOpenLayersBridge,
} from '@geoadmin/elevation-profile'
import { computed, inject, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import FeatureStyleEdit from '@/modules/infobox/components/styling/FeatureStyleEdit.vue'

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
const selectedFeatureGeometry = computed(() => selectedFeature.value.geometry)
const isMultiFeature = computed(() =>
    ['MultiPolygon', 'MultiLineString'].includes(selectedFeatureGeometry.value.type)
)

/** Used to track MultiLineString or MultiPolygon element to give to the profile component */
const currentGeometryElementIndex = ref(0)
const currentGeometryElements = computed(() => selectedFeature.value.geometry.coordinates)
const currentProfileCoordinates = computed(() => {
    if (isMultiFeature.value) {
        return selectedFeatureGeometry.value.coordinates[currentGeometryElementIndex.value]
    }
    return selectedFeatureGeometry.value.coordinates
})

const isSelectedFeatureEditable = computed(() => selectedFeature.value?.isEditable)
const isEditingDrawingFeature = computed(
    () => showDrawingOverlay.value && isSelectedFeatureEditable.value
)

const profileFeature = computed(() => store.state.features.profileFeature)
const showElevationProfile = computed(() => !!profileFeature.value)

watch(selectedFeatures, (features) => {
    if (features.length === 0) {
        return
    }
    nextTick(() => {
        content.value?.scrollTo(0, 0)
    })
})
</script>

<template>
    <div
        ref="content"
        class="infobox-content d-flex flex-column"
        data-cy="infobox-content"
    >
        <div
            v-if="isEditingDrawingFeature"
            class="drawing-feature d-flex flex-column flex-md-row"
        >
            <FeatureStyleEdit
                v-if="showFeatureInfoInBottomPanel"
                :feature="selectedFeature"
                class="drawing-feature-edit p-3"
                :class="{ 'flex-grow-1': !showElevationProfile }"
            />
            <GeoadminElevationProfile
                v-if="showElevationProfile"
                :points="selectedFeature.geometry.coordinates"
                :projection="projection.epsg"
                :locale="currentLang"
                class="flex-grow-1 position-relative"
            />
        </div>
        <div
            v-else
            class="d-flex flex-column h-100 overflow-y-auto infobox-content"
        >
            <div
                v-if="showElevationProfile"
                key="profile-detail"
                class="h-100 d-flex flex-column align-content-stretch infobox-content"
            >
                <div
                    v-if="isMultiFeature && currentGeometryElements.length > 1"
                    class="ps-1 pt-1 btn-group-sm"
                >
                    <button
                        v-for="(_, index) in currentGeometryElements"
                        :key="index"
                        class="btn"
                        :class="{
                            'btn-secondary': index === currentGeometryElementIndex,
                            'btn-light': index !== currentGeometryElementIndex,
                        }"
                        @click="currentGeometryElementIndex = index"
                    >
                        {{ t('profile_segment', { segmentNumber: index + 1 }) }}
                    </button>
                </div>
                <GeoadminElevationProfile
                    :points="currentProfileCoordinates"
                    :projection="projection.epsg"
                    :locale="currentLang"
                    class="flex-grow-1 profile-with-feature"
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
            <FeatureList
                v-if="showFeatureInfoInBottomPanel"
                v-show="!showElevationProfile"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.infobox-content {
    min-height: 200px;
    max-height: 25vh;
}
</style>
