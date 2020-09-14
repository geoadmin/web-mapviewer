import Vue from "vue";
import Vuex from "vuex";

import layers from "./modules/layers";
import position from "./modules/position";

import map from "@/modules/map/store"
import menu from "@/modules/menu/store";

import { getVuexURLSearchParams, pluginOptions } from "./plugins/vuex-url-search-params";

Vue.use(Vuex);

export default new Vuex.Store({
    plugins: [getVuexURLSearchParams(pluginOptions)],
    modules: {
        layers,
        position,
        map,
        menu
    }
});
