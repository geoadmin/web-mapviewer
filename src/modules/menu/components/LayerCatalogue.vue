<script setup>
import LayerCatalogueItem from '@/modules/menu/components/LayerCatalogueItem.vue'
import { useStore } from 'vuex'

const { layerCatalogue, compact } = defineProps({
    layerCatalogue: {
        type: Array,
        required: true,
    },
    compact: {
        type: Boolean,
        default: false,
    },
})

const store = useStore()

function clearPreviewLayer() {
    if (store.state.layers.previewLayer) {
        store.dispatch('clearPreviewLayer')
    }
}
</script>

<template>
    <div class="menu-topic-list" data-cy="menu-topic-tree" @mouseleave="clearPreviewLayer">
        <LayerCatalogueItem
            v-for="item in layerCatalogue"
            :key="item.getID()"
            :item="item"
            :compact="compact"
        />
    </div>
</template>
