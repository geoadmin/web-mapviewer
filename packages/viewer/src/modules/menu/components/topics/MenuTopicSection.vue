<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import LayerCatalogue from '@/modules/menu/components/LayerCatalogue.vue'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import MenuTopicSelectionPopup from '@/modules/menu/components/topics/MenuTopicSelectionPopup.vue'
import useTopicsStore from '@/store/modules/topics'
import useAppStore from '@/store/modules/app'
import type { Topic } from '@/api/topics.api'

const dispatcher = { name: 'MenuTopicSection.vue' }

const { compact } = defineProps({
    compact: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['openMenuSection', 'closeMenuSection'])
const { t } = useI18n()
const topicsStore = useTopicsStore()
const appStore = useAppStore()

const menuTopicSection = useTemplateRef('menuTopicSection')
const showTopicSelectionPopup = ref(false)

// The id needs to be exposed and is used by the MenuTray to close sections.
const sectionId = 'topicsSection'
const currentTopic = computed(() => topicsStore.current)
const currentTopicTree = computed(() => topicsStore.tree)
const allTopics = computed(() => topicsStore.config)

const showTopicTree = computed(() => {
    // // We only want the topic tree open whenever the user has chosen a different topic
    // // than the default one (it can be opened by the user by a click on it, but by default it's closed)
    // // If we have defined catalog themes to be opened in the URL, it makes sense to open the catalog
    // return !isDefaultTopic.value
    return topicsStore.openedTreeThemesIds.includes(currentTopic.value)
})

const mapModuleReady = computed(() => appStore.isMapReady)

function setShowTopicSelectionPopup() {
    showTopicSelectionPopup.value = true
}

function selectTopic(topic: Topic): void {
    topicsStore.changeTopic(topic.id, { changeLayers: true }, dispatcher)
    showTopicSelectionPopup.value = false
}

function close() {
    if (menuTopicSection.value) {
        menuTopicSection.value.close()
    }
}

function onOpenMenuTopics(sectionId: string) {
    emit('openMenuSection', sectionId)
    topicsStore.addTopicTreeOpenedThemeId(currentTopic.value, dispatcher)
}

function onCloseMenuTopics(sectionId: string) {
    emit('closeMenuSection', sectionId)
    topicsStore.removeTopicTreeOpenedThemeId(currentTopic.value, dispatcher)
}

defineExpose({ close, id: sectionId })
</script>

<template>
    <MenuSection
        ref="menuTopicSection"
        :section-id="sectionId"
        :title="t(currentTopic)"
        :show-content="showTopicTree"
        light
        data-cy="menu-topic-section"
        @open-menu-section="onOpenMenuTopics"
        @close-menu-section="onCloseMenuTopics"
    >
        <template #extra-button>
            <button
                class="menu-topic-switch"
                data-cy="change-topic-button"
                @click.stop="setShowTopicSelectionPopup"
            >
                {{ t('choose_theme') }}
            </button>
            <MenuTopicSelectionPopup
                v-if="showTopicSelectionPopup"
                :topics="allTopics"
                :current-id="currentTopic"
                @select-topic="selectTopic"
                @close="showTopicSelectionPopup = false"
            />
        </template>
        <!-- The topic menu is very performance costly and should only be rendered once the
             map has been rendered, otherwise it would slow down the application startup -->
        <LayerCatalogue
            v-if="mapModuleReady"
            data-cy="menu-topic-tree"
            :layer-catalogue="currentTopicTree"
            :compact="compact"
            :is-topic="true"
        />
    </MenuSection>
</template>

<style lang="scss" scoped>
@import '@/modules/menu/scss/menu-items';

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
