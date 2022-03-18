<template>
    <div>
        <div
            v-show="activeLayers.length > 0"
            data-cy="menu-section-active-layers"
            class="menu-layer-list"
        >
            <MenuActiveLayersListItem
                v-for="layer in activeLayers"
                :id="layer.getID()"
                :key="layer.getID()"
                :visible="layer.visible"
                :opacity="layer.opacity"
                :name="layer.name"
                :time-config="layer.timeConfig"
                :show-details="showLayerDetailsForId === layer.getID()"
                :is-first-layer="isFirstLayer(layer.getID())"
                :is-last-layer="isLastLayer(layer.getID())"
                :compact="compact"
                @remove-layer="onRemoveLayer"
                @toggle-layer-visibility="onToggleLayerVisibility"
                @toggle-layer-details="onToggleLayerDetails"
                @opacity-change="onOpacityChange"
                @order-change="onOrderChange"
                @timestamp-change="onTimestampChange"
                @show-layer-legend-popup="showLayerLegendForId = layer.getID()"
            />
            <LayerLegendPopup
                v-if="showLayerLegendForId"
                :layer-id="showLayerLegendForId"
                @close="showLayerLegendForId = null"
            />
        </div>
        <div v-show="activeLayers.length === 0" data-cy="menu-section-no-layers">-</div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import MenuActiveLayersListItem from './MenuActiveLayersListItem.vue'
import LayerLegendPopup from '@/modules/menu/components/LayerLegendPopup.vue'

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
            showLayerLegendForId: null,
            showLayerDetailsForId: null,
        }
    },
    computed: {
        ...mapState({
            activeLayers: (state) => state.layers.activeLayers,
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
            'setTimedLayerCurrentTimestamp',
        ]),
        onRemoveLayer(layerId) {
            this.removeLayer(layerId)
        },
        onToggleLayerVisibility(layerId) {
            this.toggleLayerVisibility(layerId)
        },
        onOrderChange(layerId, delta) {
            if (delta === 1) {
                this.moveActiveLayerBack(layerId)
            } else if (delta === -1) {
                this.moveActiveLayerFront(layerId)
            }
        },
        onOpacityChange(layerId, opacity) {
            this.setLayerOpacity({ layerId, opacity })
        },
        onTimestampChange(layerId, timestamp) {
            this.setTimedLayerCurrentTimestamp({ layerId, timestamp })
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
