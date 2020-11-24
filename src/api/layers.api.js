import {API_BASE_URL, WMTS_BASE_URL} from "@/config";
import axios from "axios";

/**
 * @readonly
 * @enum {String}
 */
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

/**
 * @class
 * @name layers:Layer
 * Base class for Layer config description, must be extended to a more specific flavor of Layer
 * (e.g. {@link WMTSLayer}, {@link WMSLayer} or {@link GeoJsonLayer})
 */
export class Layer {
    /**
     * @param {String} name
     * @param {LayerTypes} type
     * @param {String} id
     * @param {Number} opacity
     * @param {Boolean} isBackground
     * @param {String} baseURL
     */
    constructor(name= '',
                type= null,
                id= '',
                opacity = 1.0,
                isBackground = false,
                baseURL = null) {
        this.name = name;
        this.type = type;
        this.id = id;
        this.opacity = opacity;
        this.isBackground = isBackground;
        this.baseURL = baseURL;
        if (this.baseURL && !this.baseURL.endsWith('/')) {
            this.baseURL = this.baseURL + '/';
        }
        this.isSpecificFor3D = id.toLowerCase().endsWith('_3d');
        this.visible = false;
        this.projection = 'EPSG:3857';
    }

    /**
     * @abstract
     * @return {String}
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
     * @param {Boolean} isBackground if this layer should be treated as a background layer
     * @param {String} baseURL the base URL to be used to request tiles (can use the {0-9} notation to describe many available backends)
     */
    constructor(name= '',
                id= '',
                opacity= 1.0,
                format = 'png',
                timeSeriesConfig = null,
                isBackground = false,
                baseURL = null) {
        super(name, LayerTypes.WMTS, id, opacity, isBackground, baseURL);
        this.format = format;
        this.timeSeriesConfig = timeSeriesConfig;
    }

    getURL() {
        let timestamp = 'current';
        if (this.timeSeriesConfig) {
            timestamp = this.timeSeriesConfig.currentTimestamp
        }
        return `${this.baseURL}1.0.0/${this.id}/default/${timestamp}/3857/{z}/{x}/{y}.${this.format}`;
    }

    /**
     * Resolve the {x-y} notation used in WMTS URLs and outputs all possible URLs
     *
     * Example : `"https://wmts{1-3}.geo.admin.ch"` will outputs `[ "https://wmts1.geo.admin.ch", "https://wmts3.geo.admin.ch", "https://wmts3.geo.admin.ch" ]`
     *
     * @returns {Array<String>} all possible backend URLs for this layer
     */
    getURLs() {
        const mainURL = this.getURL();
        const urls = [];
        const bracketNotationMatches = /.*{([0-9-]+)}.*/.exec(mainURL);
        if (bracketNotationMatches && bracketNotationMatches.length >= 2) {
            const bracketNotation = {
                start: Number(bracketNotationMatches[1].split("-")[0]),
                end: Number(bracketNotationMatches[1].split("-")[1])
            };
            for (let i = bracketNotation.start; i < bracketNotation.end; i += 1) {
                urls.push(mainURL.replace(`{${bracketNotation.start}-${bracketNotation.end}}`, i));
            }
            if (urls.length === 0) {
                urls.push(mainURL);
            }
        } else {
            urls.push(mainURL);
        }
        return urls;
    }
}

export class WMSLayer extends Layer {
    constructor(name, id, opacity, baseURL, format) {
        super(name, LayerTypes.WMS, id, opacity, baseURL);
        this.format = format;
    }

    getURL() {
        return `${this.baseURL}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2F${this.format}&TRANSPARENT=true&LAYERS=${this.id}&LANG=en`;
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

const generateClassForLayerConfig = (layerConfig) => {
    let layer = undefined;
    if (layerConfig) {
        const { serverLayerName: id, label: name, type, opacity, format, background } = layerConfig;
        let timeEnableConfig = null;
        if (layerConfig.timeEnabled) {
            timeEnableConfig = new TimeSeriesConfig(layerConfig.timeBehaviour, layerConfig.timestamps);
        }
        switch(type.toLowerCase()) {
            case 'wmts':
                layer = new WMTSLayer(name, id, opacity, format, timeEnableConfig, background, WMTS_BASE_URL);
                break;
            case 'wms':
                layer = new WMSLayer(name, id, opacity, layerConfig.wmsUrl, format);
                break;
            case 'geojson':
                layer = new GeoJsonLayer(name, id, opacity);
                break;
            case 'aggregate':
                // TODO handle aggregate layers
                console.error('Aggregate layer not yet implemented')
                break;
            default:
                console.error('Unknown layer type', type);
        }
    }
    return layer;
}

/**
 * Loads the layers config from the backend and transforms it in classes defined in this API file
 * @param {String} lang the ISO code for the lang in which the config should be loaded (required)
 * @returns {Promise<Layer[]>}
 */
const loadLayersConfigFromBackend = (lang) => {
    return new Promise((resolve, reject) => {
        if (!API_BASE_URL) {
            // this could happen if we are testing the app in unit tests, we simply reject and do nothing
            reject('API base URL is undefined');
        } else {
            const layersConfig = [];
            axios.get(`${API_BASE_URL}rest/services/all/MapServer/layersConfig?lang=${lang}`)
                .then(({data: rawLayersConfig}) => {
                    if (Object.keys(rawLayersConfig).length > 0) {
                        Object.keys(rawLayersConfig).forEach(rawLayerId => {
                            const rawLayer = rawLayersConfig[rawLayerId];
                            const layer = generateClassForLayerConfig(rawLayer);
                            if (layer) layersConfig.push(layer)
                        })
                        resolve(layersConfig);
                    } else {
                        reject('LayersConfig loaded from backend is not an defined or is empty');
                    }
                }).catch((error) => {
                const message = 'Error while loading layers config from backend';
                console.error(message, error);
                reject(message);
            })
        }
    })
}

export default loadLayersConfigFromBackend;
