<script setup>
import Masonry from 'masonry-layout'
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import FeatureListCategory from '@/modules/infobox/components/FeatureListCategory.vue'

const props = defineProps({
    columns: {
        type: Number,
        default: 1,
        validator: (value) => value > 0,
    },
})
const { columns } = toRefs(props)

const featureListContainer = ref(null)
const editableFeatureCategory = ref(null)
const layerFeatureCategories = ref([])

const widthDependingOnColumns = computed(() => {
    return {
        width: `${100 / columns.value}%`,
    }
})

const i18n = useI18n()
const store = useStore()
const isCurrentlyDrawing = computed(() => store.state.ui.showDrawingOverlay)
const selectedEditableFeatures = computed(() => store.state.features.selectedEditableFeatures)
const selectedFeaturesByLayerId = computed(() => store.state.features.selectedFeaturesByLayerId)

function getLayerName(layerId) {
    return store.getters.visibleLayers.find((layer) => layer.id === layerId)?.name
}

let masonry
onMounted(() => {
    reloadMasonryLayout()
})
onBeforeUnmount(() => {
    masonry?.destroy()
})

watch(columns, reloadMasonryLayout)
watch(selectedEditableFeatures, reloadMasonryLayout)
watch(selectedFeaturesByLayerId, reloadMasonryLayout)

function reloadMasonryLayout() {
    if (columns.value > 1) {
        if (!masonry) {
            masonry = new Masonry(featureListContainer.value, {
                itemSelector: '.feature-list-item',
                percentPosition: true,
            })
        }
        masonry?.layout()
    } else {
        masonry?.destroy()
    }
}
</script>

<template>
    <div ref="featureListContainer" class="feature-list" data-cy="highlighted-features">
        <!-- Only showing drawing features when outside the drawing module/mode -->
        <FeatureListCategory
            v-if="!isCurrentlyDrawing && selectedEditableFeatures.length > 0"
            ref="editableFeatureCategory"
            class="feature-list-item"
            :name="i18n.t('draw_layer_label')"
            :children="selectedEditableFeatures"
            :style="widthDependingOnColumns"
        />
        <FeatureListCategory
            v-for="(layerFeatures, layerId) in selectedFeaturesByLayerId"
            :key="layerId"
            ref="layerFeatureCategories"
            class="feature-list-item"
            :name="getLayerName(layerId)"
            :children="layerFeatures"
            :style="widthDependingOnColumns"
        />
    </div>
</template>

<style lang="scss" scoped>
.feature-list {
    overflow-y: auto;
    max-height: 33vh;
}
</style>
