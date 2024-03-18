<script setup>
/**
 * Component that maps the active layers from the state to the menu (and also forwards user
 * interactions to the state)
 */
import Sortable from 'sortablejs'
import { computed, onBeforeUnmount, onMounted, ref, toRefs } from 'vue'
import { useStore } from 'vuex'

import MenuActiveLayersListItem from '@/modules/menu/components/activeLayers/MenuActiveLayersListItem.vue'
import LayerLegendPopup from '@/modules/menu/components/LayerLegendPopup.vue'

const dispatcher = { dispatcher: 'MenuActiveLayersList.vue' }

const props = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})
const { compact } = toRefs(props)

const activeLayersList = ref(null)
// used to deactivate the hover change of color on layer whenever one of them is dragged
const aLayerIsDragged = ref(false)
const showLayerLegendForLayer = ref(null)
const showLayerDetailIndex = ref(null)

const store = useStore()
// Users are used to have layers ordered top to bottom (the first layer is on top), but we store them in the opposite order.
// So here we swap the order of this array to match the desired order on the UI
const activeLayers = computed(() => store.state.layers.activeLayers.slice().reverse())
const reverseIndex = (index) => store.state.layers.activeLayers.length - 1 - index

let sortable
onMounted(() => {
    sortable = Sortable.create(activeLayersList.value, {
        delay: 250,
        delayOnTouchOnly: true,
        touchStartThreshold: 3,
        animation: 150,
        direction: 'vertical',
        handle: '.menu-layer-item-title',
        onStart: function () {
            aLayerIsDragged.value = true
        },
        onEnd: function (event) {
            aLayerIsDragged.value = false
            const { newIndex, oldIndex } = event
            onMoveLayer(reverseIndex(oldIndex), reverseIndex(newIndex))
        },
    })
})

onBeforeUnmount(() => {
    sortable?.destroy()
})

function onMoveLayer(oldIndex, newIndex) {
    if (newIndex !== oldIndex) {
        if (showLayerDetailIndex.value === oldIndex) {
            showLayerDetailIndex.value = newIndex
        }
        store.dispatch('moveActiveLayerToIndex', { index: oldIndex, newIndex, ...dispatcher })
    }
}

function onToggleLayerDetail(index) {
    if (showLayerDetailIndex.value === index) {
        showLayerDetailIndex.value = null
    } else {
        showLayerDetailIndex.value = index
    }
}
</script>

<template>
    <div>
        <div
            v-show="activeLayers.length > 0"
            ref="activeLayersList"
            data-cy="menu-section-active-layers"
            class="menu-layer-list"
        >
            <MenuActiveLayersListItem
                v-for="(layer, index) in activeLayers"
                :key="`${reverseIndex(index)}-${layer.id}`"
                :index="reverseIndex(index)"
                :layer="layer"
                :is-top-layer="index === 0"
                :is-bottom-layer="reverseIndex(index) === 0"
                :compact="compact"
                :data-layer-id="layer.id"
                :class="{ 'drag-in-progress': aLayerIsDragged }"
                :show-layer-detail="showLayerDetailIndex === reverseIndex(index)"
                @show-layer-legend-popup="showLayerLegendForLayer = layer"
                @toggle-layer-detail="onToggleLayerDetail"
                @move-layer="onMoveLayer"
            />
            <LayerLegendPopup
                v-if="showLayerLegendForLayer"
                :layer="showLayerLegendForLayer"
                @close="showLayerLegendForLayer = null"
            />
        </div>
        <div v-show="activeLayers.length === 0" class="p-1 ps-3" data-cy="menu-section-no-layers">
            -
        </div>
    </div>
</template>
