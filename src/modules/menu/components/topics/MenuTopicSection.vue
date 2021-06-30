<template>
    <MenuSection v-if="currentTopic" :title="$t(currentTopic.id)">
        <template v-slot:extra-button>
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
<style lang="scss">
.menu-topic-tree {
    max-height: 50vh;
    overflow-y: auto;
}
</style>
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
        ...mapGetters(['visibleLayers', 'getLayerForGeoAdminId']),
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
