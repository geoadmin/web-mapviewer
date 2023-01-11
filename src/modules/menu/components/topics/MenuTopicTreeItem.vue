<template>
    <li
        class="menu-topic-item"
        :class="[
            `menu-topic-item-${item.type.toLowerCase()}`,
            { 'menu-topic-item-active': isActive, compact: compact },
        ]"
        data-cy="topic-tree-item"
    >
        <div
            class="menu-topic-item-title"
            :data-cy="`topic-tree-item-${item.id}`"
            @click="onItemClick"
            @mouseenter="startResultPreview"
            @mouseleave="stopResultPreview"
        >
            <ButtonWithIcon
                :button-font-awesome-icon="showHideIcon"
                :class="{
                    'text-danger': isActive || isHidden,
                }"
                :round="isTheme"
                :large="!compact"
            />
            <span class="menu-topic-item-name">{{ item.name }}</span>
            <ButtonWithIcon
                v-if="isLayer"
                data-cy="topic-tree-item-info"
                :button-font-awesome-icon="['fas', 'info-circle']"
                :large="!compact"
                transparent
                @click.stop="onInfoClick"
            />
        </div>
        <CollapseTransition :duration="200">
            <ul
                v-show="showChildren"
                class="menu-topic-item-children"
                :class="`ps-${2 + 2 * depth}`"
            >
                <MenuTopicTreeItem
                    v-for="child in item.children"
                    :key="`${child.id}-${child.name}`"
                    :item="child"
                    :active-layers="activeLayers"
                    :depth="depth + 1"
                    :compact="compact"
                    @click-on-topic-item="bubbleEvent('clickOnTopicItem', $event)"
                    @click-on-layer-info="bubbleEvent('clickOnLayerInfo', $event)"
                    @preview-start="bubbleEvent('previewStart', $event)"
                    @preview-stop="bubbleEvent('previewStop', $event)"
                />
            </ul>
        </CollapseTransition>
    </li>
</template>

<script>
import { topicTypes } from '@/api/topics.api'
import ButtonWithIcon from '@/utils/ButtonWithIcon.vue'
// importing directly the vue component, see https://github.com/ivanvermeyen/vue-collapse-transition/issues/5
import CollapseTransition from '@ivanv/vue-collapse-transition/src/CollapseTransition.vue'

/**
 * Node of the topic tree in the UI, rendering (and behavior) will differ if this is a theme or a
 * layer. Emits event about user interaction (and does not interact directly with the store, that's
 * the parent component's responsibility)
 */
export default {
    name: 'MenuTopicTreeItem',
    components: {
        ButtonWithIcon,
        CollapseTransition,
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
    emits: ['clickOnTopicItem', 'clickOnLayerInfo', 'previewStart', 'previewStop'],
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
        isLayer() {
            return this.item.type === topicTypes.LAYER
        },
        isActive() {
            return (
                this.isLayer &&
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
        onItemClick() {
            if (this.item.type === topicTypes.THEME) {
                this.showChildren = !this.showChildren
            } else {
                this.$emit('clickOnTopicItem', this.item.layerId)
            }
        },
        onInfoClick() {
            this.$emit('clickOnLayerInfo', this.item.layerId)
        },
        startResultPreview() {
            if (this.isLayer) {
                this.$emit('previewStart', this.item.layerId)
            }
        },
        stopResultPreview() {
            if (this.isLayer) {
                this.$emit('previewStop')
            }
        },
        /**
         * As we can have recursive component (see template), we have to bubble up user interaction
         * events, otherwise the event get stuck mid course and never reaches the parent that can
         * interact with the store
         */
        bubbleEvent(type, payload) {
            this.$emit(type, payload)
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
        color: $primary;
    }
    .menu-topic-item-theme & {
        border-bottom: 1px solid $gray-400;
    }
    .menu-topic-item-layer & {
        border-bottom: 1px dashed $gray-400;
    }
}
.menu-topic-item-name {
    @extend .menu-name;
}
.menu-topic-item-children {
    @extend .menu-list;
}
</style>
