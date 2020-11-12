<template>
  <div class="menu-layer-list" v-show="activeLayers.length > 0">
    <h4>Layers</h4>
    <MenuLayerListItem v-for="layer in activeLayers" :key="layer.id" :id="layer.id" :visible="layer.visible" :name="layer.name" />
  </div>
</template>

<style lang="scss">
</style>

<script>
import { mapState } from 'vuex'
import MenuLayerListItem from "./MenuLayerListItem";
export default {
  components: {MenuLayerListItem},
  computed: {
    ...mapState({
      activeLayers: state => state.layers.activeLayers
    })
  }
};
</script>
