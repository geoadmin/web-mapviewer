<script setup>
/**
 * Node of a layer catalogue in the UI, rendering (and behavior) will differ if this is a group of
 * layers or a single layer.
 */

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// importing directly the vue component, see https://github.com/ivanvermeyen/vue-collapse-transition/issues/5
import CollapseTransition from '@ivanv/vue-collapse-transition/src/CollapseTransition.vue'
import booleanContains from '@turf/boolean-contains'
import { polygon } from '@turf/helpers'
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import AbstractLayer from '@/api/layers/AbstractLayer.class'
import GeoAdminGroupOfLayers from '@/api/layers/GeoAdminGroupOfLayers.class'
import LayerLegendPopup from '@/modules/menu/components/LayerLegendPopup.vue'
import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'
import TextTruncate from '@/utils/components/TextTruncate.vue'
import { LV95 } from '@/utils/coordinates/coordinateSystems'
import { ActiveLayerConfig } from '@/utils/layerUtils'
import log from '@/utils/logging'

const props = defineProps({
    item: {
        type: AbstractLayer,
        required: true,
    },
    search: {
        type: String,
        default: '',
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
const { item, compact, depth, search } = toRefs(props)

// Declaring own properties (ex-data)

const showChildren = ref(false)
const showLayerLegend = ref(false)

// Mapping the store to the component
const store = useStore()

const showItem = computed(() => {
    if (search.value) {
        if (item.value.name.toLowerCase().includes(search.value)) {
            return true
        }
        if (hasChildren.value) {
            return hasChildrenMatchSearch.value
        }
        return false
    }
    return true
})
const activeLayers = computed(() => store.state.layers.activeLayers)
const openThemesIds = computed(() => store.state.topics.openedTreeThemesIds)

const hasChildren = computed(() => item.value?.layers?.length > 0)
const hasLegend = computed(() => canBeAddedToTheMap.value && item.value?.hasLegend)
const isPhoneMode = computed(() => store.getters.isPhoneMode)

/**
 * Flag telling if one of the children (deep search) match the search text When no search text is
 * given it return true if the item has children
 */
const hasChildrenMatchSearch = computed(() => {
    if (search.value) {
        if (hasChildren.value) {
            return containsLayer(item.value.layers, search.value)
        }
        return false
    }
    return false
})

/**
 * Flag telling if this layer can be added to the map (so if the UI should include the necessary
 * element to do so)
 */
const canBeAddedToTheMap = computed(() => {
    // only groups of layers from our backends can't be added to the map
    return item.value && !(item.value instanceof GeoAdminGroupOfLayers)
})
const isPresentInActiveLayers = computed(() =>
    activeLayers.value.find((layer) => layer.getID() === item.value.getID())
)

// reacting to topic changes (some categories might need some auto-opening)
watch(openThemesIds, (newValue) => {
    showChildren.value = showChildren.value || newValue.indexOf(item.value.getID()) !== -1
})
// When search text is entered, update the children collapsing if needed.
watch(hasChildrenMatchSearch, (newValue) => {
    showChildren.value = newValue
})

// reading the current topic at startup and opening any required category
onMounted(() => {
    showChildren.value = openThemesIds.value.indexOf(item.value.getID()) !== -1
})

function startLayerPreview() {
    if (canBeAddedToTheMap.value) {
        store.dispatch('setPreviewLayer', item.value)
    }
}

function addRemoveLayer() {
    // if this is a group of a layer then simply add it to the map
    const matchingActiveLayer = store.getters.getActiveLayerById(item.value.getID())
    if (matchingActiveLayer) {
        store.dispatch('removeLayer', matchingActiveLayer)
    } else if (item.value.isExternal) {
        store.dispatch('addLayer', item.value)
    } else {
        store.dispatch('addLayer', new ActiveLayerConfig(item.value.getID(), true))
    }
}

function onItemClick() {
    if (canBeAddedToTheMap.value) {
        addRemoveLayer()
    } else if (hasChildren.value) {
        showChildren.value = !showChildren.value
    }
}

function onCollapseClick() {
    showChildren.value = !showChildren.value
}

function transformExtentIntoPolygon(flattenExtent) {
    return polygon([
        [
            [flattenExtent[0], flattenExtent[1]],
            [flattenExtent[0], flattenExtent[3]],
            [flattenExtent[2], flattenExtent[3]],
            [flattenExtent[2], flattenExtent[1]],
            [flattenExtent[0], flattenExtent[1]],
        ],
    ])
}

const lv95Extent = [LV95.bounds.bottomLeft, LV95.bounds.topRight]
function zoomToLayer() {
    // TODO PB-243 better handling of layers extent errors
    // - extent totally out of projection bounds
    //    => layer should be marked as out of bounds and disabled, no zoom to layer icon
    //       but an error icon with reason
    // - extent totally inside of projection bounds
    //   => current behavior, maybe add a warning icon about partial layer display
    // - extent partially inside projection bounds
    //   => take intersection as extent, maybe add a warning icon about partial layer display
    // - no extent
    //   => add a warning that the layer might be out of bound
    log.debug(`Zoom to layer ${item.value.name}`, item.value.extent)
    // Only zooming to layer's extent if its extent is entirely within LV95 extent.
    // If part (or all) of the extent is outside LV95 extent, we zoom to LV95 extent instead.
    if (
        booleanContains(
            transformExtentIntoPolygon(lv95Extent.flat()),
            transformExtentIntoPolygon(item.value.extent.flat())
        )
    ) {
        store.dispatch('zoomToExtent', item.value.extent)
    } else {
        store.dispatch('zoomToExtent', lv95Extent)
    }
    if (isPhoneMode.value) {
        // On mobile phone we close the menu so that the user can see the zoom to extent
        store.dispatch('toggleMenu')
    }
}

/**
 * Return true if at least one of the layers or sub-layers name match the given text
 *
 * @param {[AbstractLayer]} layers List of abstract layers
 * @param {string} searchText Text to search
 * @returns {bool} True if at least on name match, false otherwise
 */
function containsLayer(layers, searchText) {
    let match = false
    for (let i = 0; i < layers.length && !match; i++) {
        const layer = layers[i]
        if (layer.name.toLowerCase().includes(searchText)) {
            match = true
        }
        if (layer.layers?.length) {
            match = containsLayer(layer.layers, searchText)
        }
    }
    return match
}
</script>

<template>
    <div v-show="showItem" class="menu-catalogue-item" data-cy="catalogue-tree-item">
        <div
            class="menu-catalogue-item-title ps-2"
            :class="{ group: hasChildren }"
            :data-cy="`catalogue-tree-item-${item.getID()}`"
            @click="onItemClick"
            @mouseenter="startLayerPreview"
        >
            <button
                v-if="canBeAddedToTheMap"
                class="btn"
                :class="{
                    'text-primary': isPresentInActiveLayers,
                    'btn-lg': !compact,
                }"
                @click.stop="addRemoveLayer()"
            >
                <FontAwesomeIcon
                    :icon="`far ${isPresentInActiveLayers ? 'fa-check-square' : 'fa-square'}`"
                />
            </button>
            <button
                v-if="hasChildren"
                class="btn btn-rounded"
                :class="{
                    'text-primary': isPresentInActiveLayers,
                    'btn-lg': !compact,
                }"
                @click.stop="onCollapseClick"
            >
                <!-- TODO change to the regular icons once we have bought fontawesome fonts -->
                <FontAwesomeIcon :icon="['fas', showChildren ? 'circle-minus' : 'circle-plus']" />
            </button>

            <TextTruncate
                :text="item.name"
                class="menu-catalogue-item-name"
                :class="{ 'text-primary': isPresentInActiveLayers }"
            >
                <TextSearchMarker :text="item.name" :search="search" />
            </TextTruncate>
            <button
                v-if="item.extent?.length"
                class="btn"
                :class="{ 'btn-lg': !compact }"
                data-cy="catalogue-zoom-extent-button"
                @click.stop="zoomToLayer"
            >
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
                    :search="search"
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
.menu-catalogue-item-title {
    @extend .menu-item;
}
.menu-catalogue-item-name {
    @extend .menu-name;
}
.menu-catalogue-item-children {
    @extend .menu-list;
}
</style>
