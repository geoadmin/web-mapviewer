import { CHANGE_TOPIC_MUTATION } from '@/modules/store/modules/topics.store'
import { loadTopicTreeForTopic } from '@/api/topics.api'

let isFirstSetTopic = true

/**
 * Vuex plugins that will manage topic switching.
 *
 * On app init, it will :
 * - Add any layer present in the topic if there are none yet defined by the URL params
 *
 * On app init and at each topic switch, it will :
 * - Set the background according to the topic metadata
 * - Load the topic tree for the selected topic
 *
 * After app init, when topic changes, it will :
 * - Clear up any active layers
 * - Add any layer to the app that are set in the topic metadata (and set their opacity/visibility accordingly)
 * - Close the side menu (so that the map is fully visible with the new topic)
 *
 * @param store
 */
const topicChangeManagementPlugin = (store) => {
    store.subscribe((mutation, state) => {
        // we listen to the "change topic" mutation
        if (mutation.type === CHANGE_TOPIC_MUTATION) {
            const currentTopic = state.topics.current
            // we only set/clear layers after the first setTopic has occurred (after app init)
            if (!isFirstSetTopic) {
                store.dispatch('clearLayers')
                if (currentTopic.defaultBackgroundLayer) {
                    store.dispatch('setBackground', currentTopic.defaultBackgroundLayer.id)
                } else {
                    store.dispatch('setBackground', null)
                }
            }
            // at init, if there is no active layer yet, but the topic has some, we add them
            // after init we always add all layers from topic
            if (!isFirstSetTopic || state.layers.activeLayers.length === 0) {
                currentTopic.layersToActivate.forEach((layer) => {
                    store.dispatch('addLayer', layer.id)
                    store.dispatch('setLayerOpacity', {
                        layerId: layer.id,
                        opacity: layer.opacity,
                    })
                    // if layer should be in the list of activated layers but not visible on the map
                    // we toggle its visibility
                    if (!layer.visible) {
                        store.dispatch('toggleLayerVisibility', layer.id)
                    }
                })
            }
            // loading topic tree
            loadTopicTreeForTopic(store.state.i18n.lang, currentTopic).then((topicTree) => {
                store.dispatch('setTopicTree', topicTree)
            })
            // closing side menu (if open)
            if (state.ui.showMenuTray) {
                store.dispatch('toggleMenuTray')
            }
            isFirstSetTopic = false
        }
    })
}

export default topicChangeManagementPlugin
