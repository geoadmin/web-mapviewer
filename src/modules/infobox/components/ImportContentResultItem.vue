<template>
    <div class="import-list-item" data-cy="topic-tree-item">
        <div
            class="import-list-item-title"
            @click="onItemClick"
            @mouseenter="startResultPreview"
            @mouseleave="stopResultPreview"
        >
            <div v-if="depth > 0" class="vr"></div>
            <button class="btn d-flex align-items-center zoom-btn">
                <FontAwesomeIcon icon="fa fa-search-plus" />
                <div class="vr ms-2"></div>
            </button>
            <button
                class="btn d-flex align-items-center"
                :class="{
                    'btn-rounded': isGroup,
                }"
                @click="toggleItem"
            >
                <FontAwesomeLayers v-if="isGroup">
                    <FontAwesomeIcon class="text-secondary" icon="fa-regular fa-circle" />
                    <FontAwesomeIcon size="xs" :icon="showChildren ? 'minus' : 'plus'" />
                </FontAwesomeLayers>
            </button>
            <span class="import-list-item-name">{{ item.name }}</span>
        </div>
        <CollapseTransition :duration="200">
            <div
                v-show="showChildren"
                class="import-list-item-children"
                :class="`ps-${4 + 2 * depth}`"
            >
                <ImportContentResultItem
                    v-for="(layer, index) in item.layers"
                    :key="`${index}-${layer.externalLayerId}`"
                    :item="layer"
                    :depth="depth + 1"
                    @click-on-item="bubbleEvent('clickOnItem', $event)"
                    @preview-start="bubbleEvent('previewStart', $event)"
                    @preview-stop="bubbleEvent('previewStop', $event)"
                />
            </div>
        </CollapseTransition>
    </div>
</template>

<script>
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
// importing directly the vue component, see https://github.com/ivanvermeyen/vue-collapse-transition/issues/5
import CollapseTransition from '@ivanv/vue-collapse-transition/src/CollapseTransition.vue'
import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
/** Todo add description */
export default {
    name: 'ImportContentResultItem',
    components: {
        FontAwesomeLayers,
        FontAwesomeIcon,
        CollapseTransition,
    },
    props: {
        item: {
            type: Object,
            required: true,
        },
        depth: {
            type: Number,
            default: 0,
        },
    },
    emits: ['clickOnItem', 'previewStart', 'previewStop'],
    data() {
        return {
            showChildren: false,
        }
    },
    computed: {
        isLayer() {
            return this.item instanceof ExternalWMSLayer || this.item instanceof ExternalWMTSLayer
        },
        isGroup() {
            return this.item instanceof ExternalGroupOfLayers
        },
    },
    methods: {
        toggleItem() {
            this.showChildren = !this.showChildren
        },
        onItemClick() {
            if (this.isLayer) this.$emit('clickOnItem', this.item.externalLayerId)
        },
        startResultPreview() {
            this.$emit('previewStart', this.item.externalLayerId)
        },
        stopResultPreview() {
            this.$emit('previewStop')
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

.import-list-item {
    border-bottom: none;
    .btn {
        border: none;
    }
}
.import-list-item-title {
    @extend .menu-title;
    cursor: pointer;
    .import-list-item-active & {
        color: $primary;
    }
    .import-list-item-theme & {
        border-bottom: 1px solid $gray-400;
    }
    .import-list-item-layer & {
        border-bottom: 1px dashed $gray-400;
    }
}
.import-list-item-name {
    @extend .menu-name;
    text-overflow: ellipsis;
}
.import-list-item-children {
    @extend .menu-list;
    border-top: 1px solid $gray-400;
    background: white;
}
.zoom-btn:active {
    transform: scale(1.2);
}
</style>
