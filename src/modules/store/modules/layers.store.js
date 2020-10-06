import {reproject} from "reproject";
import axios from "axios";
import proj4 from "proj4";
import {API_BASE_URL, DATA_BASE_URL} from "@/config";

proj4.defs(
    "EPSG:21781",
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs"
);

export class Layer {
    constructor(name, type, id) {
        this.name = name;
        this.type = type;
        this.id = id;
        this.visible = false;
    }
}

export class GeoJsonLayer extends Layer {
    constructor(name, type, id) {
        super(name, type, id);
        this.data = null;
        this.style = null;
        this.fetching = false;
    }
}

function generateGeoJsonBaseUrl(layerId) {
    return DATA_BASE_URL + layerId + "/" + layerId + "_en.json";
}

const state = {
    layers: [],
    config: {}
};

const getters = {
    visibleLayers: state => {
        return state.layers.filter(layer => layer.visible && !layer.fetching);
    }
};

const actions = {
    toggleLayerVisibility: ({ commit }, layerId) => commit("toggleLayerVisibility", layerId),
    setLayerConfig: ({commit}, config) => commit('setLayerConfig', config),
};

const mutations = {
    toggleLayerVisibility: function (state, layerId) {
        const layer = state.layers.find(layer => layer.id === layerId);
        if (layer) {
            // if GeoJSON data are not yet loaded, we do so
            if (layer.type === "GeoJSON" && !layer.data) {
                layer.fetching = true;
                axios.get(generateGeoJsonBaseUrl(layer.id))
                    .then(response => response.json())
                    .then(geojsonData => {
                        const geojsonCRS = geojsonData.crs.properties.name;
                        if (geojsonCRS && geojsonCRS !== "EPSG:3857") {
                            geojsonData = reproject(
                                geojsonData,
                                proj4(geojsonCRS),
                                proj4.WGS84
                            );
                        }
                        layer.data = geojsonData;

                        if (!layer.style) {
                            // checking if a style exists in BGDI
                            fetch(
                                `${API_BASE_URL}/static/vectorStyles/${layerId}.json`
                            )
                                .then(response => response.json())
                                .then(styleJson => {
                                    layer.style = styleJson;
                                    layer.visible = !layer.visible;
                                    layer.fetching = false;
                                });
                        } else {
                            layer.visible = !layer.visible;
                            layer.fetching = false;
                        }
                    });
            } else {
                layer.visible = !layer.visible;
            }
        }
    },
    setLayerConfig: (state, config) => state.config = config
};

export default {
    state,
    getters,
    actions,
    mutations
};
