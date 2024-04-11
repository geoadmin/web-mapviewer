<script setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import FeatureListCategory from '@/modules/infobox/components/FeatureListCategory.vue'

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
const isCurrentlyDrawing = computed(() => store.state.ui.showDrawingOverlay)
const selectedEditableFeatures = computed(() => store.state.features.selectedEditableFeatures)
const selectedFeaturesByLayerId = computed(() => store.state.features.selectedFeaturesByLayerId)

function getLayerName(layerId) {
    return store.state.layers.activeLayers
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
        .reduce((previousValue, currentValue) => previousValue ?? currentValue)
}
</script>

<template>
    <div
        ref="featureListContainer"
        class="feature-list"
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
            v-for="(layerFeatures, layerId) in selectedFeaturesByLayerId"
            :key="layerId"
            ref="layerFeatureCategories"
            class="feature-list-item"
            :name="getLayerName(layerId)"
            :children="layerFeatures"
        />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/variables';
.feature-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax($overlay-width, 1fr));
    justify-content: stretch;
    align-content: stretch;
    &.fluid {
        max-height: 100%;
        overflow: hidden;
    }
    &:not(.fluid) {
        max-height: 33vh;
        overflow-y: auto;
    }
}
</style>
