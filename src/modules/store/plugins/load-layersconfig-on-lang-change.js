import axios from "axios";
import {SET_LANG_MUTATION_KEY} from "@/modules/i18n/store/i18n.store"
import {API_BASE_URL} from "@/config";

// local storage of layers config, so that if a language has already been loaded, we don't reload it from
// the backend the second time (will disappear on page reload)
const layersConfigByLang = {};

function loadLayersConfig(lang) {
    return new Promise(((resolve) => {
        if (!layersConfigByLang[lang]) {
            axios.get(`${API_BASE_URL}rest/services/all/MapServer/layersConfig?lang=${lang}`)
                .then(({data: layersConfig}) => {
                    layersConfigByLang[lang] = layersConfig;
                    resolve(layersConfig);
                })
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
