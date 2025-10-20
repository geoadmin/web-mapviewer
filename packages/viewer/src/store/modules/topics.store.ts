import type { GeoAdminLayer } from '@swissgeo/layers'

import { layerUtils } from '@swissgeo/layers/utils'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

import { loadTopicTreeForTopic, type Topic } from '@/api/topics.api'
import { TopicsStoreActions } from '@/store/actions'
import useI18nStore from '@/store/modules/i18n.store'
import useLayersStore from '@/store/modules/layers.store'

export interface TopicsState {
    /** List of all available topics */
    config: Topic[]
    /**
     * Current topic ID (either default 'ech' at app startup, or another from the config later
     * chosen by the user)
     */
    current: string
    /** Current topic's layers tree (that will help the user select layers belonging to this topic) */
    tree: GeoAdminLayer[]
    /** The ids of the catalog nodes that should be open. */
    openedTreeThemesIds: string[]
}

export interface LoadTopicOptions {
    /** If the layers described in the topic should replace all existing layers currently active */
    changeLayers?: boolean
    /** List of catalog node IDs to open directly after the topic tree has been loaded */
    openCatalogNodes?: string[]
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
        [TopicsStoreActions.SetTopics](
            topics: Topic[],
            options: LoadTopicOptions,
            dispatcher: ActionDispatcher
        ) {
            this.config = [...topics]
            this.loadTopic(options, dispatcher)
        },

        [TopicsStoreActions.SetTopicTree](layers: GeoAdminLayer[], dispatcher: ActionDispatcher) {
            this.tree = layers.map((layer) => layerUtils.cloneLayer(layer))
        },

        [TopicsStoreActions.ChangeTopic](
            topicId: string,
            options: LoadTopicOptions,
            dispatcher: ActionDispatcher
        ) {
            if (
                this.config.some((topic) => topic.id === topicId) ||
                // during appLoadingManagement.routerPlugin the topics are not yet set,
                // we can therefore not validate the topic ID
                dispatcher.name === 'appLoadingManagement.routerPlugin'
            ) {
                this.current = topicId
                this.loadTopic(options, dispatcher)
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

        [TopicsStoreActions.LoadTopic](options: LoadTopicOptions, dispatcher: ActionDispatcher) {
            const i18nStore = useI18nStore()
            const layersStore = useLayersStore()

            loadTopicTreeForTopic(i18nStore.lang, this.current, layersStore.config)
                .then((topicTree) => {
                    this.setTopicTree(topicTree.layers, dispatcher)
                    this.setTopicTreeOpenedThemesIds(
                        [this.current, ...topicTree.itemIdToOpen],
                        dispatcher
                    )
                    if (this.currentTopic?.defaultBackgroundLayer) {
                        layersStore.setBackground(
                            this.currentTopic?.defaultBackgroundLayer.id,
                            dispatcher
                        )
                    } else {
                        layersStore.setBackground(undefined, dispatcher)
                    }
                    if (!!options.changeLayers && this.currentTopic?.layersToActivate) {
                        layersStore.setLayers(this.currentTopic.layersToActivate, dispatcher)
                    }
                })
                .catch((error) => {
                    log.error({
                        title: 'Topics store',
                        titleStyle: {
                            backgroundColor: LogPreDefinedColor.Red,
                        },
                        messages: ['Error while loading topic tree', error],
                    })
                })
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
