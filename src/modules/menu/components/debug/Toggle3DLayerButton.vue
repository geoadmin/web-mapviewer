<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const showBuildings = computed(() => store.state.cesium.showBuildings)
const showVegetation = computed(() => store.state.cesium.showVegetation)

const toggleShow3dVegetation = () =>
    store.dispatch('toggleShow3dVegetation', { dispatcher: 'Toggle3DLayerButton.vue' })
const toggleShow3dBuildings = () =>
    store.dispatch('toggleShow3dBuildings', { dispatcher: 'Toggle3DLayerButton.vue' })
</script>

<template>
    <div class="d-flex gap-1">
        <button
            class="toolbox-button"
            :class="{ active: showVegetation }"
            @click="toggleShow3dVegetation"
        >
            <FontAwesomeIcon icon="tree" />
        </button>
        <button
            class="toolbox-button"
            :class="{ active: showBuildings }"
            @click="toggleShow3dBuildings"
        >
            <FontAwesomeIcon icon="house" size="xs" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import '../../scss/toolbox-buttons';
</style>
