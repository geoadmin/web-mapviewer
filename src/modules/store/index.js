import Vue from "vue";
import Vuex from "vuex";

import layers from "./modules/layers.store";
import position from "./modules/position.store";
import size from "./modules/size.store";

import map from "@/modules/map/store"
import overlay from "@/modules/overlay/store";
import menu from "@/modules/menu/store";
import search from "@/modules/search/store";
import i18n from "@/modules/i18n/store";

// import { getVuexURLSearchParams } from "./plugins/vuex-url-search-params";
import loadLayersConfigOnLangChange from "./plugins/load-layersconfig-on-lang-change";
import redoSearchOnLangChange from "./plugins/redo-search-on-lang-change.plugin";
// import pluginOptions from "./plugins/vuex-url-search-params.config";

Vue.use(Vuex);

export default new Vuex.Store({
    plugins: [
        // getVuexURLSearchParams(pluginOptions),
        loadLayersConfigOnLangChange,
        redoSearchOnLangChange,
    ],
    modules: {
        layers,
        position,
        size,
        map,
        overlay,
        menu,
        search,
        i18n
    }
});
