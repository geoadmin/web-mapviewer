<template>
  <div v-show="activeLayers.length > 0" class="menu-layer-list">
    <h4>Layers</h4>
    <MenuLayerListItem
      v-for="layer in activeLayers"
      :id="layer.id"
      :key="layer.id"
      :visible="layer.visible"
      :name="layer.name"
    />
  </div>
</template>

<style lang="scss"></style>

<script>
import { mapState } from 'vuex'
import MenuLayerListItem from './MenuLayerListItem'
export default {
  components: { MenuLayerListItem },
  computed: {
    ...mapState({
      activeLayers: (state) => state.layers.activeLayers,
    }),
  },
}
</script>
