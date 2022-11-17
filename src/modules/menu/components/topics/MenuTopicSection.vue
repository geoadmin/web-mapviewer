<template>
    <MenuSection
        v-if="currentTopic"
        ref="menuTopicSection"
        :title="$t(currentTopic.id)"
        :show-content="showTopicTree"
        data-cy="menu-topic-section"
        @open-menu-section="(id) => $emit('openMenuSection', id)"
    >
        <template #extra-button>
            <button
                class="menu-topic-switch"
                data-cy="change-topic-button"
                @click.stop="setShowTopicSelectionPopup"
            >
                {{ $t('choose_theme') }}
            </button>
            <MenuTopicSelectionPopup
                v-if="showTopicSelectionPopup"
                :topics="allTopics"
                @select-topic="selectTopic"
                @close="showTopicSelectionPopup = false"
            />
        </template>
        <ul class="menu-topic-list" data-cy="menu-topic-tree">
            <MenuTopicTreeItem
                v-for="item in currentTopicTree"
                :key="item.name"
                :item="item"
                :active-layers="activeLayers"
                :compact="compact"
                @click-on-topic-item="onClickTopicItem"
                @click-on-layer-info="onClickLayerInfo"
                @preview-start="setPreviewLayer"
                @preview-stop="clearPreviewLayer"
            />
        </ul>
        <LayerLegendPopup
            v-if="showLayerInfoFor"
            :layer-id="showLayerInfoFor"
            @close="showLayerInfoFor = null"
        />
    </MenuSection>
</template>

<script>
import LayerLegendPopup from '@/modules/menu/components/LayerLegendPopup.vue'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuTopicSelectionPopup from '@/modules/menu/components/topics/MenuTopicSelectionPopup.vue'
import MenuTopicTreeItem from '@/modules/menu/components/topics/MenuTopicTreeItem.vue'
import { mapActions, mapGetters, mapState } from 'vuex'

/** Menu section for topics, responsible to communicate user interactions on topics with the store */
export default {
    components: {
        LayerLegendPopup,
        MenuTopicSelectionPopup,
        MenuTopicTreeItem,
        MenuSection,
    },
    props: {
        compact: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['openMenuSection'],
    expose: ['close'],
    data() {
        return {
            showLayerInfoFor: null,
            showTopicSelectionPopup: false,
        }
    },
    computed: {
        ...mapState({
            currentTopic: (state) => state.topics.current,
            currentTopicTree: (state) => state.topics.tree,
            allTopics: (state) => state.topics.config,
            activeLayers: (state) => state.layers.activeLayers,
        }),
        ...mapGetters(['getActiveLayerById', 'isDefaultTopic']),
        showTopicTree() {
            // We only want the topic tree open whenever the user has chosen a different topic
            // than the default one (it can be opened by the user by a click on it, but by default it's closed)
            return !this.isDefaultTopic
        },
    },
    methods: {
        ...mapActions([
            'addLayer',
            'toggleLayerVisibility',
            'setLayerVisibility',
            'changeTopic',
            'setPreviewLayer',
            'clearPreviewLayer',
        ]),
        setShowTopicSelectionPopup() {
            this.showTopicSelectionPopup = true
        },
        selectTopic(topic) {
            this.changeTopic(topic)
            this.showTopicSelectionPopup = false
        },
        onClickTopicItem(layerId) {
            const layer = this.getActiveLayerById(layerId)
            if (layer) {
                this.toggleLayerVisibility(layerId)
            } else {
                this.addLayer(layerId)
                this.setLayerVisibility({ layerId, visible: true })
            }
        },
        onClickLayerInfo(layerId) {
            this.showLayerInfoFor = layerId
        },
        close() {
            this.$refs.menuTopicSection.close()
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/modules/menu/scss/menu-items';

.menu-topic-list {
    @extend .menu-list;
    overflow-y: auto;
}
.menu-topic-switch {
    border: 0;
    background: none;
    padding: 0;
    font: inherit;
    color: inherit;
    outline: inherit;
    &:hover,
    &:focus {
        text-decoration: underline;
    }
}
</style>
