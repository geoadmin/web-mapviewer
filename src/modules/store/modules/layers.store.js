import {reproject} from "reproject";
import axios from "axios";
import proj4 from "proj4";

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

const BASE_URL_GEOJSON = "https://data.geo.admin.ch/";
const BASE_URL_BACKEND = "https://api3.geo.admin.ch/";

function generateGeoJsonBaseUrl(layerId) {
    return BASE_URL_GEOJSON + layerId + "/" + layerId + "_en.json";
}

const state = {
    layers: []
};

const getters = {
    visibleLayers: state => {
        return state.layers.filter(layer => layer.visible && !layer.fetching);
    }
};

const actions = {
    toggleLayerVisibility: ({ commit }, layerId) => commit("toggleLayerVisibility", layerId),
    loadLayers: ({ commit, rootScope }) => commit("loadLayers", rootScope.i18n.lang),
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
                                `${BASE_URL_BACKEND}/static/vectorStyles/${layerId}.json`
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
    loadLayers: (state, lang) => {
        axios.get(`${BASE_URL_BACKEND}rest/services/all/MapServer/layersConfig?lang=${lang}`)
            .then(response => response.json())
            .then(layersConfig => {
                console.log("layersConfig", layersConfig);
            })
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
