<template>
  <div class="menu-layer-list-item">
    <div class="menu-layer-item-name form-check">
      <input type="checkbox" class="form-check-input" :id="checkboxId" v-model="isVisible">
      <label class="form-check-label" :for="checkboxId">{{ name }}</label>
    </div>
    <div class="menu-layer-item-toolbox btn-group">
      <button class="btn btn-default" @click="removeLayer(id)">X</button>
    </div>
  </div>
</template>

<style lang="scss">
@import "node_modules/bootstrap/scss/bootstrap";
.menu-layer-list-item {
  @extend .d-flex;
  @extend .justify-content-between;

  .menu-layer-item-name {
    align-self: center;
  }
}
</style>

<script>
import { mapActions } from 'vuex'
export default {
  props: {
    id: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  computed: {
    checkboxId: function() {
      return `toggle-visibility-${this.id}`
    },
    isVisible: {
      get: function () {
        return this.visible;
      },
      set: function () {
        this.toggleLayerVisibility(this.id);
      }
    }
  },
  methods: {
    ...mapActions(['toggleLayerVisibility', 'removeLayer'])
  }
}
</script>
