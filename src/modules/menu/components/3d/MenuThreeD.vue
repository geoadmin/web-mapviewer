<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const dispatcher = { dispatcher: 'MenuThreeD.vue' }
const iconSize = '2x'

useTippyTooltip('.menu-three-d [data-tippy-content]')

defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})
const store = useStore()
const is3dActive = computed(() => store.state.cesium.active)
const is3dLabelsActive = computed(() => is3dActive.value && store.state.cesium.showLabels)
const is3dVegetationActive = computed(() => is3dActive.value && store.state.cesium.showVegetation)
const is3dConstructionsActive = computed(
    () =>
        is3dActive.value &&
        (store.state.cesium.showConstructions || store.state.cesium.showBuildings)
)

const toggle3d = () => store.dispatch('set3dActive', { active: !is3dActive.value, ...dispatcher })

const toggle3dLabels = () => store.dispatch('toggleShow3dLabels', dispatcher)
const toggle3dVegetation = () => store.dispatch('toggleShow3dVegetation', dispatcher)
const toggle3dConstructions = () => store.dispatch('toggleShow3dConstructionsBuildings', dispatcher)
</script>

<template>
    <div class="menu-three-d p-2 d-flex flow-row" data-cy="menu-three-d">
        <button
            type="button"
            class="btn btn-sm me-2"
            :class="{ 'btn-primary': is3dActive, 'btn-light': !is3dActive }"
            :data-tippy-content="is3dActive ? 'tilt3d_active' : 'tilt3d_inactive'"
            @click="toggle3d"
        >
            <FontAwesomeIcon :icon="['fas', 'cube']" flip="horizontal" :size="iconSize" />
        </button>
        <button
            type="button"
            class="btn btn-sm me-2"
            :class="{
                'btn-primary': is3dLabelsActive,
                'btn-light': !is3dLabelsActive,
            }"
            :disabled="!is3dActive"
            :data-tippy-content="is3dLabelsActive ? '3d_labels_active' : '3d_labels_inactive'"
            @click="toggle3dLabels"
        >
            <FontAwesomeIcon :icon="['fas', 'tags']" :size="iconSize" />
        </button>
        <button
            type="button"
            class="btn btn-sm me-2"
            :class="{ 'btn-primary': is3dVegetationActive, 'btn-light': !is3dVegetationActive }"
            :disabled="!is3dActive"
            :data-tippy-content="
                is3dVegetationActive ? '3d_vegetation_active' : '3d_vegetation_inactive'
            "
            @click="toggle3dVegetation"
        >
            <FontAwesomeIcon :icon="['fas', 'tree']" :size="iconSize" />
        </button>
        <button
            type="button"
            class="btn btn-sm me-2"
            :class="{
                'btn-primary': is3dConstructionsActive,
                'btn-light': !is3dConstructionsActive,
            }"
            :disabled="!is3dActive"
            :data-tippy-content="
                is3dConstructionsActive ? '3d_constructions_active' : '3d_constructions_inactive'
            "
            @click="toggle3dConstructions"
        >
            <FontAwesomeIcon :icon="['fas', 'house']" :size="iconSize" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/menu/scss/menu-items';

.menu-three-d {
    @extend .menu-list;
    overflow-y: auto;
}
</style>
