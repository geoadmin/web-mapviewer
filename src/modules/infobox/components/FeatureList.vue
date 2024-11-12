<script setup>
import { computed, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import FeatureListCategory from '@/modules/infobox/components/FeatureListCategory.vue'

const dispatcher = { dispatcher: 'FeatureList.vue' }

const props = defineProps({
    /**
     * Tells if the height should be fixed (non-fluid) or if it should take 100% of available space
     * (if fluid). Default is false, which is the way it will be displayed in the InfoboxModule.
     * MapPopup might want to set fluid to true, it might otherwise display two scroll bars in some
     * cases (one for the modal, one for the feature list)
     */
    fluid: {
        type: Boolean,
        default: false,
    },
})

const { fluid } = toRefs(props)

const featureListContainer = ref(null)
const editableFeatureCategory = ref(null)
const layerFeatureCategories = ref([])

const i18n = useI18n()
const store = useStore()
const activeLayers = computed(() => store.state.layers.activeLayers)
const lang = computed(() => store.state.i18n.lang)
const isCurrentlyDrawing = computed(() => store.state.drawing.drawingOverlay.show)
const selectedEditableFeatures = computed(() => store.state.features.selectedEditableFeatures)
const selectedFeaturesByLayerId = computed(() => store.state.features.selectedFeaturesByLayerId)
const lastClick = computed(() => store.state.map.clickInfo)

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

watch(lang, () => {
    store.dispatch('updateFeatures', dispatcher)
})

function getLayerName(layerId) {
    return activeLayers.value
        .filter(
            (layer) =>
                layer.id === layerId ||
                // when we add a group of (external) layers for the first time, features will be categorized with the sub layer ID,
                // once we reload the app, only the group ID will remain. So we need to check if a sub-layer also match this ID,
                // or feature selection just after adding a group of layer will output nothing
                (layer.layers && layer.layers.find((subLayer) => subLayer.id === layerId))
        )
        .map(
            (layer) => layer.layers?.find((subLayer) => subLayer.id === layerId)?.name ?? layer.name
        )
        .reduce((previousValue, currentValue) => previousValue ?? currentValue, null)
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
        class="feature-list clear-no-ios-long-press"
        :class="{ fluid }"
        data-cy="highlighted-features"
    >
        <!-- Only showing drawing features when outside the drawing module/mode -->
        <FeatureListCategory
            v-if="!isCurrentlyDrawing && selectedEditableFeatures.length > 0"
            ref="editableFeatureCategory"
            class="feature-list-item"
            :name="i18n.t('draw_layer_label')"
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
</template>

<style lang="scss" scoped>
@import '@/scss/variables.module';
.feature-list {
    &.fluid {
        max-height: 100%;
        overflow: hidden;
    }
    &:not(.fluid) {
        max-height: 33vh;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax($overlay-width, 1fr));
        justify-content: stretch;
        align-content: stretch;
    }
}
</style>
