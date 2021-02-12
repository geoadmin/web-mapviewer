import { SET_LANG_MUTATION_KEY } from '@/modules/i18n/store/i18n.store'
import loadLayersConfigFromBackend from '@/api/layers.api'

/**
 * local storage of layers config, so that if a language has already been loaded, we don't reload it from the backend the second time (will disappear on page reload)
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

const loadLayersConfigAndDispatchToStore = (store) => {
  loadLayersConfig(store.state.i18n.lang)
    .then((layersConfig) => store.dispatch('setLayerConfig', layersConfig))
    .catch((error) => console.error(error))
}

/**
 * Reload (if necessary from the backend) the layers config on language change
 * @param {Vuex.Store} store
 */
const loadLayersConfigOnLangChange = (store) => {
  store.subscribe((mutation) => {
    if (mutation.type === SET_LANG_MUTATION_KEY) {
      loadLayersConfigAndDispatchToStore(store)
    }
  })
  // on app init, we load the first layersConfig
  loadLayersConfigAndDispatchToStore(store)
}

export default loadLayersConfigOnLangChange
