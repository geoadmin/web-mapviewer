<template>
    <div v-show="activeLayers.length > 0" class="menu-layer-list">
        <MenuActiveLayersListItem
            v-for="layer in activeLayers"
            :id="layer.id"
            :key="layer.id"
            :visible="layer.visible"
            :opacity="layer.opacity"
            :name="layer.name"
            @removeLayer="onRemoveLayer"
            @toggleLayerVisibility="onToggleLayerVisibility"
            @opacityChange="onOpacityChange"
            @orderChange="onOrderChange"
        />
    </div>
</template>

<style lang="scss"></style>

<script>
import { mapState, mapActions } from 'vuex'
import MenuActiveLayersListItem from './MenuActiveLayersListItem'

/**
 * Component that maps the active layers from the state to the menu (and also forwards user
 * interactions to the state)
 */
export default {
    components: { MenuActiveLayersListItem },
    computed: {
        ...mapState({
            activeLayers: (state) => state.layers.activeLayers,
        }),
    },
    methods: {
        ...mapActions([
            'setLayerOpacity',
            'moveActiveLayerBack',
            'moveActiveLayerFront',
            'toggleLayerVisibility',
            'removeLayer',
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
    },
}
</script>
