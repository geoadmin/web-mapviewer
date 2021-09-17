<template>
    <MenuSection v-if="currentTopic" :title="$t(currentTopic.id)" :show-content="showTopicTree">
        <template #extra-button>
            <span data-cy="change-topic-button" @click="setShowTopicSelectionPopup">
                {{ $t('choose_theme') }}
            </span>
            <MenuTopicSelectionPopup
                v-if="showTopicSelectionPopup"
                :topics="allTopics"
                @selectTopic="selectTopic"
                @close="showTopicSelectionPopup = false"
            />
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

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { topicTypes } from '@/api/topics.api'
import MenuSection from '@/modules/menu/components/MenuSection'
import MenuTopicTreeItem from '@/modules/menu/components/topics/MenuTopicTreeItem'
import MenuTopicSelectionPopup from '@/modules/menu/components/topics/MenuTopicSelectionPopup'

/** Menu section for topics, responsible to communicate user interactions on topics with the store */
export default {
    components: { MenuTopicSelectionPopup, MenuTopicTreeItem, MenuSection },
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
        ...mapGetters(['visibleLayers', 'getLayerForGeoAdminId', 'isDefaultTopic']),
        showTopicTree: function () {
            // We only want the topic tree open whenever the user has chosen a different topic
            // than the default one (it can be opened by the user by a click on it, but by default it's closed)
            return !this.isDefaultTopic
        },
    },
    methods: {
        ...mapActions(['addLayer', 'toggleLayerVisibility', 'changeTopic']),
        setShowTopicSelectionPopup: function () {
            this.showTopicSelectionPopup = true
        },
        isLayerTreeItemActive: function (item) {
            return (
                item.type === topicTypes.LAYER &&
                this.visibleLayers.find((layer) => layer.getID() === item.layerId)
            )
        },
        onClickOnLayerTopicItem: function (layerId) {
            const layer = this.getLayerForBodId(layerId)
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

<style lang="scss">
.menu-topic-tree {
    max-height: 50vh;
    overflow-y: auto;
}
</style>
