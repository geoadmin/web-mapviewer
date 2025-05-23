<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { ref } from 'vue'
// @ts-ignore no-implicit-any
import { useStore, Store } from 'vuex'

import type AbstractLayer from '@/api/layers/AbstractLayer.class'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import debounce from '@/utils/debounce'

const DISPATCHER = { dispatcher: 'MenuActiveLayersListItem.vue' }

const store: Store = useStore()

const { layer, index } = defineProps<{
    layer: AbstractLayer
    index: number
}>()

const localTransparency = ref(0)

onMounted(() => {
    syncOpacity()
})

const syncOpacity = () => {
    localTransparency.value = 1 - layer.opacity
}

const saveOpacityToLayer = (opacity: number) => {
    store.dispatch('setLayerOpacity', {
        index,
        opacity: opacity,
        ...DISPATCHER,
    })
}

const debouncedSaveOpacityToLayer = debounce(saveOpacityToLayer, 50)

watch(localTransparency, (newTransparency: number) => {
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
