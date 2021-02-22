<template>
    <div class="menu-topic-tree-item" :class="{ active: isActive }">
        <div
            class="menu-list-item-title"
            :class="`menu-tree-item-${item.type.toLowerCase()}`"
            @click="onClick"
        >
            <button class="btn btn-default" :class="{ 'text-danger': isActive }">
                <font-awesome-icon size="lg" :icon="showHideIcon" />
            </button>
            <span class="menu-item-name">{{ item.name }}</span>
        </div>
        <div v-show="showChildren" class="menu-tree-children pl-2">
            <MenuTopicTreeItem
                v-for="child in item.children"
                :key="`${child.id}-${child.name}`"
                :item="child"
                :is-active-function="isActiveFunction"
                @clickOnLayerTopicItem="(layerId) => bubbleEventToParent(layerId)"
            />
        </div>
    </div>
</template>
<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
@import '../../scss/menu-items';
.menu-topic-tree-item {
    @extend .menu-list-item;
    border-bottom: none;
    cursor: pointer;
    &.active {
        color: $red;
    }
    .menu-tree-item-theme {
        border-bottom: 1px solid #e9e9e9;
    }
    .menu-tree-item-layer {
        border-bottom: 1px dashed #e9e9e9;
    }
    .menu-tree-children {
        display: block;
    }
}
</style>
<script>
import { topicTypes } from '@/api/topics.api'

/**
 * Node of the topic tree in the UI, rendering (and behavior) will differ if this is a theme or a
 * layer. Emits event about user interaction (and does not interact directly with the store, that's
 * the parent component's responsibility)
 */
export default {
    name: 'MenuTopicTreeItem',
    props: {
        item: {
            type: Object,
            required: true,
        },
        isActiveFunction: {
            type: Function,
            required: true,
        },
    },
    data() {
        return {
            showChildren: false,
        }
    },
    computed: {
        showHideIcon: function () {
            if (this.item.type === topicTypes.THEME) {
                if (this.showChildren) {
                    return ['fas', 'minus-circle']
                } else {
                    return ['fas', 'plus-circle']
                }
            } else {
                if (this.isActive) {
                    return ['far', 'check-square']
                } else {
                    return ['far', 'square']
                }
            }
        },
        isActive: function () {
            return this.item.type === topicTypes.LAYER && this.isActiveFunction(this.item)
        },
    },
    methods: {
        onClick: function () {
            if (this.item.type === topicTypes.THEME) {
                this.showChildren = !this.showChildren
            } else {
                this.$emit('clickOnLayerTopicItem', this.item.layerId)
            }
        },
        /**
         * As we can have recursive component (see template), we have to bubble up user interaction
         * events, otherwise the event get stuck mid course and never reaches the parent that can
         * interact with the store
         *
         * @param {String} layerId The ID of the layer that has been clicked in the topic tree
         */
        bubbleEventToParent: function (layerId) {
            this.$emit('clickOnLayerTopicItem', layerId)
        },
    },
}
</script>
