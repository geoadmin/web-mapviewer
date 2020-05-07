import Vue from "vue";
import Vuex from "vuex";

import layers from "./modules/layers";
import position from "./modules/position";

import map from "@/modules/map/store"

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        layers,
        position,
        map
    }
});
