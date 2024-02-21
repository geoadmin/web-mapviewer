<script setup>
/**
 * Component that maps the active layers from the state to the menu (and also forwards user
 * interactions to the state)
 */
import { computed, ref, toRefs } from 'vue'
import { useStore } from 'vuex'

import MenuActiveLayersListItem from '@/modules/menu/components/activeLayers/MenuActiveLayersListItem.vue'
import LayerLegendPopup from '@/modules/menu/components/LayerLegendPopup.vue'

const STORE_DISPATCHER_MENU_ACTIVE_LAYERS_LIST = 'MenuActiveLayersList.vue'

const props = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})
const { compact } = toRefs(props)

const showLayerLegendForLayer = ref(null)
const showLayerDetailsForId = ref(null)

const store = useStore()

// Users are used to have layers ordered top to bottom (the first layer is on top), but we store them in the opposite order.
// So here we swap the order of this array to match the desired order on the UI
const activeLayers = computed(() => store.state.layers.activeLayers.slice().reverse())

function onToggleLayerDetails(layerId) {
    if (showLayerDetailsForId.value === layerId) {
        showLayerDetailsForId.value = null
    } else {
        showLayerDetailsForId.value = layerId
    }
}
function onRemoveLayer(layerId) {
    store.dispatch('removeLayer', { layerId, dispatcher: STORE_DISPATCHER_MENU_ACTIVE_LAYERS_LIST })
}
function onToggleLayerVisibility(layerId) {
    store.dispatch('toggleLayerVisibility', {
        layerId,
        dispatcher: STORE_DISPATCHER_MENU_ACTIVE_LAYERS_LIST,
    })
}
function onOrderChange(layerId, delta) {
    // raising the layer in the stack means the user wants the layer put front
    if (delta === 1) {
        store.dispatch('moveActiveLayerFront', {
            layerId,
            dispatcher: STORE_DISPATCHER_MENU_ACTIVE_LAYERS_LIST,
        })
    } else if (delta === -1) {
        store.dispatch('moveActiveLayerBack', {
            layerId,
            dispatcher: STORE_DISPATCHER_MENU_ACTIVE_LAYERS_LIST,
        })
    }
}
function onOpacityChange(layerId, opacity) {
    store.dispatch('setLayerOpacity', {
        layerId,
        opacity,
        dispatcher: STORE_DISPATCHER_MENU_ACTIVE_LAYERS_LIST,
    })
}
function isFirstLayer(layerId) {
    return activeLayers.value[0].getID() === layerId
}
function isLastLayer(layerId) {
    return activeLayers.value.slice(-1)[0].getID() === layerId
}
</script>

<template>
    <div>
        <div
            v-show="activeLayers.length > 0"
            data-cy="menu-section-active-layers"
            class="menu-layer-list"
        >
            <MenuActiveLayersListItem
                v-for="layer in activeLayers"
                :key="layer.getID()"
                :layer="layer"
                :show-details="showLayerDetailsForId === layer.getID()"
                :is-first-layer="isFirstLayer(layer.getID())"
                :is-last-layer="isLastLayer(layer.getID())"
                :compact="compact"
                @remove-layer="onRemoveLayer"
                @toggle-layer-visibility="onToggleLayerVisibility"
                @toggle-layer-details="onToggleLayerDetails"
                @opacity-change="onOpacityChange"
                @order-change="onOrderChange"
                @show-layer-legend-popup="showLayerLegendForLayer = layer"
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
