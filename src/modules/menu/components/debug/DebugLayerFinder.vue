<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import LayerTypes from '@/api/layers/LayerTypes.enum'
import DebugLayerFinderFilter from '@/modules/menu/components/debug/DebugLayerFinderFilter.vue'
import SimpleWindow from '@/utils/components/SimpleWindow.vue'

const onlyTimeEnabled = ref(null)
const with3DConfig = ref(null)
const withTooltip = ref(null)
const withLegend = ref(null)

const store = useStore()

const layers = computed(() => store.state.layers.config)
const possibleLayerTypes = [
    LayerTypes.WMTS,
    LayerTypes.WMS,
    LayerTypes.AGGREGATE,
    LayerTypes.GEOJSON,
]
const currentLayerType = ref([...possibleLayerTypes])

const filteredLayers = computed(() => {
    if (!currentLayerType.value) {
        return []
    }
    return layers.value.filter((layer) => {
        return (
            possibleLayerTypes.includes(layer.type) &&
            currentLayerType.value.includes(layer.type) &&
            (onlyTimeEnabled.value === null ||
                layer.hasMultipleTimestamps === onlyTimeEnabled.value) &&
            (with3DConfig.value === null || !!layer.idIn3d === with3DConfig.value) &&
            (withTooltip.value === null || layer.hasTooltip === withTooltip.value) &&
            (withLegend.value === null || layer.hasLegend === withLegend.value)
        )
    })
})

function addLayer(layerConfig) {
    store.dispatch('addLayer', {
        layerConfig: {
            id: layerConfig.id,
            visible: true,
        },
        dispatcher: 'DebugLayerFinder.vue',
    })
}

function toggleLayerType(type) {
    if (currentLayerType.value.includes(type)) {
        currentLayerType.value = currentLayerType.value.filter((t) => t !== type)
    } else {
        currentLayerType.value.push(type)
    }
}
</script>

<template>
    <SimpleWindow title="Layer finder" movable resizeable wide initial-position="top-left">
        <div>
            <div class="d-flex justify-content-stretch">
                <div class="btn-group">
                    <button
                        v-for="type in possibleLayerTypes"
                        :key="type"
                        class="btn"
                        :class="{
                            'btn-outline-secondary': !currentLayerType.includes(type),
                            'btn-success': currentLayerType.includes(type),
                        }"
                        @click="toggleLayerType(type)"
                    >
                        {{ type }}
                    </button>
                </div>
            </div>
            <div class="d-grid layer-filters">
                <div class="row g-1 align-items-center">
                    <div class="col-auto">
                        <label class="col-form-label">Time enabled</label>
                    </div>
                    <div class="col-auto">
                        <DebugLayerFinderFilter @change="(value) => (onlyTimeEnabled = value)" />
                    </div>
                </div>
                <div class="row g-1 align-items-center">
                    <div class="col-auto">
                        <label class="col-form-label">with 3D config</label>
                    </div>
                    <div class="col-auto">
                        <DebugLayerFinderFilter @change="(value) => (with3DConfig = value)" />
                    </div>
                </div>
                <div class="row g-1 align-items-center">
                    <div class="col-auto">
                        <label class="col-form-label">With tooltip</label>
                    </div>
                    <div class="col-auto">
                        <DebugLayerFinderFilter @change="(value) => (withTooltip = value)" />
                    </div>
                </div>
                <div class="row g-1 align-items-center">
                    <div class="col-auto">
                        <label class="col-form-label">With legend</label>
                    </div>
                    <div class="col-auto">
                        <DebugLayerFinderFilter @change="(value) => (withLegend = value)" />
                    </div>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                {{ filteredLayers.length }} layer{{ filteredLayers.length > 1 ? 's' : '' }}
            </div>
            <div class="layer-list card-body overflow-y-auto p-0 m-0">
                <div
                    v-for="(layer, index) in filteredLayers"
                    :key="layer.id"
                    class="d-flex justify-content-end align-content-center mb-1 p-1"
                    :class="{ 'bg-body-secondary': index % 2 === 0 }"
                >
                    <div class="flex-grow-1 align-self-center">{{ layer.name }}</div>
                    <div class="align-self-center me-1">
                        <button class="btn btn-secondary btn-sm" @click="addLayer(layer)">+</button>
                    </div>
                </div>
            </div>
        </div>
    </SimpleWindow>
</template>

<style lang="scss" scoped>
.layer-filters {
    grid-template-columns: 1fr 1fr;
    justify-items: end;
}
.layer-list {
    max-height: min(250px, 50vh);
}
</style>
