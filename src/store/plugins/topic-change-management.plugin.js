import { loadTopicTreeForTopic } from '@/api/topics.api'
import router from '@/router'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'topic-change-management.plugin' }

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
 *
 * @param store
 */
const topicChangeManagementPlugin = (store) => {
    store.subscribe((mutation) => {
        // we listen to the "change topic" mutation
        if (
            // During application startup we trigger a changeTopic before the topics are loaded
            // therefore in this case we ignore the changeTopic event
            (mutation.type === 'changeTopic' && store.state.topics.config.length > 0) ||
            mutation.type === 'setTopics'
        ) {
            const queryKeys = Object.keys(router.currentRoute.value.query ?? {})
            const currentTopic = store.getters.currentTopic

            log.debug(
                `Topic change management plugin: topic changed to`,
                mutation.payload,
                currentTopic,
                queryKeys
            )

            // we only set background (from topic) when the user changed the topic from the menu.
            // If the topic changed via the URL router plugin or when changing the language
            // (topics are translated), we ignore the background from topics unless there is no
            // bgLayers query parameter in URL. This allow a user to change the default topic
            // background and create a permalink with a different background and layers.
            // On the otherhand at startup if no bgLayers query parameter is found in URL we need
            // to setup the default background based on topic.
            if (
                mutation.payload.dispatcher === 'MenuTopicSection.vue' ||
                !queryKeys.includes('bgLayer')
            ) {
                if (currentTopic.defaultBackgroundLayer) {
                    store.dispatch('setBackground', {
                        bgLayer: currentTopic.defaultBackgroundLayer.id,
                        ...dispatcher,
                    })
                } else {
                    store.dispatch('setBackground', {
                        bgLayer: null,
                        ...dispatcher,
                    })
                }
            }

            // we only set the default topic active layers when the user changed the topic from the
            // menu. If the topic changed via the URL router plugin or when changing the language
            // (topics are translated), we ignore the default active layers from topics. This allow
            // a user to change the default topic active layers and to create a permalink with
            // different layers.
            if (
                mutation.payload.dispatcher === 'MenuTopicSection.vue' ||
                !queryKeys.includes('layers')
            ) {
                store.dispatch('setLayers', {
                    layers: currentTopic.layersToActivate,
                    ...dispatcher,
                })
            }

            // loading topic tree
            loadTopicTreeForTopic(
                store.state.i18n.lang,
                currentTopic.id,
                store.state.layers.config
            ).then((topicTree) => {
                store.dispatch('setTopicTree', {
                    layers: topicTree.layers,
                    ...dispatcher,
                })
                // checking that no values were set in the URL at app startup, otherwise we might
                // overwrite them here
                if (store.state.topics.openedTreeThemesIds.length === 0) {
                    store.dispatch('setTopicTreeOpenedThemesIds', {
                        catalogNodes: topicTree.itemIdToOpen,
                        ...dispatcher,
                    })
                }

                log.debug(
                    `Finished Topic change management plugin: topic changed to ${mutation.payload}`
                )
            })
        }
    })
}

export default topicChangeManagementPlugin
