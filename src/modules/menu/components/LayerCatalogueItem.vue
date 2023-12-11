<script setup>
/**
 * Node of a layer catalogue in the UI, rendering (and behavior) will differ if this is a group of
 * layers or a single layer.
 */

import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
// importing directly the vue component, see https://github.com/ivanvermeyen/vue-collapse-transition/issues/5
import CollapseTransition from '@ivanv/vue-collapse-transition/src/CollapseTransition.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import AbstractLayer from '@/api/layers/AbstractLayer.class'
import GeoAdminGroupOfLayers from '@/api/layers/GeoAdminGroupOfLayers.class'
import LayerLegendPopup from '@/modules/menu/components/LayerLegendPopup.vue'
import { ActiveLayerConfig } from '@/utils/layerUtils'
import log from '@/utils/logging'

const { item, compact, depth } = defineProps({
    item: {
        type: AbstractLayer,
        required: true,
    },
    compact: {
        type: Boolean,
        default: false,
    },
    depth: {
        type: Number,
        default: 0,
    },
})

// Declaring own properties (ex-data)
const showChildren = ref(false)
const showLayerLegend = ref(false)

// Mapping the store to the component
const store = useStore()

const activeLayers = computed(() => store.state.layers.activeLayers)
const openThemesIds = computed(() => store.state.topics.openedTreeThemesIds)

const hasChildren = computed(() => item?.layers?.length > 0)
const hasLegend = computed(() => canBeAddedToTheMap.value && (!item.isExternal || item.abstract))

/**
 * Flag telling if this layer can be added to the map (so if the UI should include the necessary
 * element to do so)
 */
const canBeAddedToTheMap = computed(() => {
    // only groups of layers from our backends can't be added to the map
    return item && !(item instanceof GeoAdminGroupOfLayers)
})
const isPresentInActiveLayers = computed(() =>
    activeLayers.value.find((layer) => layer.getID() === item.getID())
)
const isCurrentlyHidden = computed(
    () =>
        isPresentInActiveLayers.value &&
        activeLayers.value.find((layer) => layer.getID() === item.getID() && !layer.visible)
)

// reacting to topic changes (some categories might need some auto-opening)
watch(openThemesIds, (newValue) => {
    showChildren.value = showChildren.value || newValue.indexOf(item.getID()) !== -1
})

// reading the current topic at startup and opening any required category
onMounted(() => {
    showChildren.value = openThemesIds.value.indexOf(item.getID()) !== -1
})

function startLayerPreview() {
    if (canBeAddedToTheMap.value) {
        store.dispatch('setPreviewLayer', item)
    }
}

function addLayer() {
    // if this is a group of a layer then simply add it to the map
    const matchingActiveLayer = store.getters.getActiveLayerById(item.getID())
    if (matchingActiveLayer) {
        store.dispatch('toggleLayerVisibility', matchingActiveLayer)
    } else if (item.isExternal) {
        store.dispatch('addLayer', item)
    } else {
        store.dispatch('addLayer', new ActiveLayerConfig(item.getID(), true))
    }
}

function onItemClick() {
    if (canBeAddedToTheMap.value) {
        addLayer()
    } else if (hasChildren.value) {
        showChildren.value = !showChildren.value
    }
}

function onCollapseClick() {
    showChildren.value = !showChildren.value
}

function onCheckboxClick() {
    addLayer()
}

function zoomToLayer() {
    log.debug(`Zoom to layer ${item.name}`, item.extent)
    store.dispatch('zoomToExtent', item.extent)
}
</script>

<template>
    <div class="menu-catalogue-item" data-cy="catalogue-tree-item">
        <div
            class="menu-catalogue-item-title ps-2"
            :class="{ group: hasChildren }"
            :data-cy="`catalogue-tree-item-${item.getID()}`"
            @click="onItemClick"
            @mouseenter="startLayerPreview"
        >
            <button
                v-if="hasChildren"
                class="btn btn-rounded"
                :class="{
                    'btn-lg': !compact,
                }"
                @click.stop="onCollapseClick"
            >
                <FontAwesomeLayers>
                    <FontAwesomeIcon class="text-secondary" icon="fa-regular fa-circle" />
                    <FontAwesomeIcon size="xs" :icon="showChildren ? 'minus' : 'plus'" />
                </FontAwesomeLayers>
            </button>
            <button
                v-if="canBeAddedToTheMap"
                class="btn"
                :class="{
                    'text-primary': isPresentInActiveLayers || isCurrentlyHidden,
                    'btn-lg': !compact,
                }"
                @click.stop="onCheckboxClick"
            >
                <FontAwesomeIcon
                    :icon="`far ${
                        isPresentInActiveLayers && !isCurrentlyHidden
                            ? 'fa-check-square'
                            : 'fa-square'
                    }`"
                />
            </button>
            <span
                class="menu-catalogue-item-name"
                :class="{ 'text-primary': isPresentInActiveLayers || isCurrentlyHidden }"
                >{{ item.name }}</span
            >
            <button v-if="item.extent?.length" class="btn" @click.stop="zoomToLayer">
                <FontAwesomeIcon icon="fa fa-search-plus" />
            </button>
            <button
                v-if="hasLegend"
                class="btn"
                :class="{ 'btn-lg': !compact }"
                data-cy="catalogue-tree-item-info"
                @click.stop="showLayerLegend = true"
            >
                <FontAwesomeIcon icon="info-circle" />
            </button>
        </div>
        <CollapseTransition :duration="200">
            <ul
                v-show="showChildren"
                class="menu-catalogue-item-children"
                :class="`ps-${2 + depth}`"
            >
                <LayerCatalogueItem
                    v-for="child in item.layers"
                    :key="`${child.getID()}`"
                    :item="child"
                    :depth="depth + 1"
                    :compact="compact"
                />
            </ul>
        </CollapseTransition>
        <LayerLegendPopup v-if="showLayerLegend" :layer="item" @close="showLayerLegend = false" />
    </div>
</template>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
@import 'src/modules/menu/scss/menu-items';

.menu-catalogue-item {
    border-bottom: none;

    &-title {
        @extend .menu-title;
        cursor: pointer;
        &.active {
            color: $primary;
        }
        border-bottom-width: 1px;
        border-bottom-color: $gray-400;
        &.group {
            border-bottom-style: solid;
        }
        &:not(.group) {
            border-bottom-style: dashed;
        }
    }
}
.menu-catalogue-item-title:hover {
    background-color: $list-item-hover-bg-color;
}
.menu-catalogue-item-name {
    @extend .menu-name;
}
.menu-catalogue-item-children {
    @extend .menu-list;
}
</style>
