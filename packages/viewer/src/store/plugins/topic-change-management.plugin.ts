import type { PiniaPlugin, PiniaPluginContext } from 'pinia'

import log from '@swissgeo/log'

import type { ActionDispatcher } from '@/store/types'

import { loadTopicTreeForTopic } from '@/api/topics.api'
import router from '@/router'
import useI18nStore from '@/store/modules/i18n'
import useLayersStore from '@/store/modules/layers'
import useTopicsStore from '@/store/modules/topics'

/**
 * Vuex plugins that will manage topic switching.
 *
 * On app init, it will :
 *
 * - Add any layer present in the topic if there are none yet defined by the URL params
 *
 * On app init and at each topic switch, it will :
 *
 * - Set the background according to the topic metadata
 * - Load the topic tree for the selected topic
 *
 * After app init, when topic changes, it will :
 *
 * - Clear up any active layers
 * - Add any layer to the app that are set in the topic metadata (and set their opacity/visibility
 *   accordingly)
 */
const topicChangeManagement: PiniaPlugin = (context: PiniaPluginContext) => {
    const { store } = context

    const topicStore = useTopicsStore()
    const layersStore = useLayersStore()
    const i18nStore = useI18nStore()

    store.$onAction(({ name, args }) => {
        const typedTopicStore = topicStore
        // we listen to the "change topic" mutation
        if (
            name === 'setTopics' ||
            // During application startup we trigger a changeTopic before the topics are loaded,
            // in this case we ignore the changeTopic event
            (name === 'changeTopic' && topicStore.config.length > 0)
        ) {
            const queryKeys = Object.keys(router.currentRoute.value.query ?? {})
            const currentTopic = typedTopicStore.currentTopic

            log.debug({
                title: 'Topic change management plugin',
                messages: [`topic changed to`, args, currentTopic ?? 'No Topic', queryKeys],
            })

            // last argument is the dispatcher
            const dispatcher: ActionDispatcher = args.slice(-1) as unknown as ActionDispatcher

            if (!currentTopic) {
                // the rest depends on this
                return
            }

            // we only set background (from topic) when the user changed the topic from the menu.
            // If the topic changed via the URL router plugin or when changing the language
            // (topics are translated), we ignore the background from topics unless there is no
            // bgLayers query parameter in URL. This allow a user to change the default topic
            // background and create a permalink with a different background and layers.
            // On the otherhand at startup if no bgLayers query parameter is found in URL we need
            // to setup the default background based on topic.
            if (dispatcher.name === 'MenuTopicSection.vue' || !queryKeys.includes('bgLayer')) {
                if (currentTopic.defaultBackgroundLayer) {
                    layersStore.setBackground(currentTopic.defaultBackgroundLayer.id, dispatcher)
                } else {
                    layersStore.setBackground(undefined, dispatcher)
                }
            }

            // we only set the default topic active layers when the user changed the topic from the
            // menu. If the topic changed via the URL router plugin or when changing the language
            // (topics are translated), we ignore the default active layers from topics. This allow
            // a user to change the default topic active layers and to create a permalink with
            // different layers.
            if (dispatcher.name === 'MenuTopicSection.vue' || !queryKeys.includes('layers')) {
                if (currentTopic?.layersToActivate) {
                    layersStore.setLayers(currentTopic.layersToActivate, dispatcher)
                }
            }

            // loading topic tree
            loadTopicTreeForTopic(i18nStore.lang, currentTopic.id, layersStore.config)
                .then((topicTree) => {
                    topicStore.setTopicTree(topicTree.layers, dispatcher)

                    // Here we have different behavior possible
                    if (
                        dispatcher.name === 'MenuTopicSection.vue' ||
                        (!queryKeys.includes('catalogNodes') && !typedTopicStore.isDefaultTopic)
                    ) {
                        // 1. When changing the topic from the menu always open the topic menu and its sub
                        //    themes defined by the topic
                        // 2. When setting the query parameter topic and we don't have a catalogNodes query
                        //    parameter and the topic is not the default, then we want the topic catalog
                        //    to be open
                        topicStore.setTopicTreeOpenedThemesIds(
                            [currentTopic.id, ...topicTree.itemIdToOpen],
                            dispatcher
                        )
                    } else if (!queryKeys.includes('catalogNodes') && typedTopicStore.isDefaultTopic) {
                        // 3. When setting the query parameter topic to the default topic, without
                        //    having a catalogNodes query param, then we don't want to have the main
                        //    catalog menu open but only the sub menus.
                        topicStore.setTopicTreeOpenedThemesIds(
                            [...topicTree.itemIdToOpen],
                            dispatcher
                        )
                    } else {
                        log.debug({
                            title: 'Topic change management plugin',
                            messages: [
                                `do not set topic tree opened themes ids, let them be set by catalogNodes`,
                            ],
                        })
                    }

                    log.debug({
                        title: 'Topic change management plugin',
                        messages: [`Finished topic change: topic changed to`, args],
                    })
                })
                .catch((error) => {
                    log.error({
                        title: 'Topic change management plugin',
                        messages: ['Error while changing topic', error],
                    })
                })
        }
    })
}

export default topicChangeManagement
