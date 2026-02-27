import { defineStore } from 'pinia'

import type { TopicsStoreGetters, TopicsStoreState } from '@/store/modules/topics/types'

import addTopicTreeOpenedThemeId from '@/store/modules/topics/actions/addTopicTreeOpenedThemeId'
import changeTopic from '@/store/modules/topics/actions/changeTopic'
import loadTopic from '@/store/modules/topics/actions/loadTopic'
import removeTopicTreeOpenedThemeId from '@/store/modules/topics/actions/removeTopicTreeOpenedThemeId'
import setTopics from '@/store/modules/topics/actions/setTopics'
import setTopicTree from '@/store/modules/topics/actions/setTopicTree'
import setTopicTreeOpenedThemesIds from '@/store/modules/topics/actions/setTopicTreeOpenedThemesIds'
import currentTopic from '@/store/modules/topics/getters/currentTopic'
import isDefaultTopic from '@/store/modules/topics/getters/isDefaultTopic'

const state = (): TopicsStoreState => ({
    config: [],
    current: 'ech',
    tree: [],
    openedTreeThemesIds: [],
})

const getters: TopicsStoreGetters = {
    isDefaultTopic,
    currentTopic,
}
const actions = {
    setTopics,
    setTopicTree,
    changeTopic,
    loadTopic,
    setTopicTreeOpenedThemesIds,
    addTopicTreeOpenedThemeId,
    removeTopicTreeOpenedThemeId,
}

const useTopicsStore = defineStore('topics', {
    state,
    getters: { ...getters },
    actions,
})

export default useTopicsStore
