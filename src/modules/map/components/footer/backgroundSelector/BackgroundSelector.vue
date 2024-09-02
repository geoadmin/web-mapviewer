<script setup>
import { computed, watch } from 'vue'
import { useStore } from 'vuex'

import BackgroundSelectorSquared from '@/modules/map/components/footer/backgroundSelector/BackgroundSelectorSquared.vue'
import BackgroundSelectorWheelRounded from '@/modules/map/components/footer/backgroundSelector/BackgroundSelectorWheelRounded.vue'

const dispatcher = { dispatcher: 'BackgroundSelector.vue' }

const store = useStore()
const backgroundLayers = computed(() => store.getters.backgroundLayers)
const currentBackgroundLayer = computed(() => store.state.layers.currentBackgroundLayer)
const squaredDesign = computed(() => store.getters.isDesktopMode)

function generateBackgroundCategories(bg) {
    return {
        farbe: bg.id.indexOf('farbe') !== -1,
        grau: bg.id.indexOf('grau') !== -1,
        get aerial() {
            return !this.farbe && !this.grau
        },
    }
}

/** Sorted backgrounds so that they are ordered such as [ void, grau, farbe, aerial ] */
const sortedBackgroundLayersWithVoid = computed(() =>
    [...backgroundLayers.value, null].sort((bg1, bg2) => {
        // if bg1 is void (null), it is placed "on-top" (1st in the list)
        if (!bg1) {
            return 1
        }
        // if bg2 is void, the same thing as above
        if (!bg2) {
            return -1
        }
        const bg1Category = generateBackgroundCategories(bg1)
        const bg2Category = generateBackgroundCategories(bg2)
        if (bg1Category.grau || (bg1Category.farbe && bg2Category.aerial)) {
            return 1
        }
        if (bg2Category.grau || (bg2Category.farbe && bg1Category.aerial)) {
            return -1
        }
        return 0
    })
)

function selectBackground(backgroundLayer) {
    store.dispatch('setBackground', {
        bgLayer: backgroundLayer,
        ...dispatcher,
    })
}

/**
 * This is a bit of a hack to force the reactive system to update the attributions when the language
 * changes, so that the url will be updated on language selection: On language change the background
 * layers are being updated, which changes the link to the correct (current) language. For the
 * change to propagate through to the UI, we push it here again
 */
watch(
    () => backgroundLayers.value,
    () => {
        selectBackground(currentBackgroundLayer.value)
    }
)
</script>

<template>
    <BackgroundSelectorSquared
        v-if="squaredDesign"
        :background-layers="sortedBackgroundLayersWithVoid"
        :current-background-layer="currentBackgroundLayer"
        @select-background="selectBackground"
    />
    <BackgroundSelectorWheelRounded
        v-else
        :background-layers="sortedBackgroundLayersWithVoid"
        :current-background-layer="currentBackgroundLayer"
        @select-background="selectBackground"
    />
</template>
