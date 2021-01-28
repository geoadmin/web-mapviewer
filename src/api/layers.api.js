import { API_BASE_URL, WMTS_BASE_URL, WMS_BASE_URL } from '@/config'
import axios from 'axios'

/**
 * @readonly
 * @enum {String}
 */
export const LayerTypes = {
  WMTS: 'wmts',
  WMS: 'wms',
  GEOJSON: 'geojson',
  AGGREGATE: 'aggregate',
}

/**
 * @class
 * @name layers:TimeConfig
 *
 * Time configuration for a {@link WMTSLayer} or {@link WMSLayer}. It will determine which "timestamp" to add
 * to the URL used to request tiles/image.
 */
export class TimeConfig {
  /**
   * @param {String} behaviour how the default time series is chosen
   * @param {Array<String>} series list of series identifier (that can be placed in the WMTS URL)
   */
  constructor(behaviour = null, series = []) {
    this.behaviour = behaviour
    this.series = [...series]
    // first let's tackle layers that have "last" as a timestamp (can be both WMS and WMTS layers)
    // we will return, well, the last timestamp of the series (if there are some)
    if (this.behaviour === 'last' && this.series.length > 0) {
      this.currentTimestamp = this.series[0]
    } else if (this.behaviour) {
      // otherwise if it is a layer that has a specific behaviour (could be "all" for WMS, or a specific timestamp for either type)
      this.currentTimestamp = this.behaviour
    } else if (this.series.length > 0) {
      // if nothing has been defined in the behaviour, but there are some timestamps defined, we take the first
      this.currentTimestamp = this.series[0]
    } else {
      // if no behaviour and no timestamp are defined, we go for "current". This should not happen with WMS layer,
      // as the "current" timestamp in not supported for them but they should always define a behaviour in
      // the BOD configuration, so this is for WMTS layer without time configuration
      this.currentTimestamp = 'current'
    }
  }
}

/**
 * @class
 * @name layers:Layer
 *
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
   * @param {Boolean} isHighlightable TODO define what the heck this is
   * @param {Boolean} hasTooltip define if this layer shows tooltip when clicked on
   * @param {Array<String>} topics
   */
  constructor(
    name = '',
    type = null,
    id = '',
    opacity = 1.0,
    isBackground = false,
    baseURL = null,
    isHighlightable = false,
    hasTooltip = false,
    topics = []
  ) {
    this.name = name
    this.type = type
    this.id = id
    this.opacity = opacity
    this.isBackground = isBackground
    this.baseURL = baseURL
    if (this.baseURL && !this.baseURL.endsWith('/')) {
      this.baseURL = this.baseURL + '/'
    }
    this.isHighlightable = isHighlightable
    this.hasTooltip = hasTooltip
    this.topics = topics
    this.isSpecificFor3D = id.toLowerCase().endsWith('_3d')
    this.visible = false
    this.projection = 'EPSG:3857'
  }

  /**
   * @abstract
   * @return {String}
   */
  getURL() {
    throw new Error('You have to implement the method getURL!')
  }

  getTopicForIdentifyAndTooltipRequests() {
    // by default, the frontend should always request `ech`, so if there's no topic that's what we do
    // if there are some topics, we look if `ech` is one of them, if so we return it
    if (this.topics.length === 0 || this.topics.indexOf('ech') !== -1) {
      return 'ech'
    }
    // otherwise we return the first topic to make our backend requests for identify and htmlPopup
    return this.topics[0]
  }
}

export class WMTSLayer extends Layer {
  /**
   * @param {String} name layer name (internationalized)
   * @param {String} id layer ID in the BOD
   * @param {Number} opacity opacity value between 0.0 (transparent) and 1.0 (visible)
   * @param {String} format image format for this WMTS layer (jpeg or png)
   * @param {TimeConfig} timeConfig settings telling which timestamp has to be used when request tiles to the backend
   * @param {Boolean} isBackground if this layer should be treated as a background layer
   * @param {String} baseURL the base URL to be used to request tiles (can use the {0-9} notation to describe many available backends)
   * @param {Boolean} isHighlightable
   * @param {Boolean} hasTooltip
   */
  constructor(
    name = '',
    id = '',
    opacity = 1.0,
    format = 'png',
    timeConfig = null,
    isBackground = false,
    baseURL = null,
    isHighlightable = false,
    hasTooltip = false
  ) {
    super(name, LayerTypes.WMTS, id, opacity, isBackground, baseURL, isHighlightable, hasTooltip)
    this.format = format
    this.timeConfig = timeConfig
  }

  getURL() {
    return `${this.baseURL}1.0.0/${this.id}/default/${this.timeConfig.currentTimestamp}/3857/{z}/{x}/{y}.${this.format}`
  }

  /**
   * Resolve the {x-y} notation used in WMTS URLs and outputs all possible URLs
   *
   * Example : `"https://wmts{1-3}.geo.admin.ch"` will outputs `[ "https://wmts1.geo.admin.ch", "https://wmts3.geo.admin.ch", "https://wmts3.geo.admin.ch" ]`
   *
   * @returns {Array<String>} all possible backend URLs for this layer
   */
  getURLs() {
    const mainURL = this.getURL()
    const urls = []
    const bracketNotationMatches = /.*{([0-9-]+)}.*/.exec(mainURL)
    if (bracketNotationMatches && bracketNotationMatches.length >= 2) {
      const bracketNotation = {
        start: Number(bracketNotationMatches[1].split('-')[0]),
        end: Number(bracketNotationMatches[1].split('-')[1]),
      }
      for (let i = bracketNotation.start; i < bracketNotation.end; i += 1) {
        urls.push(mainURL.replace(`{${bracketNotation.start}-${bracketNotation.end}}`, i))
      }
      if (urls.length === 0) {
        urls.push(mainURL)
      }
    } else {
      urls.push(mainURL)
    }
    return urls
  }
}

export class WMSLayer extends Layer {
  /**
   * @param {String} name the name of this layer (lang specific)
   * @param {String} id the ID of this layer in the BOD
   * @param {Number} opacity the opacity to apply to this layer
   * @param {String} baseURL the backend to call for tiles
   * @param {String} format in which image format the backend must be requested
   * @param {TimeConfig} timeConfig settings telling which year has to be used when request tiles to the backend
   * @param {String} lang the lang ISO code to use when requesting the backend
   * @param {Number} gutter how much of a gutter we want (specific for tiled WMS, if unset this layer will be a single tile WMS)
   * @param {Boolean} isHighlightable
   * @param {Boolean} hasTooltip
   */
  constructor(
    name,
    id,
    opacity,
    baseURL,
    format,
    timeConfig,
    lang = 'en',
    gutter = -1,
    isHighlightable = false,
    hasTooltip = false
  ) {
    super(name, LayerTypes.WMS, id, opacity, false, baseURL, isHighlightable, hasTooltip)
    this.format = format
    this.timeConfig = timeConfig
    this.lang = lang
    this.gutter = gutter
  }

  getURL() {
    const urlWithoutTime = `${
      this.baseURL ? this.baseURL : WMS_BASE_URL
    }?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2F${
      this.format
    }&TRANSPARENT=true&LAYERS=${this.id}&LANG=${this.lang}`
    if (this.timeConfig && this.timeConfig.currentTimestamp !== 'all') {
      return urlWithoutTime + '&TIME=' + this.timeConfig.currentTimestamp
    }
    return urlWithoutTime
  }
}

export class GeoJsonLayer extends Layer {
  constructor(name, id, opacity, geoJsonUrl, styleUrl) {
    super(name, LayerTypes.GEOJSON, id, opacity)
    this.geoJsonUrl = geoJsonUrl
    this.styleUrl = styleUrl
  }

  getURL() {
    return this.geoJsonUrl
  }
}

/**
 * A sub-layer of an aggregate layer. Will define at which resolution this sub-layer should be shown (shouldn't overlap other sub-layers from the aggregate)
 */
export class AggregateSubLayer {
  /**
   * @param {String} subLayerId the ID used in the BOD to describe this sub-layer
   * @param {Layer} layer the sub-layer config (can be a {@link GeoJsonLayer}, a {@link WMTSLayer} or a {@link WMTSLayer})
   * @param {Number} minResolution in meter/px, at which resolution this sub-layer should start to be visible
   * @param {Number} maxResolution in meter/px, from which resolution the layer should be hidden
   */
  constructor(
    subLayerId,
    layer,
    minResolution = Number.MIN_SAFE_INTEGER,
    maxResolution = Number.MAX_SAFE_INTEGER
  ) {
    this.subLayerId = subLayerId
    this.layer = layer
    this.minResolution = minResolution
    this.maxResolution = maxResolution
  }
}

/**
 * An aggregate layer is a combination of 2 or more layers where only one of them will be shown at a time.
 * Which one is shown is decided by the map resolution, and by the min/max resolution of all sub-layer's config
 */
export class AggregateLayer extends Layer {
  /**
   * @param {String} name the name of this layer in the given lang
   * @param {String} id the layer ID in the BOD
   * @param {Number} opacity the opacity to be applied to this layer
   * @param {TimeConfig} timeConfig time series config (if available)
   */
  constructor(name, id, opacity, timeConfig) {
    super(name, LayerTypes.AGGREGATE, id, opacity)
    this.timeConfig = timeConfig
    this.subLayers = []
  }

  /**
   * @param {AggregateSubLayer} subLayer
   */
  addSubLayer(subLayer) {
    this.subLayers.push(subLayer)
  }

  getURL() {
    throw new Error("Aggregate layers shouldn't be asked directly for URL, but sub-layers should")
  }
}

const generateClassForLayerConfig = (layerConfig, id, allOtherLayers, lang) => {
  let layer = undefined
  if (layerConfig) {
    const {
      label: name,
      type,
      opacity,
      format,
      background,
      highlightable: isHighlightable,
      tooltip: hasTooltip,
    } = layerConfig
    const timeConfig = new TimeConfig(layerConfig.timeBehaviour, layerConfig.timestamps)
    switch (type.toLowerCase()) {
      case 'wmts':
        layer = new WMTSLayer(
          name,
          id,
          opacity,
          format,
          timeConfig,
          !!background,
          WMTS_BASE_URL,
          isHighlightable,
          hasTooltip
        )
        break
      case 'wms':
        layer = new WMSLayer(
          name,
          id,
          opacity,
          layerConfig.wmsUrl,
          format,
          timeConfig,
          lang,
          layerConfig.gutter,
          isHighlightable,
          hasTooltip
        )
        break
      case 'geojson':
        layer = new GeoJsonLayer(name, id, opacity, layerConfig.geojsonUrl, layerConfig.styleUrl)
        break
      case 'aggregate':
        // here it's a bit tricky, the aggregate layer has a main entry in the BOD (with everything as usual)
        // but things get complicated with sub-layers. Each sub-layer has an entry in the BOD but it's ID (or
        // key in the BOD) is not the one we should ask the server with, that would be the serverLayerName prop,
        // but the parent layer will describe it's child layers with another identifier, which is the key to the
        // raw config in the big BOD config object.
        // here's an example:
        // {
        //   "parent.layer": {
        //      "serverLayerName": "i.am.a.big.aggregate.layer",
        //      "subLayersIds": [
        //          "i.am.a.sub.layer_1", <-- that will be the key to another object
        //          "i.am.a.sub.layer_2",
        //      ]
        //   },
        //   "i.am.a.sub.layer_1": { <-- that's one of the "subLayersIds"
        //       "serverLayerName": "hey.i.am.not.the.same.as.the.sublayer.id", <-- that's the ID that should be used to ask the server for tiles
        //   },
        // }

        // here id would be "parent.layer" in the example above
        layer = new AggregateLayer(name, id, opacity, timeConfig)
        layerConfig.subLayersIds.forEach((subLayerId) => {
          // each subLayerId is one of the "subLayersIds", so "i.am.a.sub.layer_1" or "i.am.a.sub.layer_2" from the example above
          const subLayerRawConfig = allOtherLayers[subLayerId]
          // the "real" layer ID (the one that will be used to request the backend) is the serverLayerName of this config
          // (see example above, that would be "hey.i.am.not.the.same.as.the.sublayer.id")
          const subLayer = generateClassForLayerConfig(
            subLayerRawConfig,
            subLayerRawConfig.serverLayerName,
            allOtherLayers,
            lang
          )
          if (subLayer) {
            layer.addSubLayer(
              new AggregateSubLayer(
                subLayerId,
                subLayer,
                subLayerRawConfig.minResolution,
                subLayerRawConfig.maxResolution
              )
            )
          }
        })

        break
      default:
        console.error('Unknown layer type', type)
    }
  }
  return layer
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
      reject('API base URL is undefined')
    } else {
      const layersConfig = []
      axios
        .get(`${API_BASE_URL}rest/services/all/MapServer/layersConfig?lang=${lang}`)
        .then(({ data: rawLayersConfig }) => {
          if (Object.keys(rawLayersConfig).length > 0) {
            Object.keys(rawLayersConfig).forEach((rawLayerId) => {
              const rawLayer = rawLayersConfig[rawLayerId]
              const layer = generateClassForLayerConfig(rawLayer, rawLayerId, rawLayersConfig, lang)
              if (layer) {
                layersConfig.push(layer)
              }
            })
            resolve(layersConfig)
          } else {
            reject('LayersConfig loaded from backend is not an defined or is empty')
          }
        })
        .catch((error) => {
          const message = 'Error while loading layers config from backend'
          console.error(message, error)
          reject(message)
        })
    }
  })
}

export default loadLayersConfigFromBackend
