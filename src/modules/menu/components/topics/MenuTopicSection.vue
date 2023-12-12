<template>
    <MenuSection
        v-if="currentTopic"
        id="menu-topic-section"
        ref="menuTopicSection"
        :title="$t(currentTopic?.id)"
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
                :current-id="currentTopic?.id"
                @select-topic="selectTopic"
                @close="showTopicSelectionPopup = false"
            />
        </template>
        <LayerCatalogue
            data-cy="menu-topic-tree"
            :layer-catalogue="currentTopicTree"
            :compact="compact"
        />
    </MenuSection>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

import LayerCatalogue from '@/modules/menu/components/LayerCatalogue.vue'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuTopicSelectionPopup from '@/modules/menu/components/topics/MenuTopicSelectionPopup.vue'

/** Menu section for topics, responsible to communicate user interactions on topics with the store */
export default {
    components: {
        MenuTopicSelectionPopup,
        LayerCatalogue,
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
            openThemesIds: (state) => state.topics.openedTreeThemesIds,
        }),
        ...mapGetters(['getActiveLayerById', 'isDefaultTopic']),
        showTopicTree() {
            // We only want the topic tree open whenever the user has chosen a different topic
            // than the default one (it can be opened by the user by a click on it, but by default it's closed)
            // If we have defined catalog themes to be opened in the URL, it makes sense to open the catalog
            return !this.isDefaultTopic || this.openThemesIds.length > 0
        },
    },
    methods: {
        ...mapActions(['changeTopic']),
        setShowTopicSelectionPopup() {
            this.showTopicSelectionPopup = true
        },
        selectTopic(topic) {
            this.changeTopic(topic)
            this.showTopicSelectionPopup = false
        },
        close() {
            this.$refs.menuTopicSection.close()
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/modules/menu/scss/menu-items';

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
