import { SET_LANG_MUTATION_KEY } from "@/modules/i18n/store/i18n.store"

// Reload (if necessary) the layers config on language change
const loadLayersConfigOnLangChange = store => {
    store.subscribe((mutation, state) => {
        if (mutation.type === SET_LANG_MUTATION_KEY) {
            store.commit('loadLayers', state.i18n.lang);
        }
    });
}

export default loadLayersConfigOnLangChange;
