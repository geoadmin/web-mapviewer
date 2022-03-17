<template>
    <li
        class="menu-topic-item"
        :class="[
            `menu-topic-item-${item.type.toLowerCase()}`,
            { 'menu-topic-item-active': isActive, compact: compact },
        ]"
        data-cy="topic-tree-item"
    >
        <div class="menu-topic-item-title" :data-cy="`topic-tree-item-${item.id}`" @click="onClick">
            <ButtonWithIcon
                :button-font-awesome-icon="showHideIcon"
                :class="{
                    'text-danger': isActive || isHidden,
                    'menu-topic-item-folder': isTheme,
                }"
                :large="!compact"
                :square="isTheme"
            />
            <span class="menu-topic-item-name">{{ item.name }}</span>
        </div>
        <CollapseTransition :duration="200">
            <ul v-if="showChildren" class="menu-topic-item-children" :class="`ps-${2 + 2 * depth}`">
                <MenuTopicTreeItem
                    v-for="child in item.children"
                    :key="`${child.id}-${child.name}`"
                    :item="child"
                    :active-layers="activeLayers"
                    :depth="depth + 1"
                    :compact="compact"
                    @click-on-layer-topic-item="(layerId) => bubbleEventToParent(layerId)"
                />
            </ul>
        </CollapseTransition>
    </li>
</template>

<script>
// importing directly the vue component, see https://github.com/ivanvermeyen/vue-collapse-transition/issues/5
import CollapseTransition from '@ivanv/vue-collapse-transition/src/CollapseTransition.vue'
import { topicTypes } from '@/api/topics.api'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'

/**
 * Node of the topic tree in the UI, rendering (and behavior) will differ if this is a theme or a
 * layer. Emits event about user interaction (and does not interact directly with the store, that's
 * the parent component's responsibility)
 */
export default {
    name: 'MenuTopicTreeItem',
    components: {
        CollapseTransition,
        ButtonWithIcon,
    },
    props: {
        item: {
            type: Object,
            required: true,
        },
        activeLayers: {
            type: Array,
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
    },
    emits: ['clickOnLayerTopicItem'],
    data() {
        return {
            showChildren: false,
        }
    },
    computed: {
        showHideIcon() {
            if (this.item.type === topicTypes.THEME) {
                if (this.showChildren) {
                    return ['fas', 'minus']
                } else {
                    return ['fas', 'plus']
                }
            } else {
                if (this.isActive && !this.isHidden) {
                    return ['far', 'check-square']
                } else {
                    return ['far', 'square']
                }
            }
        },
        isActive() {
            return (
                this.item.type === topicTypes.LAYER &&
                this.activeLayers.find((layer) => layer.getID() === this.item.layerId)
            )
        },
        isHidden() {
            return (
                this.isActive &&
                this.activeLayers.find(
                    (layer) => layer.getID() === this.item.layerId && !layer.visible
                )
            )
        },
        isTheme() {
            return this.item.type === 'THEME'
        },
    },
    methods: {
        onClick() {
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

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
@import 'src/modules/menu/scss/menu-items';

.menu-topic-item {
    border-bottom: none;
}
.menu-topic-item-title {
    @extend .menu-title;
    cursor: pointer;
    .menu-topic-item-active & {
        color: $red;
    }
    .menu-topic-item-theme & {
        border-bottom: 1px solid $gray-400;
    }
    .menu-topic-item-layer & {
        border-bottom: 1px dashed $gray-400;
    }
}
.menu-topic-item-folder {
    width: 1rem;
    height: 1rem;
    box-shadow: 0 0 2px #c7c7c7;
    border: 1px solid #afafaf;
    border-radius: 50%;
    justify-content: center;
    font-size: 0.625rem;
}
.menu-topic-item-name {
    @extend .menu-name;
}
.menu-topic-item-children {
    @extend .menu-list;
}
</style>
