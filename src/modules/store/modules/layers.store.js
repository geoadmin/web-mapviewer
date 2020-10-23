import {reproject} from "reproject";
import axios from "axios";
import proj4 from "proj4";
import {API_BASE_URL, DATA_BASE_URL} from "@/config";
import {WMTS_BASE_URL} from "../../../config";

// defining LV03 and LV95 proj4 projection with lines from https://epsg.io/2056 and https://epsg.io/21781
proj4.defs("EPSG:2056", "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs");
proj4.defs("EPSG:21781", "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs");

export const LayerTypes = {
    WMTS: 'wmts',
    WMS: 'wms',
    GEOJSON: 'geojson'
};

export class TimeSeriesConfig {

    /**
     *
     * @param {String} behaviour how the default time series is chosen
     * @param {Array<String>} series list of series identifier (that can be placed in the WMTS URL)
     */
    constructor(behaviour = "last", series = []) {
        this.behaviour = behaviour;
        this.series = series;
        this.currentTimestamp = null;
        if (this.series.length > 0) {
            switch (this.behaviour) {
                case 'last':
                    this.currentTimestamp = this.series[0];
            }
        }
    }
}

export class Layer {
    /**
     * @param {String} name
     * @param {Object} type
     * @param {String} id
     * @param {Number} opacity
     */
    constructor(name, type, id, opacity) {
        this.name = name;
        this.type = type;
        this.id = id;
        this.opacity = opacity;
        this.visible = false;
        this.projection = 'EPSG:3857';
    }

    /**
     * Implementation required
     */
    getURL() {
        throw new Error('You have to implement the method getURL!');
    }
}

export class WMTSLayer extends Layer {
    /**
     * @param {String} name layer name (internationalized)
     * @param {String} id layer ID in the BOD
     * @param {Number} opacity opacity value between 0.0 (transparent) and 1.0 (visible)
     * @param {String} format image format for this WMTS layer (jpeg or png)
     * @param {TimeSeriesConfig} timeSeriesConfig config for layer that are time enabled
     */
    constructor(name= '', id= '', opacity= 1.0, format = 'png', timeSeriesConfig = null) {
        super(name, LayerTypes.WMTS, id, opacity);
        this.format = format;
        this.timeSeriesConfig = timeSeriesConfig;
    }

    getURL() {
        let timestamp = 'current';
        if (this.timeSeriesConfig) {
            timestamp = this.timeSeriesConfig.currentTimestamp
        }
        return `${WMTS_BASE_URL}1.0.0/${this.id}/default/${timestamp}/3857/{z}/{x}/{y}.${this.format}`;
    }
}

export class WMSLayer extends Layer {
    constructor(name, id, opacity, baseUrl, format) {
        super(name, LayerTypes.WMS, id, opacity);
        this.format = format;
    }

    getURL() {
        return `${this.baseUrl}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2F${this.format}&TRANSPARENT=true&LAYERS=${this.id}&LANG=en`;
    }
}

export class GeoJsonLayer extends Layer {
    constructor(name, id, opacity) {
        super(name, LayerTypes.GEOJSON, id, opacity);
        this.data = null;
        this.style = null;
        this.fetching = false;
    }
}

function generateGeoJsonBaseUrl(layerId) {
    return DATA_BASE_URL + layerId + "/" + layerId + "_en.json";
}

function generateClassForLayerConfig(layerConfig) {
    let layer = undefined;
    if (layerConfig) {
        const { serverLayerName: id, label: name, type, opacity, format } = layerConfig;
        let timeEnableConfig = null;
        if (layerConfig.timeEnabled) {
            timeEnableConfig = new TimeSeriesConfig(layerConfig.timeBehaviour, layerConfig.timestamps);
        }
        switch(type.toLowerCase()) {
            case 'wmts':
                layer = new WMTSLayer(name, id, opacity, format, timeEnableConfig);
                break;
            case 'wms':
                layer = new WMSLayer(name, id, opacity, layerConfig.wmsUrl, format);
                break;
            default:
                layer = new GeoJsonLayer(name, id, opacity);
        }
    }
    return layer;
}

const state = {
    backgroundIndex: 0,
    activeLayers: [],
    config: {},
    pinLocation: null
};

const getters = {
    visibleLayers: state => state.activeLayers.filter(layer => layer.visible && !layer.fetching),
    backgroundLayers: state => {
        const backgroundLayers = [];
        Object.keys(state.config).forEach(layerId => {
            if (state.config[layerId].background && !layerId.endsWith('_3d')) {
                backgroundLayers.push(generateClassForLayerConfig(state.config[layerId]));
            }
        });
        return backgroundLayers;
    },
    currentBackgroundLayer: (state, getters) => {
        const bgLayers = getters.backgroundLayers;
        if (bgLayers && bgLayers.length > 0)
            return bgLayers[state.backgroundIndex]
        return undefined;
    },
};

const actions = {
    toggleLayerVisibility: ({ commit }, layerId) => commit("toggleLayerVisibility", layerId),
    addLayer: ({commit}, layerId) => commit('addLayer', layerId),
    addLocation: ({commit}, coordsEPSG3857) => commit('addLocation', coordsEPSG3857),
    removeLayer: ({commit}, layerId) => commit('removeLayer', layerId),
    setLayerConfig: ({commit}, config) => commit('setLayerConfig', config),
    setBackgroundIndex: ({commit}, index) => commit('setBackgroundIndex', index),
};

const mutations = {
    toggleLayerVisibility: function (state, layerId) {
        const layer = state.activeLayers.find(layer => layer.id === layerId);
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
    addLayer: (state, layerId) => {
        // if the layer is already active, we skip the adding
        if (state.activeLayers.find(layer => layer.id === layerId)) return;
        // otherwise we load the config for this layer and create the correct object depending on the layer's type
        const layer = generateClassForLayerConfig(state.config[layerId]);
        if (layer) {
            layer.visible = true;
            state.activeLayers.push(layer);
        }
    },
    addLocation: (state, {x, y}) => {
        state.pinLocation = { x, y };
    },
    removeLayer: (state, layerId) => state.activeLayers = state.activeLayers.filter(layer => layer.id !== layerId),
    setLayerConfig: (state, config) => state.config = config,
    setBackgroundIndex: (state, index) => state.backgroundIndex = index,
};

export default {
    state,
    getters,
    actions,
    mutations
};
