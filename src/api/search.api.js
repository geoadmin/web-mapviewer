import axios from 'axios'
import { API_BASE_URL } from '@/config'
import { translateSwisstopoPyramidZoomToMercatorZoom } from '@/utils/zoomLevelUtils'

// API file that covers the backend endpoint http://api3.geo.admin.ch/services/sdiservices.html#search

/**
 * Enum for search result types
 * @readonly
 * @enum {String}
 */
export const RESULT_TYPE = {
  LAYER: 'LAYER',
  LOCATION: 'LOCATION',
}

// used to parse backend results and extract the title from sub-titles and other stuff
const REGEX_RESULT_TITLE = /<b>(.*?)<\/b>/i

/**
 * @abstract
 */
export class SearchResult {
  /**
   * @param {RESULT_TYPE} resultType
   * @param {String} title of this search result (can be HTML as a string)
   * @param {String} description a description of this search result (plain text only, no HTML)
   */
  constructor(resultType, title, description) {
    this.resultType = resultType
    this.title = title
    this.description = description
  }

  getId() {
    return this.getSimpleTitle()
  }

  /**
   * @returns the title without any HTML tags (will only keep what's inside <b> tag if there are)
   */
  getSimpleTitle() {
    if (REGEX_RESULT_TITLE.test(this.title)) {
      return REGEX_RESULT_TITLE.exec(this.title)[1]
    }
    return this.title
  }
}

export class LayerSearchResult extends SearchResult {
  constructor(title, description, layerId) {
    super(RESULT_TYPE.LAYER, title, description)
    this.layerId = layerId
  }

  getId() {
    return this.layerId
  }
}

export class FeatureSearchResult extends SearchResult {
  /**
   * @param {String} title of this search result (can be HTML as a string)
   * @param {String} description a description of this search result (plain text only, no HTML)
   * @param {Number} featureId the feature ID (if it exists) in the BGDI feature list
   * @param {Array<Number>} coordinates coordinates of this feature (in EPSG:3857)
   * @param {Array<Array<Number>>} extent an extent that describe where to zoom to show the whole search result, structure is [ [bottomLeftCoords], [topRightCoords] ]
   * @param {Number} zoom the zoom level at which the map should be zoomed when showing the feature (if extent is defined, this will be ignored)
   */
  constructor(title, description, featureId, coordinates = [], extent, zoom) {
    super(RESULT_TYPE.LOCATION, title, description)
    this.featureId = featureId
    this.coordinates = coordinates
    if (extent && extent.length === 2) {
      this.extent = extent
    } else {
      this.extent = []
      this.zoom = zoom
    }
  }

  getId() {
    if (this.featureId) {
      return this.featureId
    }
    return this.description
  }
}

export class CombinedSearchResults {
  /**
   * @param {Array<LayerSearchResult>} layerResults
   * @param {Array<FeatureSearchResult>} locationResults
   */
  constructor(layerResults = [], locationResults = []) {
    this.layerResults = layerResults
    this.locationResults = locationResults
  }

  count() {
    return this.layerResults.length + this.locationResults.length
  }
}

/**
 * @param {String} query
 * @param {String} lang
 * @param {String} type
 * @param {CancelToken} cancelToken
 * @returns Promise<Array<Any>>
 */
const generateAxiosSearchRequest = (query, lang, type, cancelToken) => {
  return axios.get(`${API_BASE_URL}/2008121130/rest/services/ech/SearchServer`, {
    cancelToken,
    params: {
      sr: 3857,
      searchText: query.trim(),
      lang: lang || 'en',
      type: type || 'locations',
    },
  })
}

let cancelToken = null
/**
 * @param {String} queryString the query string that describe what is wanted from the search
 * @param {String} lang the lang ISO code in which the search must be conducted
 * @returns {Promise<CombinedSearchResults>}
 */
const search = (queryString = '', lang = '') => {
  return new Promise((resolve, reject) => {
    if (!lang || lang.length !== 2) {
      const errorMessage = `A valid lang ISO code is required to start a search request, received: ${lang}`
      console.error(errorMessage)
      reject(errorMessage)
    }
    if (!queryString || queryString.length < 2) {
      const errorMessage = `At least to character are needed to launch a backend search, received: ${queryString}`
      console.error(errorMessage)
      reject(errorMessage)
    }
    // if a request is currently pending, we cancel it to start the new one
    if (cancelToken) {
      cancelToken.cancel('new search query')
    }
    cancelToken = axios.CancelToken.source()

    // combining the two types backend requests (locations and layers) with axios
    axios
      .all([
        generateAxiosSearchRequest(queryString, lang, 'locations', cancelToken.token),
        generateAxiosSearchRequest(queryString, lang, 'layers', cancelToken.token),
      ])
      .then((responses) => {
        const layerResults = []
        const locationResults = []
        if (responses && responses.length >= 2) {
          // reading location results
          if (responses[0].data && responses[0].data.results) {
            responses[0].data.results.forEach((location) => {
              // if the 'attrs' object is not present, we ignore the result (that's where all the juice is)
              if (!location.attrs) return
              // reading the main values from the attrs
              const { label: title, detail: description, featureId } = location.attrs
              // reading coordinates (if defined)
              const coordinate = []
              if (location.attrs.x && location.attrs.y) {
                coordinate.push(location.attrs.x)
                coordinate.push(location.attrs.y)
              }
              // reading the extent from the LineString (if defined)
              const extent = []
              const zoom = translateSwisstopoPyramidZoomToMercatorZoom(location.attrs.zoomlevel)
              if (location.attrs.geom_st_box2d) {
                const extentMatches = Array.from(
                  location.attrs.geom_st_box2d.matchAll(
                    /BOX\(([0-9\\.]+) ([0-9\\.]+),([0-9\\.]+) ([0-9\\.]+)\)/g
                  )
                )[0]
                const bottomLeft = [Number(extentMatches[1]), Number(extentMatches[2])]
                const topRight = [Number(extentMatches[3]), Number(extentMatches[4])]
                // checking if both point are the same (can happen if what is shown is a point of interest)
                if (bottomLeft[0] !== topRight[0] && bottomLeft[1] !== topRight[1]) {
                  extent.push(bottomLeft, topRight)
                }
              }
              locationResults.push(
                new FeatureSearchResult(title, description, featureId, coordinate, extent, zoom)
              )
            })
          }
          // reading layer results
          if (responses[1].data && responses[1].data.results) {
            responses[1].data.results.forEach((layer) => {
              // if object 'attrs' is not defined, we ignore this result
              if (!layer.attrs) return
              // reading attrs
              const { label: title, detail: description, layer: layerId } = layer.attrs
              layerResults.push(new LayerSearchResult(title, description, layerId))
            })
          }
        }
        resolve(new CombinedSearchResults(layerResults, locationResults))
        cancelToken = null
      })
  })
}

export default search
