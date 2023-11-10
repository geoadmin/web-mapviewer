<script setup>
import BackgroundSelectorSquared from '@/modules/map/components/footer/backgroundSelector/BackgroundSelectorSquared.vue'
import BackgroundSelectorWheelRounded from '@/modules/map/components/footer/backgroundSelector/BackgroundSelectorWheelRounded.vue'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

const showSelector = ref(false)
const animate = ref(false)

const store = useStore()
const backgroundLayers = computed(() => store.getters.backgroundLayers)
const currentBackgroundLayer = computed(() => store.state.layers.currentBackgroundLayer)
const squaredDesign = computed(() => store.getters.isDesktopMode)

const backgroundLayersWithVoid = computed(() => [...backgroundLayers.value, null])

function selectBackground(backgroundLayer) {
    store.dispatch('setBackground', backgroundLayer)
}
</script>

<template>
    <BackgroundSelectorSquared
        v-if="squaredDesign"
        :background-layers="backgroundLayersWithVoid"
        :current-background-layer="currentBackgroundLayer"
        @select-background="selectBackground"
    />
    <BackgroundSelectorWheelRounded
        v-else
        :background-layers="backgroundLayersWithVoid"
        :current-background-layer="currentBackgroundLayer"
        @select-background="selectBackground"
    />
</template>
