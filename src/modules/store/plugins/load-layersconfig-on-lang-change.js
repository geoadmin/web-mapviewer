import {SET_LANG_MUTATION_KEY} from "../../i18n/store/i18n.store"
import loadLayersConfigFromBackend from "../../../api/layers.api";

// local storage of layers config, so that if a language has already been loaded, we don't reload it from
// the backend the second time (will disappear on page reload)
const layersConfigByLang = {};

function loadLayersConfig(lang) {
    return new Promise(((resolve) => {
        if (!layersConfigByLang[lang]) {
            loadLayersConfigFromBackend(lang).then(layersConfig => {
                layersConfigByLang[lang] = layersConfig;
                resolve(layersConfig);
            });
        } else {
            resolve(layersConfigByLang[lang]);
        }
    }));
}

// Reload (if necessary) the layers config on language change
const loadLayersConfigOnLangChange = store => {
    store.subscribe((mutation, state) => {
        if (mutation.type === SET_LANG_MUTATION_KEY) {
            loadLayersConfig(state.i18n.lang).then(layersConfig => store.dispatch('setLayerConfig', layersConfig))
        }
    });
    // on app init, we load the first layersConfig
    loadLayersConfig(store.state.i18n.lang).then(layersConfig => store.dispatch('setLayerConfig', layersConfig))
}

export default loadLayersConfigOnLangChange;
