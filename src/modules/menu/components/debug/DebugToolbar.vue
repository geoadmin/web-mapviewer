<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import Toggle3DLayerButton from '@/modules/menu/components/debug/Toggle3DLayerButton.vue'
import { LV95, WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'

const dispatcher = { dispatcher: 'DebugToolbar.vue' }

const store = useStore()

const showDebugTool = ref(false)

const currentProjection = computed(() => store.state.position.projection)
const is3dActive = computed(() => store.state.cesium.active)
const showTileDebugInfo = computed(() => store.state.debug.showTileDebugInfo)
const showLayerExtents = computed(() => store.state.debug.showLayerExtents)

const isMercatorTheCurrentProjection = computed(
    () => currentProjection.value.epsg === WEBMERCATOR.epsg
)

function toggleProjection() {
    if (isMercatorTheCurrentProjection.value) {
        store.dispatch('setProjection', { projection: LV95, ...dispatcher })
    } else {
        store.dispatch('setProjection', {
            projection: WEBMERCATOR,
            ...dispatcher,
        })
    }
}
function toggleShowTileDebugInfo() {
    store.dispatch('toggleShowTileDebugInfo', dispatcher)
}
function toggleShowLayerExtents() {
    store.dispatch('toggleShowLayerExtents', dispatcher)
}
</script>

<template>
    <div
        class="debug-tools card border-danger rounded-end-0 me-n1"
        :class="{ collapsed: !showDebugTool }"
    >
        <div class="position-relative d-flex">
            <div
                class="debug-tools-header p-2 bg-danger-subtle border-end border-danger rounded-start-1"
                @click="showDebugTool = !showDebugTool"
            >
                <FontAwesomeIcon icon="gear" title="Debug tools" />
            </div>
            <div v-if="showDebugTool" class="debug-tools-body">
                <div class="card-body">
                    <h5 class="text-decoration-underline">Map projection</h5>
                    <div class="my-1 d-flex align-content-center">
                        <strong class="me-2 align-self-center">
                            {{ currentProjection.epsg }}
                        </strong>
                        <button
                            class="toolbox-button align-self-center"
                            type="button"
                            :class="{ active: isMercatorTheCurrentProjection }"
                            @click="toggleProjection"
                        >
                            <FontAwesomeIcon :icon="['fas', 'earth-europe']" />
                        </button>
                    </div>
                    <div v-if="is3dActive" class="mb-1">
                        <h5 class="text-decoration-underline">3D</h5>
                        <Toggle3DLayerButton class="align-self-center" />
                    </div>
                    <div v-else class="mb-1">
                        <h5 class="text-decoration-underline">Layer debug</h5>
                        <div class="d-flex gap-1 justify-content-around">
                            <div>
                                <button
                                    class="toolbox-button m-auto"
                                    type="button"
                                    :class="{ active: showTileDebugInfo }"
                                    @click="toggleShowTileDebugInfo"
                                >
                                    <FontAwesomeIcon icon="border-none" />
                                </button>
                                <label class="text-center w-100">Tile info</label>
                            </div>
                            <div>
                                <button
                                    class="toolbox-button m-auto"
                                    type="button"
                                    :class="{ active: showLayerExtents }"
                                    @click="toggleShowLayerExtents"
                                >
                                    <FontAwesomeIcon icon="expand" />
                                </button>
                                <label class="text-center">Extents</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/modules/map/scss/toolbox-buttons';
.debug-tools {
    $debugToolWidth: 12.5rem;
    $debugToolHeaderWidth: 2rem;
    width: $debugToolWidth;

    transition: all 0.4s;
    &.collapsed {
        transform: translateX($debugToolWidth - $debugToolHeaderWidth);
    }

    &-header {
        cursor: pointer;
    }
}
</style>
