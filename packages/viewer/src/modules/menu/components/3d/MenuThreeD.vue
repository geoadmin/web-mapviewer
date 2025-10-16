<script setup lang="ts">
import { computed } from 'vue'

import MenuItemCheckBox from '@/modules/menu/components/common/MenuItemCheckBox.vue'
import useCesiumStore from '@/store/modules/cesium.store'
import type { ActionDispatcher } from '@/store/types'

const dispatcher: ActionDispatcher = { name: 'MenuThreeD.vue' }

const { compact } = defineProps<{
    compact: boolean
}>()

const cesiumStore = useCesiumStore()

const labels = computed<boolean>({
    get: () => cesiumStore.showLabels,
    set: (value) => cesiumStore.setShowLabels(!!value, dispatcher),
})
const vegetation = computed<boolean>({
    get: () => cesiumStore.showVegetation,
    set: (value) => cesiumStore.setShowVegetation(!!value, dispatcher),
})
const constructions = computed<boolean>({
    get: () => cesiumStore.showBuildings && cesiumStore.showConstructions,
    set: (value) => cesiumStore.setShowConstructionsBuildings(!!value, dispatcher),
})
</script>

<template>
    <div
        class="menu-three-d"
        data-cy="menu-three-d"
    >
        <MenuItemCheckBox
            v-model="labels"
            label="3d_labels"
            :compact="compact"
        />
        <MenuItemCheckBox
            v-model="vegetation"
            label="3d_vegetation"
            :compact="compact"
        />
        <MenuItemCheckBox
            v-model="constructions"
            label="3d_constructions"
            :compact="compact"
        />
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/menu/scss/menu-items';

.menu-three-d {
    @extend %menu-list;

    overflow-y: auto;
}
</style>
