<template>
    <MenuSection v-if="currentTopic" :title="$t(currentTopic.id)">
        <template v-slot:extra-button>
            <span @click="setShowTopicSelectionPopup">{{ $t('choose_theme') }}</span>
            <div
                v-show="showTopicSelectionPopup"
                class="menu-topic-selector-popup-container"
                @click="showTopicSelectionPopup = false"
            >
                <div class="menu-topic-selector-popup card">
                    <div class="card-header">
                        {{ $t('choose_theme') }}
                    </div>
                    <div class="card-body menu-topic-selector-popup-topic-list">
                        <div
                            v-for="topic in allTopics"
                            :key="topic.id"
                            class="topic"
                            @click="selectTopic(topic)"
                        >
                            <span class="topic-title">{{ $t(topic.id) }}</span>
                            <TopicIcon :topic-id="topic.id" />
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <div class="menu-topic-tree">
            <MenuTopicTreeItem
                v-for="item in currentTopicTree"
                :key="item.name"
                :item="item"
                :is-active-function="isLayerTreeItemActive"
                @clickOnLayerTopicItem="onClickOnLayerTopicItem"
            />
        </div>
    </MenuSection>
</template>
<style lang="scss">
.menu-topic-tree {
    max-height: 50vh;
    overflow-y: auto;
}
.menu-topic-selector-popup-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 500;
    display: flex;
    align-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    .menu-topic-selector-popup {
        width: 40rem;
        max-width: 95vw;
        top: 0;
        max-height: 80%;
        overflow-y: auto;
        margin: auto;
        background: white;
        * {
            text-align: left;
        }
        .menu-topic-selector-popup-topic-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-gap: 1rem 0.5rem;
            .topic {
                text-align: center;
                align-self: end;
            }
            .topic:last-child {
                padding-bottom: 1rem;
            }
        }
    }
}
</style>
<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { topicTypes } from '@/api/topics.api'
import MenuSection from '@/modules/menu/components/MenuSection'
import MenuTopicTreeItem from '@/modules/menu/components/topics/MenuTopicTreeItem'
import TopicIcon from '@/modules/menu/components/topics/TopicIcon'

/** Menu section for topics, responsible to communicate user interactions on topics with the store */
export default {
    components: { TopicIcon, MenuTopicTreeItem, MenuSection },
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
        }),
        ...mapGetters(['jointVisibleLayerIds', 'getLayerForId']),
    },
    methods: {
        ...mapActions(['addLayer', 'toggleLayerVisibility', 'changeTopic']),
        setShowTopicSelectionPopup: function () {
            this.showTopicSelectionPopup = true
        },
        isLayerTreeItemActive: function (item) {
            return (
                item.type === topicTypes.LAYER &&
                this.jointVisibleLayerIds.indexOf(item.layerId) !== -1
            )
        },
        onClickOnLayerTopicItem: function (layerId) {
            const layer = this.getLayerForId(layerId)
            if (layer.visible) {
                this.toggleLayerVisibility(layerId)
            } else {
                this.addLayer(layerId)
            }
        },
        selectTopic: function (topic) {
            this.changeTopic(topic)
            this.showTopicSelectionPopup = false
        },
    },
}
</script>
