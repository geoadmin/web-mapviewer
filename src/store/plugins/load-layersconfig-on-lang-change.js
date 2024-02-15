import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import { loadLayersConfigFromBackend } from '@/api/layers/layers.api'
import loadTopicsFromBackend, { loadTopicTreeForTopic } from '@/api/topics.api'
import { SET_LANG_MUTATION_KEY } from '@/store/modules/i18n.store'
import log from '@/utils/logging'

const STORE_DISPATCHER_LANG_CHANGE = 'load-layersconfig-on-lang-change'

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

const loadLayersAndTopicsConfigAndDispatchToStore = async (store, lang, topicId, dispatcher) => {
    try {
        log.debug(`Start loading layers config and topics`)
        const layersConfig = [...(await loadLayersConfig(lang))]
        const topicsConfig = await loadTopicsFromBackend(layersConfig)
        log.debug(`Finished loading layers config and topics`)

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

        store.dispatch('setLayerConfig', { config: layersConfig, dispatcher })
        store.dispatch('setTopics', { topics: topicsConfig, dispatcher })
        store.dispatch('changeTopic', { value: topicId, dispatcher })
        const tree = await loadTopicTreeForTopic(lang, topicId, layersConfig)
        store.dispatch('setTopicTree', { layers: tree.layers, dispatcher })
        store.dispatch('setTopicTreeOpenedThemesIds', {
            value: tree.itemIdToOpen,
            dispatcher,
        })
        log.debug(`layers config and topics dispatched`)
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
            loadLayersAndTopicsConfigAndDispatchToStore(
                store,
                mutation.payload.value,
                store.state.topics.current,
                STORE_DISPATCHER_LANG_CHANGE
            )
                .then(() => {
                    log.debug('Layers config for new lang loaded with success')
                })
                .catch((err) => {
                    log.error('Error while loading the layers config for the new lang', err)
                })
        }
    })
    // on app init, we load the first layersConfig and topics using the lang and topic from url
    const queryParams = new URLSearchParams(
        // The legacy link uses the query, while new permalink are behind the hash
        window.location.search || window.location.hash.replace('#/map?')
    )
    const lang = queryParams.get('lang') ?? store.state.i18n.lang
    const topic = queryParams.get('topic') ?? store.state.topics.current
    loadLayersAndTopicsConfigAndDispatchToStore(store, lang, topic, 'app-init')
        .then(() => {
            log.debug('Initial layers config loaded')
        })
        .catch((err) => {
            log.error('Error while loading initial layers config', err)
        })
}

export default loadLayersConfigOnLangChange
