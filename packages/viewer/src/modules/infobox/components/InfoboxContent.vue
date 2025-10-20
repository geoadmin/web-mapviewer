<script setup lang="ts">
import GeoadminElevationProfile, {
    GeoadminElevationProfileCesiumBridge,
    GeoadminElevationProfileOpenLayersBridge,
} from '@swissgeo/elevation-profile'
import { computed, inject, nextTick, onUnmounted, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { ENVIRONMENT } from '@/config/staging.config'
import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import FeatureStyleEdit from '@/modules/infobox/components/styling/FeatureStyleEdit.vue'
import { generateFilename } from '@/utils/utils'

import useFeaturesStore from '@/store/modules/features.store'
import useDrawingStore from '@/store/modules/drawing.store'
import usePositionStore from '@/store/modules/position.store'
import useI18nStore from '@/store/modules/i18n.store'
import useCesiumStore from '@/store/modules/cesium.store'
import useProfileStore from '@/store/modules/profile.store'
import useUiStore from '@/store/modules/ui.store'
import type { Viewer } from 'cesium'
import type { Map } from 'ol'
import { MultiPolygon, type MultiLineString } from 'ol/geom'
import log from '@swissgeo/log'
import type { EditableFeature } from '@/api/features.api'

const dispatcher = { name: 'InfoboxContent.vue' }

const content = useTemplateRef<HTMLDivElement>('content')

const { t } = useI18n()

const olMap: Map | undefined = inject('olMap')
const getCesiumViewer = inject<() => Viewer | undefined>('getViewer', () => undefined, true)

// Stores
const featuresStore = useFeaturesStore()
const drawingStore = useDrawingStore()
const positionStore = usePositionStore()
const i18nStore = useI18nStore()
const cesiumStore = useCesiumStore()
const profileStore = useProfileStore()
const uiStore = useUiStore()

// Refs from stores
const { selectedFeatures } = storeToRefs(featuresStore)
const { drawingOverlay } = storeToRefs(drawingStore)
const { projection } = storeToRefs(positionStore)
const { lang: currentLang } = storeToRefs(i18nStore)
const { active: is3dActive } = storeToRefs(cesiumStore)
const { feature, currentFeatureGeometryIndex, currentProfileCoordinates } =
    storeToRefs(profileStore)
const { showFeatureInfoInBottomPanel } = storeToRefs(uiStore)

const selectedFeature = computed(() => selectedFeatures.value?.[0])
const isSelectedFeatureEditable = computed(() => Boolean(selectedFeature.value?.isEditable))
const showDrawingOverlay = computed(() => Boolean(drawingOverlay.value?.show))
const isEditingDrawingFeature = computed(
    () => showDrawingOverlay.value && isSelectedFeatureEditable.value
)

const isMultiFeature = computed(() => {
    const t = profileStore.feature?.geometry?.type
    return t === 'MultiLineString' || t === 'MultiPolygon'
})
// Type guard to check if coordinates is an array of arrays (MultiLineString/MultiPolygon)
function isArrayOfArrays(coords: unknown): coords is number[][] | number[][][] {
    return Array.isArray(coords) && coords.length > 0 && Array.isArray(coords[0])
}
const currentGeometryElements = computed(() => {
    const coords = (
        feature?.value?.geometry as unknown as MultiLineString | MultiPolygon
    ).getCoordinates()
    return isArrayOfArrays(coords) ? coords : []
})

const showElevationProfile = computed(() => !!profileStore.feature)

watch(selectedFeatures, (features) => {
    if (!features || features.length === 0) {
        return
    }
    nextTick(() => content.value?.scrollTo(0, 0)).catch((e: unknown) => {
        log.error('Error while scrolling to top of infobox content', e as string)
    })
})

function setCurrentSegmentIndex(index: number): void {
    if (index === currentFeatureGeometryIndex.value) {
        return
    }
    profileStore.setCurrentFeatureSegmentIndex(index, dispatcher)
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
        <div class="d-flex justify-content-stretch flex-column flex-md-row h-100 overflow-y-auto">
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
                                'btn-secondary': index === currentFeatureGeometryIndex,
                                'btn-light': index !== currentFeatureGeometryIndex,
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
                        :cesium-instance="getCesiumViewer()!"
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
                :feature="selectedFeature as EditableFeature"
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
