import { loadLayersConfigFromBackend } from '@/api/layers/layers.api'
import GeoAdminVectorLayer from '@/api/layers/GeoAdminVectorLayer.class'
import loadTopicsFromBackend, { loadTopicTreeForTopic } from '@/api/topics.api'
import { VECTOR_TILES_STYLE_ID, VECTOR_TILES_STYLE_URL } from '@/config'
import { SET_LANG_MUTATION_KEY } from '@/store/modules/i18n.store'
import log from '@/utils/logging'

/**
 * Local storage of layers config, so that if a language has already been loaded, we don't reload it
 * from the backend the second time (will disappear on page reload)
 *
 * @type Object
 */
const layersConfigByLang = {}

/**
 * Loads the whole config from the backend (aka LayersConfig) for a specific language and store it
 * in a cache
 *
 * If the same language is asked another time later on, the cached version will be given.
 *
 * @param lang {String} ISO code for a language
 * @returns {Promise<GeoAdminLayer[]>}
 */
async function loadLayersConfig(lang) {
    if (!layersConfigByLang[lang]) {
        const layersConfig = await loadLayersConfigFromBackend(lang)
        layersConfigByLang[lang] = layersConfig
        return layersConfig
    } else {
        return layersConfigByLang[lang]
    }
}

const loadLayersAndTopicsConfigAndDispatchToStore = async (store) => {
    try {
        // adding vector tile backend through a hardcoded entry (for now)
        // this should be removed as soon as the backend delivers a proper configuration
        // for our vector tile background layer
        const bgVectorLayer = new GeoAdminVectorLayer(
            VECTOR_TILES_STYLE_ID,
            1.0,
            true,
            VECTOR_TILES_STYLE_URL,
            'swisstopo',
            'https://www.swisstopo.admin.ch/en/home.html',
            true,
            // filtering out any layer that uses swisstopo data (meaning all layers that are over Switzerland)
            'swissmaptiles'
        )
        const layersConfig = [bgVectorLayer, ...(await loadLayersConfig(store.state.i18n.lang))]
        store.dispatch('setLayerConfig', layersConfig)
        const topicsConfig = await loadTopicsFromBackend(layersConfig)
        // as we want the vector tile background as default, we edit on the fly
        // the default topic ECH to have the vector layer as its default background
        const topicEch = topicsConfig.find((topic) => topic.id === 'ech')
        if (topicEch) {
            topicEch.backgroundLayers.push(bgVectorLayer)
            topicEch.defaultBackgroundLayer = bgVectorLayer
        }
        store.dispatch('setTopics', topicsConfig)
        if (store.state.topics.current) {
            const tree = await loadTopicTreeForTopic(
                store.state.i18n.lang,
                store.state.topics.current
            )
            store.dispatch('setTopicTree', tree)
        } else {
            store.dispatch(
                'changeTopic',
                topicsConfig.find((topic) => topic.id === 'ech')
            )
        }
    } catch (error) {
        log.error(error)
    }
}

/**
 * Reload (if necessary from the backend) the layers config on language change
 *
 * @param {Vuex.Store} store
 */
const loadLayersConfigOnLangChange = (store) => {
    store.subscribe((mutation) => {
        if (mutation.type === SET_LANG_MUTATION_KEY) {
            loadLayersAndTopicsConfigAndDispatchToStore(store)
        }
    })
    // on app init, we load the first layersConfig
    loadLayersAndTopicsConfigAndDispatchToStore(store)
}

export default loadLayersConfigOnLangChange
