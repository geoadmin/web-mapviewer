import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { LoadTopicOptions, TopicsStore } from '@/store/modules/topics/types/topics'
import type { ActionDispatcher } from '@/store/types'

import { loadTopicTreeForTopic } from '@/api/topics.api'
import useI18nStore from '@/store/modules/i18n'
import useLayersStore from '@/store/modules/layers.store'

export default function loadTopic(
    this: TopicsStore,
    options: LoadTopicOptions,
    dispatcher: ActionDispatcher
): void {
    const i18nStore = useI18nStore()
    const layersStore = useLayersStore()

    loadTopicTreeForTopic(i18nStore.lang, this.current, layersStore.config)
        .then((topicTree) => {
            this.setTopicTree(topicTree.layers, dispatcher)
            this.setTopicTreeOpenedThemesIds([this.current, ...topicTree.itemIdToOpen], dispatcher)
            if (this.currentTopic?.defaultBackgroundLayer) {
                layersStore.setBackground(this.currentTopic?.defaultBackgroundLayer.id, dispatcher)
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
}
