<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import debounce from '@/utils/debounce'
import type { Layer } from '@swissgeo/layers'
import useLayersStore from '@/store/modules/layers.store'
import type { ActionDispatcher } from '@/store/types'

const dispatcher: ActionDispatcher = { name: 'MenuActiveLayersListItem.vue' }

const { layer, index } = defineProps<{
    layer: Layer
    index: number
}>()

const localTransparency = ref<number>(0)

const layersStore = useLayersStore()

onMounted(() => {
    syncOpacity()
})

function syncOpacity(): void {
    localTransparency.value = 1 - layer.opacity
}

function saveOpacityToLayer(opacity: number): void {
    layersStore.setLayerOpacity(index, opacity, dispatcher)
}

const debouncedSaveOpacityToLayer = debounce(saveOpacityToLayer, 50)

watch(localTransparency, (newTransparency) => {
    const newOpacity = 1 - newTransparency

    // there is of course a tasty race condition if we debounce this in cypress
    if (IS_TESTING_WITH_CYPRESS) {
        saveOpacityToLayer(newOpacity)
    } else {
        debouncedSaveOpacityToLayer(newOpacity)
    }
})
</script>

<template>
    <input
        :id="`transparency-${layer.id}`"
        ref="transparencySlider"
        v-model.number="localTransparency"
        class="menu-layer-transparency-slider ms-2 me-4 flex-grow-1"
        type="range"
        min="0.0"
        max="1.0"
        step="0.01"
        :data-cy="`slider-transparency-layer-${layer.id}-${index}`"
        @onmouseup="syncOpacity"
    />
</template>
