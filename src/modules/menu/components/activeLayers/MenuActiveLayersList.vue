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

<script>
import { mapActions, mapState } from 'vuex'

import LayerLegendPopup from '@/modules/menu/components/LayerLegendPopup.vue'

import MenuActiveLayersListItem from './MenuActiveLayersListItem.vue'

/**
 * Component that maps the active layers from the state to the menu (and also forwards user
 * interactions to the state)
 */
export default {
    components: { LayerLegendPopup, MenuActiveLayersListItem },
    props: {
        compact: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            showLayerLegendForLayer: null,
            showLayerDetailsForId: null,
        }
    },
    computed: {
        ...mapState({
            // users are used to have layers ordered top to bottom (first layer is on top) but we store them in the
            // opposite order. So here we swap the order of this array to match the desired order on the UI
            activeLayers: (state) => state.layers.activeLayers.slice().reverse(),
        }),
    },
    methods: {
        onToggleLayerDetails(layerId) {
            if (this.showLayerDetailsForId === layerId) {
                this.showLayerDetailsForId = null
            } else {
                this.showLayerDetailsForId = layerId
            }
        },
        ...mapActions([
            'setLayerOpacity',
            'moveActiveLayerBack',
            'moveActiveLayerFront',
            'toggleLayerVisibility',
            'removeLayer',
            'showOverlay',
            'setOverlayShouldBeFront',
        ]),
        onRemoveLayer(layerId) {
            this.removeLayer(layerId)
        },
        onToggleLayerVisibility(layerId) {
            this.toggleLayerVisibility(layerId)
        },
        onOrderChange(layerId, delta) {
            // raising the layer in the stack means the user wants the layer put front
            if (delta === 1) {
                this.moveActiveLayerFront(layerId)
            } else if (delta === -1) {
                this.moveActiveLayerBack(layerId)
            }
        },
        onOpacityChange(layerId, opacity) {
            this.setLayerOpacity({ layerId, opacity })
        },
        isFirstLayer(layerId) {
            return this.activeLayers[0].getID() === layerId
        },
        isLastLayer(layerId) {
            return this.activeLayers[this.activeLayers.length - 1].getID() === layerId
        },
    },
}
</script>
