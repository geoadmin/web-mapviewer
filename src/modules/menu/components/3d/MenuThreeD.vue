<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, toRefs } from 'vue'
import { useStore } from 'vuex'

import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const dispatcher = { dispatcher: 'MenuThreeD.vue' }
const iconSize = 'lg'
const iconGap = 'me-3'

useTippyTooltip('.menu-three-d [data-tippy-content]')

const props = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})
const { compact } = toRefs(props)
const store = useStore()

const is3dLabelsActive = computed(() => store.state.cesium.showLabels)
const is3dVegetationActive = computed(() => store.state.cesium.showVegetation)
const is3dConstructionsActive = computed(
    () => store.state.cesium.showConstructions || store.state.cesium.showBuildings
)

const toggle3dLabels = () => store.dispatch('toggleShow3dLabels', dispatcher)
const toggle3dVegetation = () => store.dispatch('toggleShow3dVegetation', dispatcher)
const toggle3dConstructions = () => store.dispatch('toggleShow3dConstructionsBuildings', dispatcher)
</script>

<template>
    <div class="menu-three-d p-2 d-flex flow-row gx-2" data-cy="menu-three-d">
        <button
            type="button"
            class="btn"
            :class="{
                'btn-primary': is3dLabelsActive,
                'btn-light': !is3dLabelsActive,
                'btn-lg': !compact,
                [`${iconGap}`]: true,
            }"
            :data-tippy-content="is3dLabelsActive ? '3d_labels_active' : '3d_labels_inactive'"
            @click="toggle3dLabels"
        >
            <FontAwesomeIcon :icon="['fas', 'tags']" :size="iconSize" fixed-width />
        </button>
        <button
            type="button"
            class="btn"
            :class="{
                'btn-primary': is3dVegetationActive,
                'btn-light': !is3dVegetationActive,
                'btn-lg': !compact,
                [`${iconGap}`]: true,
            }"
            :data-tippy-content="
                is3dVegetationActive ? '3d_vegetation_active' : '3d_vegetation_inactive'
            "
            @click="toggle3dVegetation"
        >
            <FontAwesomeIcon :icon="['fas', 'tree']" :size="iconSize" fixed-width />
        </button>
        <button
            type="button"
            class="btn"
            :class="{
                'btn-primary': is3dConstructionsActive,
                'btn-light': !is3dConstructionsActive,
                'btn-lg': !compact,
            }"
            :data-tippy-content="
                is3dConstructionsActive ? '3d_constructions_active' : '3d_constructions_inactive'
            "
            @click="toggle3dConstructions"
        >
            <FontAwesomeIcon :icon="['fas', 'house']" :size="iconSize" fixed-width />
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
