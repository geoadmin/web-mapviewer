<script setup lang="ts">
import type { SingleCoordinate } from '@swissgeo/coordinates'
import type { Viewer } from 'cesium'
import type { MultiLineString, MultiPolygon } from 'geojson'
import type { Map } from 'ol'

import GeoadminElevationProfile, {
    GeoadminElevationProfileCesiumBridge,
    GeoadminElevationProfileOpenLayersBridge,
} from '@swissgeo/elevation-profile'
import log from '@swissgeo/log'
import {
    computed,
    inject,
    nextTick,
    onUnmounted,
    shallowRef,
    type ShallowRef,
    useTemplateRef,
    watch,
} from 'vue'
import { useI18n } from 'vue-i18n'

import { ENVIRONMENT } from '@/config/staging.config'
import FeatureList from '@/modules/infobox/components/FeatureList.vue'
import FeatureStyleEdit from '@/modules/infobox/components/styling/FeatureStyleEdit.vue'
import useCesiumStore from '@/store/modules/cesium'
import useDrawingStore from '@/store/modules/drawing'
import useFeaturesStore from '@/store/modules/features'
import useI18nStore from '@/store/modules/i18n'
import usePositionStore from '@/store/modules/position'
import useProfileStore from '@/store/modules/profile'
import useUiStore from '@/store/modules/ui'
import { generateFilename } from '@/utils/utils'

const dispatcher = { name: 'InfoboxContent.vue' }

const content = useTemplateRef<HTMLDivElement>('content')

const { t } = useI18n()

const olMap = inject<Map>('olMap')
const cesiumViewer = inject<ShallowRef<Viewer | undefined>>(
    'viewer',
    () => shallowRef(undefined),
    true
)

// Stores
const featuresStore = useFeaturesStore()
const drawingStore = useDrawingStore()
const positionStore = usePositionStore()
const i18nStore = useI18nStore()
const cesiumStore = useCesiumStore()
const profileStore = useProfileStore()
const uiStore = useUiStore()

const profilePoints = computed<SingleCoordinate[] | undefined>(
    () => profileStore.currentProfileCoordinates
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
    if (!isMultiFeature.value) {
        return []
    }
    const coords = (profileStore.feature?.geometry as unknown as MultiLineString | MultiPolygon)
        .coordinates
    return isArrayOfArrays(coords) ? coords : []
})

const showElevationProfile = computed(() => !!profileStore.feature)

watch(
    () => featuresStore.selectedFeatures,
    (features) => {
        if (!features || features.length === 0) {
            return
        }
        nextTick(() => content.value?.scrollTo(0, 0)).catch((e) => {
            log.error({
                title: 'InfoboxContent.vue',
                messages: ['Error while scrolling to top of infobox content', e],
            })
        })
    }
)

function setCurrentSegmentIndex(index: number): void {
    if (index === profileStore.currentFeatureGeometryIndex) {
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
                                'btn-secondary': index === profileStore.currentFeatureGeometryIndex,
                                'btn-light': index !== profileStore.currentFeatureGeometryIndex,
                            }"
                            :data-cy="`profile-segment-button-${index}`"
                            @click="setCurrentSegmentIndex(index)"
                        >
                            {{ t('profile_segment', { segmentNumber: index + 1 }) }}
                        </button>
                    </div>
                </div>
                <GeoadminElevationProfile
                    :points="profilePoints"
                    :projection="positionStore.projection.epsg"
                    :locale="i18nStore.lang"
                    :staging="ENVIRONMENT"
                    :filename="generateFilename('.csv')"
                >
                    <GeoadminElevationProfileCesiumBridge
                        v-if="cesiumStore.active && cesiumViewer"
                        :cesium-instance="cesiumViewer"
                    />
                    <GeoadminElevationProfileOpenLayersBridge
                        v-else-if="olMap"
                        :ol-instance="olMap"
                    />
                </GeoadminElevationProfile>
            </div>
            <FeatureStyleEdit
                v-if="drawingStore.feature.current && uiStore.showFeatureInfoInBottomPanel"
                v-show="!showElevationProfile"
                :feature="drawingStore.feature.current"
                class="drawing-feature-edit p-3"
                :class="{ 'flex-grow-1': !showElevationProfile }"
            />
            <FeatureList
                v-if="uiStore.showFeatureInfoInBottomPanel"
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
