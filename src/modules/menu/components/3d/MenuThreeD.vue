<script setup>
import { computed, toRefs } from 'vue'
import { useStore } from 'vuex'

import MenuItemCheckBox from '@/modules/menu/components/common/MenuItemCheckBox.vue'
import { useTippyTooltip } from '@/utils/composables/useTippyTooltip'

const dispatcher = { dispatcher: 'MenuThreeD.vue' }

useTippyTooltip('.menu-three-d [data-tippy-content]')

const props = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})
const { compact } = toRefs(props)
const store = useStore()

const labels = computed({
    get: () => store.state.cesium.showLabels,
    set: (value) => store.dispatch('setShowLabels', { showLabels: !!value, ...dispatcher }),
})
const vegetation = computed({
    get: () => store.state.cesium.showVegetation,
    set: (value) => store.dispatch('setShowVegetation', { showVegetation: !!value, ...dispatcher }),
})
const constructions = computed({
    get: () => store.state.cesium.showBuildings && store.state.cesium.showConstructions,
    set: (value) =>
        store.dispatch('setShowConstructionsBuildings', {
            showConstructionsBuildings: !!value,
            ...dispatcher,
        }),
})
</script>

<template>
    <div class="menu-three-d" data-cy="menu-three-d">
        <MenuItemCheckBox v-model="labels" label="3d_labels" :compact="compact" />
        <MenuItemCheckBox v-model="vegetation" label="3d_vegetation" :compact="compact" />
        <MenuItemCheckBox v-model="constructions" label="3d_constructions" :compact="compact" />
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/menu/scss/menu-items';

.menu-three-d {
    @extend .menu-list;
    overflow-y: auto;
}
</style>
