<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import BaseUrlOverrideModal from '@/modules/menu/components/debug/BaseUrlOverrideModal.vue'
import { LV95, WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'

const dispatcher = { dispatcher: 'DebugToolbar.vue' }

const store = useStore()

const showDebugTool = ref(false)
const showBaseUrlOverride = ref(false)

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
function toggleShowBaseUrlOverride() {
    showBaseUrlOverride.value = !showBaseUrlOverride.value
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
                data-cy="debug-tools-header"
                @click="showDebugTool = !showDebugTool"
            >
                <FontAwesomeIcon icon="gear" title="Debug tools" />
            </div>
            <div v-show="showDebugTool" class="debug-tools-body">
                <div class="card-body">
                    <div
                        id="debug-tools-menu"
                        class="d-flex gap-2 justify-content-center flex-wrap"
                    >
                        <div class="d-flex flex-column align-items-center">
                            <button
                                class="toolbox-button"
                                type="button"
                                :class="{ active: isMercatorTheCurrentProjection }"
                                data-cy="toggle-projection-button"
                                @click="toggleProjection"
                            >
                                <FontAwesomeIcon :icon="['fas', 'earth-europe']" />
                            </button>
                            <label class="toolbox-button-label" data-cy="current-projection">
                                {{ currentProjection.epsg }}
                            </label>
                        </div>

                        <div v-if="!is3dActive" class="d-flex flex-column align-items-center">
                            <button
                                class="toolbox-button m-auto"
                                type="button"
                                :class="{ active: showTileDebugInfo }"
                                @click="toggleShowTileDebugInfo"
                            >
                                <FontAwesomeIcon icon="border-none" />
                            </button>
                            <label class="toolbox-button-label">Tile info</label>
                        </div>
                        <div v-if="!is3dActive" class="d-flex flex-column align-items-center">
                            <button
                                class="toolbox-button m-auto"
                                type="button"
                                :class="{ active: showLayerExtents }"
                                @click="toggleShowLayerExtents"
                            >
                                <FontAwesomeIcon icon="expand" />
                            </button>
                            <label class="toolbox-button-label">Extents</label>
                        </div>
                    </div>
                    <div>
                        <button
                            class="toolbox-button m-auto"
                            type="button"
                            :class="{ active: showBaseUrlOverride }"
                            @click="toggleShowBaseUrlOverride"
                        >
                            <FontAwesomeIcon icon="cog" />
                        </button>
                        <label class="text-center w-100">Set base URL</label>
                    </div>
                </div>
            </div>
        </div>
        <BaseUrlOverrideModal v-if="showBaseUrlOverride" @close="toggleShowBaseUrlOverride" />
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
