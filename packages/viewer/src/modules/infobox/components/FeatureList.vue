<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import FeatureListCategory from '@/modules/infobox/components/FeatureListCategory.vue'

import useLayersStore from '@/store/modules/layers.store'
import { useI18nStore } from '@/store/modules/i18n.store'
import useDrawingStore from '@/store/modules/drawing.store'
import useFeaturesStore, { type FeaturesForLayer } from '@/store/modules/features.store'
import useMapStore from '@/store/modules/map.store'
import useUiStore from '@/store/modules/ui.store'
import type { GeoAdminGroupOfLayers, GeoAdminLayer, Layer } from '@swissgeo/layers'
import log from '@swissgeo/log'

const dispatcher = { name: 'FeatureList.vue' }

// Template refs
const featureListContainer = useTemplateRef<HTMLDivElement>('featureListContainer')
const editableFeatureCategory =
    useTemplateRef<InstanceType<typeof FeatureListCategory>>('editableFeatureCategory')
// multiple refs from v-for
const layerFeatureCategories =
    useTemplateRef<Array<InstanceType<typeof FeatureListCategory>>>('layerFeatureCategories')

const { t } = useI18n()

// Stores
const layersStore = useLayersStore()
const i18nStore = useI18nStore()
const drawingStore = useDrawingStore()
const featuresStore = useFeaturesStore()
const mapStore = useMapStore()
const uiStore = useUiStore()

// Refs from stores
const { activeLayers } = storeToRefs(layersStore)
const { lang } = storeToRefs(i18nStore)
const { drawingOverlay } = storeToRefs(drawingStore)
const { selectedEditableFeatures, selectedFeaturesByLayerId } = storeToRefs(featuresStore)
const { clickInfo } = storeToRefs(mapStore)
const { isPhoneMode } = storeToRefs(uiStore)

const isCurrentlyDrawing = computed<boolean>(() => Boolean(drawingOverlay.value?.show))

// flag telling if more features could be loaded for a given layer ID
const canLoadMore = computed<(_layerId: string) => boolean>(() => (layerId: string) => {
    // if the app was loaded with pre-selected features there won't be a clickInfo to latch upon,
    // so we won't be able to load more features where the user has previously selected these features (we don't know where it was)
    return (
        !!clickInfo.value &&
        (selectedFeaturesByLayerId.value.find(
            (featuresForLayer: FeaturesForLayer) => featuresForLayer.layerId === layerId
        )?.featureCountForMoreData ?? 0) > 0
    )
})

// when the language changes, we have to wait until the active layers are updated
// before dispatching the updateFeatures action,
// else the feature.layer.name will not be up to date
const lastLang = ref<string>(lang.value)
watch(activeLayers, () => {
    if (lang.value !== lastLang.value) {
        lastLang.value = lang.value
        featuresStore.updateFeatures(dispatcher).catch((e: unknown) => {
            log.error('Error while updating features after language change', e as string)
        })
    }
})

function getLayerName(layerId: string): string {
    const layerNameFromFeatures = selectedFeaturesByLayerId.value.find(
        (featuresForLayer: FeaturesForLayer) => featuresForLayer.layerId === layerId
    )?.features?.[0]?.layer?.name

    if (layerNameFromFeatures) {
        return layerNameFromFeatures
    }
    // fallback on active layers
    return activeLayers.value
        .filter(
            (layer: Layer | GeoAdminGroupOfLayers) =>
                layer.id === layerId ||
                // when we add a group of (external) layers for the first time, features will be categorized with the sub layer ID,
                // once we reload the app, only the group ID will remain. So we need to check if a sub-layer also match this ID,
                // or feature selection just after adding a group of layer will output nothing
                (layer as GeoAdminGroupOfLayers).layers?.find((subLayer) => subLayer.id === layerId)
        )
        .map(
            (layer: Layer | GeoAdminGroupOfLayers) =>
                (layer as GeoAdminGroupOfLayers).layers?.find((subLayer) => subLayer.id === layerId)
                    ?.name ?? layer.name
        )
        .reduce<string>((previousValue, currentValue) => previousValue ?? currentValue, '')
}

function loadMoreResultForLayer(layerId: string): void {
    const layer = activeLayers.value.find((l: Layer) => l.id === layerId)
    featuresStore.loadMoreFeaturesForLayer(
        {
            layer: layer as GeoAdminLayer,
            coordinate: clickInfo.value!.coordinate,
        },
        dispatcher
    )
}
</script>

<template>
    <div
        ref="featureListContainer"
        class="clear-no-ios-long-press feature-list"
        :class="[isPhoneMode ? 'mobile' : 'desktop']"
        data-cy="highlighted-features"
    >
        <div
            class="feature-list-inner"
            data-cy="feature-list-inner"
        >
            <!-- Only showing drawing features when outside the drawing module/mode -->
            <FeatureListCategory
                v-if="!isCurrentlyDrawing && selectedEditableFeatures.length > 0"
                ref="editableFeatureCategory"
                class="feature-list-item"
                :name="t('draw_layer_label')"
                :children="selectedEditableFeatures"
                :can-load-more="false"
            />
            <FeatureListCategory
                v-for="featuresForLayer in selectedFeaturesByLayerId"
                :key="featuresForLayer.layerId"
                ref="layerFeatureCategories"
                class="feature-list-item"
                :name="getLayerName(featuresForLayer.layerId)"
                :children="featuresForLayer.features"
                :can-load-more="canLoadMore(featuresForLayer.layerId)"
                @load-more-results="loadMoreResultForLayer(featuresForLayer.layerId)"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/variables.module';

.feature-list {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &.mobile {
        max-height: 33vh;
    }

    &.desktop {
        max-height: 100%;
    }

    &-inner {
        overflow-y: auto;
        overflow-x: hidden;
        flex-grow: 1;
        min-height: 0;
    }
}
</style>
