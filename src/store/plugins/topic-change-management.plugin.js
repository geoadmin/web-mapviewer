import { loadTopicTreeForTopic } from '@/api/topics.api'
import { STORE_DISPATCHER_ROUTER_PLUGIN } from '@/router/storeSync/abstractParamConfig.class'
import { CHANGE_TOPIC_MUTATION } from '@/store/modules/topics.store'
import log from '@/utils/logging'

const STORE_DISPATCHER_TOPIC_PLUGIN = 'topic-change-management.plugin'

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
        if (mutation.type === CHANGE_TOPIC_MUTATION) {
            let startTime = performance.now()
            log.debug(`Topic change management plugin: topic changed to ${mutation.payload.value}`)

            const currentTopic = store.getters.currentTopic
            // we only set background (from topic) when the user changed the topic from the
            // menu. If the topic changed via the URL router plugin, we ignore don't set the
            // topic background. This allow a user to change the default topic background and
            // create a permalink with a different background.
            if (mutation.payload.dispatcher !== STORE_DISPATCHER_ROUTER_PLUGIN) {
                if (currentTopic.defaultBackgroundLayer) {
                    store.dispatch('setBackground', {
                        value: currentTopic.defaultBackgroundLayer.getID(),
                        dispatcher: STORE_DISPATCHER_TOPIC_PLUGIN,
                    })
                } else {
                    store.dispatch('setBackground', {
                        value: null,
                        dispatcher: STORE_DISPATCHER_TOPIC_PLUGIN,
                    })
                }
            }

            // When the topic is changed via the router plugin (URL parameter) we don't change
            // the layers as we want to keep the one from the layers parameter
            if (mutation.payload.dispatcher !== STORE_DISPATCHER_ROUTER_PLUGIN) {
                store.dispatch('setLayers', {
                    layers: currentTopic.layersToActivate,
                    dispatcher: STORE_DISPATCHER_TOPIC_PLUGIN,
                })
            }

            log.debug(
                `Topic change management plugin: topic changed to ${mutation.payload.value} bg and layers dispatched: ${performance.now() - startTime}ms`,
                currentTopic.layersToActivate
            )
            // loading topic tree
            loadTopicTreeForTopic(
                store.state.i18n.lang,
                currentTopic.id,
                store.state.layers.config
            ).then((topicTree) => {
                store.dispatch('setTopicTree', {
                    layers: topicTree.layers,
                    dispatcher: STORE_DISPATCHER_TOPIC_PLUGIN,
                })
                // checking that no values were set in the URL at app startup, otherwise we might
                // overwrite them here
                if (store.state.topics.openedTreeThemesIds.length === 0) {
                    store.dispatch('setTopicTreeOpenedThemesIds', {
                        value: topicTree.itemIdToOpen,
                        dispatcher: STORE_DISPATCHER_TOPIC_PLUGIN,
                    })
                }

                let endTime = performance.now()
                log.debug(
                    `Finished Topic change management plugin: topic changed to ${mutation.payload.value}: ${endTime - startTime}ms`
                )
            })
        }
    })
}

export default topicChangeManagementPlugin
