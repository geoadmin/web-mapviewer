<template>
    <MenuSection
        v-if="currentTopic"
        :title="$t(currentTopic.id)"
        :show-content="showTopicTree"
        data-cy="menu-topic-section"
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
                @click-on-layer-topic-item="onClickOnLayerTopicItem"
            />
        </ul>
    </MenuSection>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuTopicTreeItem from '@/modules/menu/components/topics/MenuTopicTreeItem.vue'
import MenuTopicSelectionPopup from '@/modules/menu/components/topics/MenuTopicSelectionPopup.vue'

/** Menu section for topics, responsible to communicate user interactions on topics with the store */
export default {
    components: { MenuTopicSelectionPopup, MenuTopicTreeItem, MenuSection },
    props: {
        compact: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
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
        ...mapGetters(['visibleLayers', 'getActiveLayerById', 'isDefaultTopic']),
        showTopicTree() {
            // We only want the topic tree open whenever the user has chosen a different topic
            // than the default one (it can be opened by the user by a click on it, but by default it's closed)
            return !this.isDefaultTopic
        },
    },
    methods: {
        ...mapActions(['addLayer', 'toggleLayerVisibility', 'setLayerVisibility', 'changeTopic']),
        setShowTopicSelectionPopup() {
            this.showTopicSelectionPopup = true
        },
        onClickOnLayerTopicItem(layerId) {
            const layer = this.getActiveLayerById(layerId)
            if (layer) {
                this.toggleLayerVisibility(layerId)
            } else {
                this.addLayer(layerId).then(() =>
                    this.setLayerVisibility({ layerId, visible: true })
                )
            }
        },
        selectTopic(topic) {
            this.changeTopic(topic)
            this.showTopicSelectionPopup = false
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/modules/menu/scss/menu-items';

.menu-topic-list {
    @extend .menu-list;
    max-height: 50vh;
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
