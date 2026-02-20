<script setup lang="js">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import FeatureListCategory from '@/modules/infobox/components/FeatureListCategory.vue'

const dispatcher = { dispatcher: 'FeatureList.vue' }

const featureListContainer = useTemplateRef('featureListContainer')
const editableFeatureCategory = useTemplateRef('editableFeatureCategory')
const layerFeatureCategories = useTemplateRef('layerFeatureCategories')

const { t } = useI18n()
const store = useStore()
const activeLayers = computed(() => store.state.layers.activeLayers)
const lang = computed(() => store.state.i18n.lang)
const isCurrentlyDrawing = computed(() => store.state.drawing.drawingOverlay.show)
const selectedEditableFeatures = computed(() => store.state.features.selectedEditableFeatures)
const selectedFeaturesByLayerId = computed(() => store.state.features.selectedFeaturesByLayerId)
const lastClick = computed(() => store.state.map.clickInfo)
const isPhoneMode = computed(() => store.getters.isPhoneMode)

// flag telling if more features could be loaded for a given layer ID
const canLoadMore = computed(() => (layerId) => {
    // if the app was loaded with pre-selected features there won't be a clickInfo to latch upon,
    // so we won't be able to load more features where the user has previously selected these features (we don't know where it was)
    return (
        lastClick.value &&
        selectedFeaturesByLayerId.value.find(
            (featuresForLayer) => featuresForLayer.layerId === layerId
        )?.featureCountForMoreData > 0
    )
})

// when the language changes, we have to wait until the active layers are updated
// before dispatching the updateFeatures action,
// else the feature.layer.name will not be up to date
const lastLang = ref(lang.value)
watch(activeLayers, () => {
    if (lang.value !== lastLang.value) {
        lastLang.value = lang.value
        store.dispatch('updateFeatures', dispatcher)
    }
})

function getLayerName(layerId) {
    const layerNameFromFeatures = selectedFeaturesByLayerId.value.find(
        (featuresForLayer) => featuresForLayer.layerId === layerId
    )?.features[0]?.layer?.name
    return (
        layerNameFromFeatures ??
        activeLayers.value
            .filter(
                (layer) =>
                    layer.id === layerId ||
                    // when we add a group of (external) layers for the first time, features will be categorized with the sub layer ID,
                    // once we reload the app, only the group ID will remain. So we need to check if a sub-layer also match this ID,
                    // or feature selection just after adding a group of layer will output nothing
                    layer.layers?.find((subLayer) => subLayer.id === layerId)
            )
            .map(
                (layer) =>
                    layer.layers?.find((subLayer) => subLayer.id === layerId)?.name ?? layer.name
            )
            .reduce((previousValue, currentValue) => previousValue ?? currentValue, null)
    )
}

function loadMoreResultForLayer(layerId) {
    store.dispatch('loadMoreFeaturesForLayer', {
        layer: activeLayers.value.find((layer) => layer.id === layerId),
        coordinate: lastClick.value?.coordinate,
        ...dispatcher,
    })
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
