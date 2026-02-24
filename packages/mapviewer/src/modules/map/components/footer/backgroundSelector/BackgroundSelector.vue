<script setup lang="ts">
import type { Layer } from '@swissgeo/layers'

import { computed } from 'vue'

import type { ActionDispatcher } from '@/store/types'

import BackgroundSelectorSquared from '@/modules/map/components/footer/backgroundSelector/BackgroundSelectorSquared.vue'
import BackgroundSelectorWheelRounded from '@/modules/map/components/footer/backgroundSelector/BackgroundSelectorWheelRounded.vue'
import useLayersStore from '@/store/modules/layers'
import useUIStore from '@/store/modules/ui'

const dispatcher: ActionDispatcher = { name: 'BackgroundSelector.vue' }

const layersStore = useLayersStore()
const uiStore = useUIStore()

function generateBackgroundCategories(bg: Layer) {
    return {
        farbe: bg.id.indexOf('farbe') !== -1,
        grau: bg.id.indexOf('grau') !== -1,
        get aerial() {
            return !this.farbe && !this.grau
        },
    }
}

/** Sorted backgrounds so that they are ordered such as [ void, grau, farbe, aerial ] */
const sortedBackgroundLayersWithVoid = computed<Array<Layer | undefined>>(() =>
    [...layersStore.backgroundLayers, undefined].sort((bg1, bg2) => {
        // if bg1 is void (undefined), it is placed "on-top" (1st in the list)
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

function selectBackground(backgroundLayerId: string | undefined) {
    layersStore.setBackground(backgroundLayerId, dispatcher)
}
</script>

<template>
    <BackgroundSelectorSquared
        v-if="uiStore.isDesktopMode"
        :background-layers="sortedBackgroundLayersWithVoid"
        :current-background-layer="layersStore.currentBackgroundLayer"
        @select-background="selectBackground"
    />
    <BackgroundSelectorWheelRounded
        v-else
        :background-layers="sortedBackgroundLayersWithVoid"
        :current-background-layer="layersStore.currentBackgroundLayer"
        @select-background="selectBackground"
    />
</template>
