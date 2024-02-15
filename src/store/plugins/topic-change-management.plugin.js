import { loadTopicTreeForTopic } from '@/api/topics.api'
import { CHANGE_TOPIC_MUTATION } from '@/store/modules/topics.store'

let isFirstSetTopic = true

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
    store.subscribe((mutation, state) => {
        // we listen to the "change topic" mutation
        if (mutation.type === CHANGE_TOPIC_MUTATION) {
            const currentTopic = state.topics.current
            // we only set background (from topic) after app startup
            // otherwise, the URL param bgLayer is ignored/overwritten by the setTopic
            // we set it anyway if the URL doesn't contain a bgLayer URL param
            if (!isFirstSetTopic || window.location.href.indexOf('bgLayer=') === -1) {
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

            // at init, if there is no active layer yet, but the topic has some, we add them
            // after init we always add all layers from topic
            if (!isFirstSetTopic || state.layers.activeLayers.length === 0) {
                store.dispatch('setLayers', {
                    layers: currentTopic.layersToActivate,
                    dispatcher: STORE_DISPATCHER_TOPIC_PLUGIN,
                })
            }
            // loading topic tree
            loadTopicTreeForTopic(
                store.state.i18n.lang,
                currentTopic,
                store.state.layers.config
            ).then((topicTree) => {
                store.dispatch('setTopicTree', {
                    layers: topicTree.layers,
                    dispatcher: STORE_DISPATCHER_TOPIC_PLUGIN,
                })
                // checking that no values were set in the URL at app startup, otherwise we might overwrite them here
                if (!isFirstSetTopic || store.state.topics.openedTreeThemesIds.length === 0) {
                    store.dispatch('setTopicTreeOpenedThemesIds', {
                        value: topicTree.itemIdToOpen,
                        dispatcher: STORE_DISPATCHER_TOPIC_PLUGIN,
                    })
                }
                isFirstSetTopic = false
            })
        }
    })
}

export default topicChangeManagementPlugin
