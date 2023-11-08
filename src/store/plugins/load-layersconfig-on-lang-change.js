import { loadLayersConfigFromBackend } from '@/api/layers/layers.api'
import loadTopicsFromBackend, { loadTopicTreeForTopic } from '@/api/topics.api'
import { SET_LANG_MUTATION_KEY } from '@/store/modules/i18n.store'
import log from '@/utils/logging'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'

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
        const layersConfig = [...(await loadLayersConfig(store.state.i18n.lang))]
        const topicsConfig = await loadTopicsFromBackend(layersConfig)

        // adding SWISSIMAGE as a possible background for 3D
        const swissimage = layersConfig.find((layer) => layer.getID() === 'ch.swisstopo.swissimage')
        if (swissimage) {
            layersConfig.push(
                new GeoAdminWMTSLayer(
                    swissimage.name,
                    `${swissimage.getID()}_3d`,
                    swissimage.serverLayerId,
                    1.0,
                    false,
                    swissimage.attributions,
                    swissimage.format,
                    swissimage.timeConfig,
                    true,
                    swissimage.baseURL,
                    false,
                    false,
                    swissimage.topics
                )
            )
        }

        store.dispatch('setLayerConfig', layersConfig)
        store.dispatch('setTopics', topicsConfig)
        if (store.state.topics.current) {
            const tree = await loadTopicTreeForTopic(
                store.state.i18n.lang,
                store.state.topics.current
            )
            store.dispatch('setTopicTree', tree)
        } else {
            // if no topic was set in the URL, we load the default topic ECH
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
