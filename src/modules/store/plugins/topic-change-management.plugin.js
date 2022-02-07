import { CHANGE_TOPIC_MUTATION } from '@/modules/store/modules/topics.store'
import { loadTopicTreeForTopic } from '@/api/topics.api'

let isFirstSetTopic = true

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
 * - Add any layer to the app that are set in the topic metadata (and set their opacity/visibility accordingly)
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
                    store.dispatch('setBackground', currentTopic.defaultBackgroundLayer.getID())
                } else {
                    store.dispatch('setBackground', null)
                }
            }
            // we only set/clear layers after the first setTopic has occurred (after app init)
            if (!isFirstSetTopic) {
                store.dispatch('clearLayers')
            }
            // at init, if there is no active layer yet, but the topic has some, we add them
            // after init we always add all layers from topic
            if (!isFirstSetTopic || state.layers.activeLayers.length === 0) {
                currentTopic.layersToActivate.forEach((layer) => {
                    store.dispatch('addLayer', layer.getID())
                    store.dispatch('setLayerOpacity', {
                        layerId: layer.getID(),
                        opacity: layer.opacity,
                    })
                    // if layer should be in the list of activated layers but not visible on the map
                    // we toggle its visibility
                    store.dispatch('setLayerVisibility', {
                        layerId: layer.getID(),
                        visible: layer.visible,
                    })
                })
            }
            // loading topic tree
            loadTopicTreeForTopic(store.state.i18n.lang, currentTopic).then((topicTree) => {
                store.dispatch('setTopicTree', topicTree)
            })
            isFirstSetTopic = false
        }
    })
}

export default topicChangeManagementPlugin
