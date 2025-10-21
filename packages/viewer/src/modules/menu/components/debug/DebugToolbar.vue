<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { LV95, WEBMERCATOR } from '@swissgeo/coordinates'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import BaseUrlOverrideModal from '@/modules/menu/components/debug/BaseUrlOverrideModal.vue'
import DebugLayerFinder from '@/modules/menu/components/debug/DebugLayerFinder.vue'
import DebugPrint from '@/modules/menu/components/debug/DebugPrint.vue'
import DebugViewSelector from '@/modules/menu/components/debug/DebugViewSelector.vue'
import { PRINT_VIEW } from '@/router/viewNames'
import usePositionStore from '@/store/modules/position.store'
import useCesiumStore from '@/store/modules/cesium'
import useDebugStore from '@/store/modules/debug.store'
import useUIStore from '@/store/modules/ui.store'

const dispatcher = { name: 'DebugToolbar.vue' }

const positionStore = usePositionStore()
const cesiumStore = useCesiumStore()
const debugStore = useDebugStore()
const uiStore = useUIStore()

const route = useRoute()

const showDebugTool = ref(false)
const showBaseUrlOverride = ref(false)
const showLayerFinder = ref(false)
const showPrint = ref(false)

const currentProjection = computed(() => positionStore.projection)
const is3dActive = computed(() => cesiumStore.active)
const showTileDebugInfo = computed(() => debugStore.showTileDebugInfo)
const showLayerExtents = computed(() => debugStore.showLayerExtents)

const isMercatorTheCurrentProjection = computed(
    () => currentProjection.value.epsg === WEBMERCATOR.epsg
)

function toggleProjection() {
    if (isMercatorTheCurrentProjection.value) {
        positionStore.setProjection(LV95, dispatcher)
    } else {
        positionStore.setProjection(WEBMERCATOR, dispatcher)
    }
}
function toggleShowTileDebugInfo() {
    debugStore.toggleShowTileDebugInfo(dispatcher)
}
function toggleShowLayerExtents() {
    debugStore.toggleShowLayerExtents(dispatcher)
}
function toggleShowBaseUrlOverride() {
    showBaseUrlOverride.value = !showBaseUrlOverride.value
}
function toggleShowLayerFinder() {
    showLayerFinder.value = !showLayerFinder.value
}
function toggleShowPrint() {
    showPrint.value = !showPrint.value
}
function showSiteAsInProd() {
    uiStore.setForceNoDevSiteWarning(dispatcher)
}
</script>

<template>
    <div
        class="position-fixed debug-tools card border-danger rounded-end-0 me-n1 no-print end-0 top-50 z-3"
        :class="{ collapsed: !showDebugTool }"
    >
        <div class="position-relative d-flex">
            <div
                class="debug-tools-header bg-danger-subtle border-end border-danger rounded-start-1 p-2"
                data-cy="debug-tools-header"
                @click="showDebugTool = !showDebugTool"
            >
                <FontAwesomeIcon
                    icon="gear"
                    title="Debug tools"
                />
            </div>
            <div
                v-show="showDebugTool"
                class="debug-tools-body"
            >
                <div class="card-body p-1">
                    <div
                        id="debug-tools-menu"
                        class="d-flex justify-content-center flex-wrap gap-2"
                    >
                        <DebugViewSelector />

                        <div
                            v-if="route.name === PRINT_VIEW"
                            class="d-flex flex-column align-items-center"
                        >
                            <button
                                class="toolbox-button"
                                type="button"
                                :class="{ active: showPrint }"
                                @click="toggleShowPrint"
                            >
                                <FontAwesomeIcon :icon="['fas', 'print']" />
                            </button>
                            <label class="toolbox-button-label">Print</label>
                        </div>

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
                            <label
                                class="toolbox-button-label"
                                data-cy="current-projection"
                            >
                                {{ currentProjection.epsg }}
                            </label>
                        </div>

                        <div
                            v-if="!is3dActive"
                            class="d-flex flex-column align-items-center"
                        >
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
                        <div
                            v-if="!is3dActive"
                            class="d-flex flex-column align-items-center"
                        >
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
                        <div class="d-flex flex-column align-items-center">
                            <button
                                class="toolbox-button m-auto"
                                type="button"
                                :class="{ active: showBaseUrlOverride }"
                                @click="toggleShowBaseUrlOverride"
                            >
                                <FontAwesomeIcon icon="cog" />
                            </button>
                            <label class="toolbox-button-label">Backends</label>
                        </div>
                        <div class="d-flex flex-column align-items-center">
                            <button
                                class="toolbox-button m-auto"
                                type="button"
                                :class="{ active: showLayerFinder }"
                                @click="toggleShowLayerFinder"
                            >
                                <FontAwesomeIcon icon="magnifying-glass" />
                            </button>
                            <label class="toolbox-button-label">Find a layer</label>
                        </div>
                        <div class="d-flex flex-column align-items-center">
                            <button
                                class="toolbox-button m-auto"
                                type="button"
                                :class="{ active: false }"
                                @click="showSiteAsInProd"
                            >
                                <FontAwesomeIcon icon="lightbulb" />
                            </button>
                            <label class="toolbox-button-label">Show as production</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <BaseUrlOverrideModal
            v-if="showBaseUrlOverride"
            @close="toggleShowBaseUrlOverride"
        />
        <DebugLayerFinder
            v-if="showLayerFinder"
            @close="toggleShowLayerFinder"
        />
        <DebugPrint
            v-if="showPrint"
            @close="toggleShowPrint"
        />
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
