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
import LayerDescriptionPopup from '@/modules/menu/components/LayerDescriptionPopup.vue'
import TextSearchMarker from '@/utils/components/TextSearchMarker.vue'
import TextTruncate from '@/utils/components/TextTruncate.vue'
import { LV95 } from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'LayerCatalogueItem.vue' }

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
    isTopic: {
        type: Boolean,
        default: false,
    },
})
const { item, compact, depth, search, isTopic } = toRefs(props)

// Declaring own properties (ex-data)

const showChildren = ref(false)
const showLayerDescription = ref(false)

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

const hasChildren = computed(() => item.value?.layers?.length > 0)
const hasDescription = computed(() => canBeAddedToTheMap.value && item.value?.hasDescription)
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
const isPresentInActiveLayers = computed(() => {
    const layers = store.getters.getActiveLayersById(
        item.value.id,
        item.value.isExternal,
        item.value.baseUrl
    )
    return layers.length > 0
})

// When search text is entered, update the children collapsing if needed.
watch(hasChildrenMatchSearch, (newValue) => {
    showChildren.value = newValue
})
if (isTopic.value) {
    const openThemesIds = computed(() => store.state.topics.openedTreeThemesIds)

    // reacting to topic changes (some categories might need some auto-opening)
    watch(openThemesIds, (newValue) => {
        showChildren.value = showChildren.value || newValue.indexOf(item.value.id) !== -1
    })
    watch(showChildren, (newValue) => {
        if (newValue) {
            store.dispatch('addTopicTreeOpenedThemeId', { themeId: item.value.id, ...dispatcher })
        } else {
            store.dispatch('removeTopicTreeOpenedThemeId', {
                themeId: item.value.id,
                ...dispatcher,
            })
        }
    })

    // reading the current topic at startup and opening any required category
    onMounted(() => {
        showChildren.value = openThemesIds.value.indexOf(item.value.id) !== -1
    })
}

function startLayerPreview() {
    if (canBeAddedToTheMap.value) {
        store.dispatch('setPreviewLayer', {
            layer: item.value,
            ...dispatcher,
        })
    }
}

function stopLayerPreview() {
    store.dispatch('setPreviewLayer', {
        layer: null,
        ...dispatcher,
    })
}

function addRemoveLayer() {
    // if this is a group of a layer then simply add it to the map
    const layers = store.getters.getActiveLayersById(
        item.value.id,
        item.value.isExternal,
        item.value.baseUrl
    )
    if (layers.length > 0) {
        store.dispatch('removeLayer', {
            layerId: item.value.id,
            isExternal: item.value.isExternal,
            baseUrl: item.value.baseUrl,
            ...dispatcher,
        })
    } else if (item.value.isExternal) {
        store.dispatch('addLayer', {
            layer: item.value,
            ...dispatcher,
        })
    } else {
        store.dispatch('addLayer', {
            layerConfig: { id: item.value.id, visible: true },
            ...dispatcher,
        })
    }
    stopLayerPreview()
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
        store.dispatch('zoomToExtent', { extent: item.value.extent, ...dispatcher })
    } else {
        store.dispatch('zoomToExtent', { extent: lv95Extent, ...dispatcher })
    }
    if (isPhoneMode.value) {
        // On mobile phone we close the menu so that the user can see the zoom to extent
        store.dispatch('toggleMenu', dispatcher)
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
    <div
        v-show="showItem"
        class="menu-catalogue-item"
        :class="{ compact: compact }"
        :data-cy="`catalogue-tree-item-${item.id}`"
    >
        <div
            class="menu-catalogue-item-title ps-2"
            :class="{ group: hasChildren }"
            :data-cy="`catalogue-tree-item-title-${item.id}`"
            @click="onItemClick"
            @mouseenter="startLayerPreview"
        >
            <button
                v-if="canBeAddedToTheMap"
                class="btn border-0 d-flex align-items-center"
                :class="{
                    'text-primary': isPresentInActiveLayers,
                    'btn-lg': !compact,
                }"
                :data-cy="`catalogue-add-layer-button-${item.id}`"
                @click.stop="addRemoveLayer()"
            >
                <FontAwesomeIcon
                    :icon="`far ${isPresentInActiveLayers ? 'fa-check-square' : 'fa-square'}`"
                />
            </button>
            <button
                v-if="hasChildren"
                class="btn border-0 d-flex align-items-center"
                :class="{
                    'text-primary': isPresentInActiveLayers,
                    'btn-lg': !compact,
                }"
                :data-cy="`catalogue-collapse-layer-button-${item.id}`"
                @click.stop="onCollapseClick"
            >
                <FontAwesomeIcon :icon="['fas', showChildren ? 'caret-down' : 'caret-right']" />
            </button>

            <TextTruncate
                :text="item.name"
                class="menu-catalogue-item-name px-1"
                :class="{ 'text-primary': isPresentInActiveLayers }"
                :data-cy="`catalogue-tree-item-name-${item.id}`"
                :tippy-options="{ placement: isPhoneMode ? 'top' : 'right' }"
            >
                <TextSearchMarker :text="item.name" :search="search" />
            </TextTruncate>
            <button
                v-if="item.extent?.length"
                class="btn d-flex align-items-center"
                :class="{ 'btn-lg': !compact }"
                :data-cy="`catalogue-zoom-extent-button-${item.id}`"
                @click.stop="zoomToLayer"
            >
                <FontAwesomeIcon icon="fa fa-search-plus" />
            </button>
            <button
                v-if="hasDescription"
                class="btn d-flex align-items-center"
                :class="{ 'btn-lg': !compact }"
                :data-cy="`catalogue-tree-item-info-${item.id}`"
                @click.stop="showLayerDescription = true"
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
                    v-for="(child, index) in item.layers"
                    :key="`${index}-${child.id}`"
                    :item="child"
                    :search="search"
                    :depth="depth + 1"
                    :compact="compact"
                    :is-topic="isTopic"
                />
            </ul>
        </CollapseTransition>
        <LayerDescriptionPopup
            v-if="showLayerDescription"
            :layer="item"
            @close="showLayerDescription = false"
        />
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
@import '@/modules/menu/scss/menu-items';

.menu-catalogue-item {
    border-bottom: none;

    &-title {
        @extend .menu-title;
        cursor: pointer;
        border-bottom-width: 1px;
        border-bottom-color: $gray-400;
        &.active {
            color: $primary;
        }
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
