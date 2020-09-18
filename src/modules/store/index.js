import Vue from "vue";
import Vuex from "vuex";

import layers from "./modules/layers";
import position from "./modules/position";

import map from "@/modules/map/store"
import menu from "@/modules/menu/store";
import i18n from "@/modules/i18n/store";

import { getVuexURLSearchParams } from "./plugins/vuex-url-search-params";
import pluginOptions from "./plugins/vuex-url-search-params.config";

Vue.use(Vuex);

export default new Vuex.Store({
    plugins: [getVuexURLSearchParams(pluginOptions)],
    modules: {
        layers,
        position,
        map,
        menu,
        i18n
    }
});
