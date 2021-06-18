<template>
    <div v-show="activeLayers.length > 0" class="menu-layer-list">
        <MenuActiveLayersListItem
            v-for="layer in activeLayers"
            :id="layer.getID()"
            :key="layer.getID()"
            :visible="layer.visible"
            :opacity="layer.opacity"
            :name="layer.name"
            :time-config="layer.timeConfig"
            :show-details="showLayerDetailsForId === layer.getID()"
            @removeLayer="onRemoveLayer"
            @toggleLayerVisibility="onToggleLayerVisibility"
            @toggleLayerDetails="onToggleLayerDetails"
            @opacityChange="onOpacityChange"
            @orderChange="onOrderChange"
            @timestampChange="onTimestampChange"
            @showLayerLegendPopup="showLayerLegendForId = layer.getID()"
        />
        <MenuActiveLayersLegendPopup
            v-if="showLayerLegendForId"
            :layer-id="showLayerLegendForId"
            @close="showLayerLegendForId = null"
        />
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import MenuActiveLayersListItem from './MenuActiveLayersListItem'
import MenuActiveLayersLegendPopup from '@/modules/menu/components/activeLayers/MenuActiveLayersLegendPopup'

/**
 * Component that maps the active layers from the state to the menu (and also forwards user
 * interactions to the state)
 */
export default {
    components: { MenuActiveLayersLegendPopup, MenuActiveLayersListItem },
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
        onToggleLayerDetails: function (layerId) {
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
        onRemoveLayer: function (layerId) {
            this.removeLayer(layerId)
        },
        onToggleLayerVisibility: function (layerId) {
            this.toggleLayerVisibility(layerId)
        },
        onOrderChange: function (layerId, delta) {
            if (delta === 1) {
                this.moveActiveLayerBack(layerId)
            } else if (delta === -1) {
                this.moveActiveLayerFront(layerId)
            }
        },
        onOpacityChange: function (layerId, opacity) {
            this.setLayerOpacity({ layerId, opacity })
        },
        onTimestampChange: function (layerId, timestamp) {
            this.setTimedLayerCurrentTimestamp({ layerId, timestamp })
        },
    },
}
</script>
