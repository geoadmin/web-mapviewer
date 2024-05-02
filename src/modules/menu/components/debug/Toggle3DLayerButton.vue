<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { useStore } from 'vuex'

const dispatcher = { dispatcher: 'Toggle3DLayerButton.vue' }

const store = useStore()
const showBuildings = computed(() => store.state.cesium.showBuildings)
const showConstructions = computed(() => store.state.cesium.showConstructions)
const showVegetation = computed(() => store.state.cesium.showVegetation)

const toggleShow3dVegetation = () => store.dispatch('toggleShow3dVegetation', dispatcher)
const toggleShow3dBuildings = () => store.dispatch('toggleShow3dBuildings', dispatcher)
const toggleShow3dConstructions = () => store.dispatch('toggleShow3dConstructions', dispatcher)
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
        <button
            class="toolbox-button"
            :class="{ active: showConstructions }"
            @click="toggleShow3dConstructions"
        >
            <FontAwesomeIcon icon="bridge" size="xs" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
</style>
