<script setup lang="ts">
/**
 * Component that maps the active layers from the state to the menu (and also forwards user
 * interactions to the state)
 */

import type { Layer } from '@swissgeo/layers'

import log from '@swissgeo/log'
import Sortable from 'sortablejs'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

import type { ActionDispatcher } from '@/store/types'

import MenuActiveLayersListItem from '@/modules/menu/components/activeLayers/MenuActiveLayersListItem.vue'
import LayerDescriptionPopup from '@/modules/menu/components/LayerDescriptionPopup.vue'
import useLayersStore from '@/store/modules/layers'

const dispatcher: ActionDispatcher = { name: 'MenuActiveLayersList.vue' }

const { compact } = defineProps<{
    compact: boolean
}>()

const activeLayersList = useTemplateRef<HTMLDivElement>('activeLayersList')

// used to deactivate the hover change of color on layer whenever one of them is dragged
const aLayerIsDragged = ref<boolean>(false)
const showLayerDetailIndex = ref<number | undefined>()
const layerDetailFocusMoveButton = ref<'up' | 'down' | undefined>()
const showDescriptionForLayerId = ref<string | undefined>()

const layersStore = useLayersStore()

// Users are used to have layers ordered top to bottom (the first layer is on top), but we store them in the opposite order.
// So here we swap the order of this array to match the desired order on the UI
const activeLayers = computed<Layer[]>(() => layersStore.activeLayers.slice().reverse())
const reverseIndex = (index: number) => layersStore.activeLayers.length - 1 - index

let sortable: Sortable | undefined

const initSortable = () => {
    if (!activeLayersList.value) {
        return
    }

    sortable = Sortable.create(activeLayersList.value, {
        delay: 250,
        delayOnTouchOnly: true,
        touchStartThreshold: 3,
        animation: 150,
        direction: 'vertical',
        handle: '.menu-layer-item-title',
        onStart: function () {
            aLayerIsDragged.value = true
        },
        onEnd: function (event) {
            aLayerIsDragged.value = false
            const { newIndex, oldIndex } = event
            if (
                newIndex !== undefined &&
                oldIndex !== undefined &&
                newIndex >= 0 &&
                newIndex < activeLayers.value.length &&
                oldIndex >= 0 &&
                oldIndex < activeLayers.value.length
            ) {
                onMoveLayer(reverseIndex(oldIndex), reverseIndex(newIndex))

                nextTick(() => {
                    if (!activeLayersList.value) {
                        return
                    }

                    // PB-1456: fixing an issue with drag&drop left-over by removing any element still tagged by SortableJS
                    // (having a custom attribute draggable=false and drag-in-progress class)
                    const nonDraggableChildren = activeLayersList.value.querySelectorAll(
                        '.menu-layer-item.drag-in-progress[draggable="false"]'
                    )

                    if (nonDraggableChildren.length > 0) {
                        if (activeLayers.value.length < activeLayersList.value.children.length) {
                            nonDraggableChildren.forEach((child) => child.remove())
                            log.debug({
                                title: 'MenuActiveLayersList.vue',
                                messages: ['Non-draggable children removed:', nonDraggableChildren],
                            })
                        } else {
                            log.debug({
                                title: 'MenuActiveLayersList.vue',
                                messages: [
                                    'Number of children does not exceed the number of active layers, no elements removed',
                                ],
                            })
                        }
                    } else {
                        log.debug({
                            title: 'MenuActiveLayersList.vue',
                            messages: ['No non-draggable children found'],
                        })
                    }
                }).catch((error) => {
                    log.error({
                        title: 'MenuActiveLayersList.vue',
                        messages: ['Error while removing non-draggable children', error],
                    })
                })
            } else {
                log.warn({
                    title: 'MenuActiveLayersList.vue',
                    messages: ['Invalid index for layer move', { newIndex, oldIndex }],
                })
            }
        },
    })
}

onMounted(() => {
    initSortable()
})

onBeforeUnmount(() => {
    sortable?.destroy()
})

function onMoveLayer(oldIndex: number, newIndex: number) {
    if (newIndex !== oldIndex) {
        if (showLayerDetailIndex.value === oldIndex) {
            showLayerDetailIndex.value = newIndex
            layerDetailFocusMoveButton.value = oldIndex < newIndex ? 'up' : 'down'
        }

        layersStore.moveActiveLayerToIndex(oldIndex, newIndex, dispatcher)
    }
}

function onToggleLayerDetail(index: number) {
    if (showLayerDetailIndex.value === index) {
        showLayerDetailIndex.value = undefined
    } else {
        showLayerDetailIndex.value = index
    }
}
</script>

<template>
    <div>
        <div
            v-show="activeLayers.length > 0"
            ref="activeLayersList"
            data-cy="menu-section-active-layers"
            class="menu-layer-list"
        >
            <MenuActiveLayersListItem
                v-for="(layer, index) in activeLayers"
                :key="`${reverseIndex(index)}-${layer.id}`"
                :index="reverseIndex(index)"
                :layer="layer"
                :is-top-layer="index === 0"
                :is-bottom-layer="reverseIndex(index) === 0"
                :compact="compact"
                :data-layer-id="layer.id"
                :class="{ 'drag-in-progress': aLayerIsDragged }"
                :show-layer-detail="showLayerDetailIndex === reverseIndex(index)"
                :focus-move-button="layerDetailFocusMoveButton"
                @show-layer-description-popup="showDescriptionForLayerId = layer.id"
                @toggle-layer-detail="onToggleLayerDetail"
                @move-layer="onMoveLayer"
            >
                <LayerDescriptionPopup
                    v-if="showDescriptionForLayerId === layer.id"
                    :layer="layer"
                    @close="showDescriptionForLayerId = undefined"
                />
            </MenuActiveLayersListItem>
        </div>
        <div
            v-show="activeLayers.length === 0"
            class="p-1 ps-3"
            data-cy="menu-section-no-layers"
        >
            -
        </div>
    </div>
</template>
