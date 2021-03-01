import { SET_LANG_MUTATION_KEY } from '@/modules/i18n/store/i18n.store'
import loadLayersConfigFromBackend from '@/api/layers.api'
import loadTopicsFromBackend, { loadTopicTreeForTopic } from '@/api/topics.api'
import log from '@/utils/logging'

/**
 * Local storage of layers config, so that if a language has already been loaded, we don't reload it
 * from the backend the second time (will disappear on page reload)
 *
 * @type Object
 */
const layersConfigByLang = {}

function loadLayersConfig(lang) {
    return new Promise((resolve, reject) => {
        if (!layersConfigByLang[lang]) {
            loadLayersConfigFromBackend(lang)
                .then((layersConfig) => {
                    layersConfigByLang[lang] = layersConfig
                    resolve(layersConfig)
                })
                .catch((error) => {
                    reject(error)
                })
        } else {
            resolve(layersConfigByLang[lang])
        }
    })
}

const loadLayersAndTopicsConfigAndDispatchToStore = (store) => {
    loadLayersConfig(store.state.i18n.lang)
        .then((layersConfig) => {
            store.dispatch('setLayerConfig', layersConfig)
            loadTopicsFromBackend(layersConfig).then((topicsConfig) => {
                store.dispatch('setTopics', topicsConfig)
                if (store.state.topics.current) {
                    loadTopicTreeForTopic(
                        store.state.i18n.lang,
                        store.state.topics.current
                    ).then((tree) => store.dispatch('setTopicTree', tree))
                } else {
                    store.dispatch(
                        'changeTopic',
                        topicsConfig.find((topic) => topic.id === 'ech')
                    )
                }
            })
        })
        .catch((error) => log('error', error))
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
