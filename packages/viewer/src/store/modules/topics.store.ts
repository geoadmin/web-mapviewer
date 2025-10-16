import type { GeoAdminGroupOfLayers, GeoAdminLayer } from '@swissgeo/layers'

import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { defineStore } from 'pinia'

import type { Topic } from '@/api/topics.api'
import type { ActionDispatcher } from '@/store/types'

export interface TopicsState {
    /** List of all available topics */
    config: Topic[]
    /**
     * Current topic ID (either default 'ech' at app startup, or another from the config later
     * chosen by the user)
     */
    current: string
    /** Current topic's layers tree (that will help the user select layers belonging to this topic) */
    tree: (GeoAdminLayer | GeoAdminGroupOfLayers)[]
    /** The ids of the catalog nodes that should be open. */
    openedTreeThemesIds: string[]
}

export enum TopicsStoreActions {
    SetTopics = 'setTopics',
    SetTopicTree = 'setTopicTree',
    ChangeTopic = 'changeTopic',
    SetTopicTreeOpenedThemesIds = 'setTopicTreeOpenedThemesIds',
    AddTopicTreeOpenedThemeId = 'addTopicTreeOpenedThemeId',
    RemoveTopicTreeOpenedThemeId = 'removeTopicTreeOpenedThemeId',
}

const useTopicsStore = defineStore('topics', {
    state: (): TopicsState => ({
        config: [],
        current: 'ech',
        tree: [],
        openedTreeThemesIds: [],
    }),
    getters: {
        isDefaultTopic(): boolean {
            return this.current === 'ech'
        },
        currentTopic(): Topic | undefined {
            return this.config.find((topic) => topic.id === this.current)
        },
    },
    actions: {
        [TopicsStoreActions.SetTopics](topics: Topic[], dispatcher: ActionDispatcher) {
            this.config = [...topics]
        },

        [TopicsStoreActions.SetTopicTree](
            layers: (GeoAdminLayer | GeoAdminGroupOfLayers)[],
            dispatcher: ActionDispatcher
        ) {
            this.tree = layers.map((layer) => layerUtils.cloneLayer(layer))
        },

        [TopicsStoreActions.ChangeTopic](topicId: string, dispatcher: ActionDispatcher) {
            if (
                this.config.some((topic) => topic.id === topicId) ||
                // during appLoadingManagement.routerPlugin the topics are not yet set,
                // we can therefore not validate the topic ID
                dispatcher.name === 'appLoadingManagement.routerPlugin'
            ) {
                this.current = topicId
            } else {
                log.error({
                    title: 'Topics store',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: ['Invalid topic ID', topicId, dispatcher],
                })
            }
        },

        [TopicsStoreActions.SetTopicTreeOpenedThemesIds](
            themes: string | string[],
            dispatcher: ActionDispatcher
        ) {
            if (typeof themes === 'string') {
                this.openedTreeThemesIds = themes.split(',')
            } else if (Array.isArray(themes)) {
                this.openedTreeThemesIds = [...themes]
            }
        },

        [TopicsStoreActions.AddTopicTreeOpenedThemeId](
            themeId: string,
            dispatcher: ActionDispatcher
        ) {
            this.openedTreeThemesIds.push(themeId)
        },

        [TopicsStoreActions.RemoveTopicTreeOpenedThemeId](
            themeId: string,
            dispatcher: ActionDispatcher
        ) {
            if (this.openedTreeThemesIds.includes(themeId)) {
                this.openedTreeThemesIds.splice(this.openedTreeThemesIds.indexOf(themeId), 1)
            }
        },
    },
})

export default useTopicsStore
