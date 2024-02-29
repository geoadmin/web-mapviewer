import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import { loadLayersConfigFromBackend } from '@/api/layers/layers.api'
import { loadTopics, parseTopics } from '@/api/topics.api'
import { SET_LANG_MUTATION_KEY } from '@/store/modules/i18n.store'
import log from '@/utils/logging'

const dispatcher = { dispatcher: 'load-layersconfig-on-lang-change' }

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
        log.debug(
            `Start loading layers config and topics lang=${lang} topic=${topicId} dispatcher=${dispatcher}`
        )
        const [layersConfig, rawTopics] = await Promise.all([loadLayersConfig(lang), loadTopics()])
        const topics = parseTopics(layersConfig, rawTopics)

        // adding SWISSIMAGE as a possible background for 3D
        const swissimage = layersConfig.find((layer) => layer.getID() === 'ch.swisstopo.swissimage')
        if (swissimage) {
            layersConfig.push(
                new GeoAdminWMTSLayer({
                    name: swissimage.name,
                    geoAdminId: `${swissimage.getID()}_3d`,
                    serverLayerId: swissimage.serverLayerId,
                    visible: false,
                    attributions: swissimage.attributions,
                    format: swissimage.format,
                    timeConfig: swissimage.timeConfig,
                    isBackground: true,
                    baseURL: swissimage.baseURL,
                    hasTooltip: false,
                    isHighlightable: false,
                    topics: swissimage.topics,
                })
            )
        }

        store.dispatch('setLayerConfig', { config: layersConfig, dispatcher })
        store.dispatch('setTopics', { topics, dispatcher })
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
                mutation.payload.lang,
                store.state.topics.current,
                dispatcher.dispatcher
            )
                .then(() => {
                    log.debug('Layers config for new lang loaded with success')
                })
                .catch((err) => {
                    log.error('Error while loading the layers config for the new lang', err)
                })
        }
    })
}

export default loadLayersConfigOnLangChange
