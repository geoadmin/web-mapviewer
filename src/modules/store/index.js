import Vue from "vue";
import Vuex from "vuex";

import app from "./modules/app.store";
import layers from "./modules/layers.store";
import position from "./modules/position.store";
import size from "./modules/size.store";

import map from "@/modules/map/store"
import overlay from "@/modules/overlay/store";
import menu from "@/modules/menu/store";
import search from "@/modules/search/store";
import i18n from "@/modules/i18n/store";

import loadLayersConfigOnLangChange from "./plugins/load-layersconfig-on-lang-change";
import redoSearchOnLangChange from "./plugins/redo-search-on-lang-change.plugin";
import menuSearchBarAndOverlayInteractionManagementPlugin from "./plugins/menu-search-overlay-interaction.plugin";
import clickOnMapManagementPlugin from "./plugins/click-on-map-management.plugin";
import appReadinessPlugin from "./plugins/app-readiness.plugin";

Vue.use(Vuex);

export default new Vuex.Store({
    strict: true,
    plugins: [
        loadLayersConfigOnLangChange,
        redoSearchOnLangChange,
        menuSearchBarAndOverlayInteractionManagementPlugin,
        clickOnMapManagementPlugin,
        appReadinessPlugin,
    ],
    modules: {
        app,
        layers,
        position,
        size,
        map,
        overlay,
        menu,
        search,
        i18n,
    }
});
