import { API_SERVICE_SEARCH_BASE_URL, DEFAULT_PROJECTION } from '@/config'
import { LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import LV95CoordinateSystem from '@/utils/coordinates/LV95CoordinateSystem.class'
import log from '@/utils/logging'
import axios from 'axios'
import proj4 from 'proj4'

// API file that covers the backend endpoint http://api3.geo.admin.ch/services/sdiservices.html#search

/**
 * Enum for search result types
 *
 * @readonly
 * @enum {String}
 */
export const RESULT_TYPE = {
    LAYER: 'LAYER',
    LOCATION: 'LOCATION',
}

// comes from https://stackoverflow.com/questions/5002111/how-to-strip-html-tags-from-string-in-javascript
const REGEX_DETECT_HTML_TAGS = /<\/?[^>]+(>|$)/g

/** @abstract */
export class SearchResult {
    /**
     * @param {RESULT_TYPE} resultType
     * @param {String} title Of this search result (can be HTML as a string)
     * @param {String} description A description of this search result (plain text only, no HTML)
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
     * @returns String The title without any HTML tags (will keep what's inside <b> or <i> tags if
     *   there are)
     */
    getSimpleTitle() {
        return this.title.replace(REGEX_DETECT_HTML_TAGS, '')
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
     * @param {String} title Of this search result (can be HTML as a string)
     * @param {String} description A description of this search result (plain text only, no HTML)
     * @param {Number} featureId The feature ID (if it exists) in the BGDI feature list
     * @param {Number[]} coordinates Coordinates of this feature (in EPSG:3857)
     * @param {Number[][]} extent An extent that describe where to zoom to show the whole search
     *   result, structure is [ [bottomLeftCoords], [topRightCoords] ]
     * @param {Number} zoom The zoom level at which the map should be zoomed when showing the
     *   feature (if extent is defined, this will be ignored)
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
     * @param {LayerSearchResult[]} layerResults
     * @param {FeatureSearchResult[]} locationResults
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
    return axios.get(`${API_SERVICE_SEARCH_BASE_URL}rest/services/ech/SearchServer`, {
        cancelToken,
        params: {
            sr: LV95.epsgNumber,
            searchText: query.trim(),
            lang: lang || 'en',
            type: type || 'locations',
        },
    })
}

let cancelToken = null
/**
 * @param {String} queryString The query string that describe what is wanted from the search
 * @param {String} lang The lang ISO code in which the search must be conducted
 * @param {CoordinateSystem} outputProjection The projection in which the search results must be
 *   returned
 * @returns {Promise<CombinedSearchResults>}
 */
async function search(queryString = '', lang = '', outputProjection = DEFAULT_PROJECTION) {
    if (!lang || lang.length !== 2) {
        const errorMessage = `A valid lang ISO code is required to start a search request, received: ${lang}`
        log.error(errorMessage)
        throw Error(errorMessage)
    }
    if (!queryString || queryString.length < 2) {
        const errorMessage = `At least to character are needed to launch a backend search, received: ${queryString}`
        log.error(errorMessage)
        throw Error(errorMessage)
    }
    // if a request is currently pending, we cancel it to start the new one
    if (cancelToken) {
        cancelToken.cancel('new search query')
    }
    cancelToken = axios.CancelToken.source()

    // combining the two types backend requests (locations and layers) with axios
    const layerResponsePromise = generateAxiosSearchRequest(
        queryString,
        lang,
        'layers',
        cancelToken.token
    )
    const locationResponsePromise = generateAxiosSearchRequest(
        queryString,
        lang,
        'locations',
        cancelToken.token
    )
    const layerResults = []
    const locationResults = []
    try {
        const layerResponse = await layerResponsePromise
        layerResponse?.data.results?.forEach((layer) => {
            // if object 'attrs' is not defined, we ignore this result
            if (!layer.attrs) {
                return
            }
            // reading attrs
            const { label: title, detail: description, layer: layerId } = layer.attrs
            layerResults.push(new LayerSearchResult(title, description, layerId))
        })
    } catch (error) {
        log.error(`Failed to search layer, fallback to empty result`, error)
    }
    try {
        const locationResponse = await locationResponsePromise
        locationResponse?.data.results?.forEach((location) => {
            // if the 'attrs' object is not present, we ignore the result (that's where all the juice is)
            if (!location.attrs) {
                return
            }
            // reading the main values from the attrs
            const { label: title, detail: description, featureId } = location.attrs

            let coordinate = []
            let zoom = location.attrs.zoomlevel
            if (location.attrs.lon && location.attrs.lat) {
                coordinate = [location.attrs.lon, location.attrs.lat]
                if (outputProjection.epsg !== WGS84.epsg) {
                    coordinate = proj4(WGS84.epsg, outputProjection.epsg, coordinate)
                }
            }
            if (!(outputProjection instanceof LV95CoordinateSystem)) {
                // re-projecting result coordinate and zoom to wanted projection
                zoom = LV95.transformCustomZoomLevelToStandard(zoom)
                if (outputProjection instanceof CustomCoordinateSystem) {
                    zoom = outputProjection.transformStandardZoomLevelToCustom(zoom)
                }
            }
            // reading the extent from the LineString (if defined)
            const extent = []
            if (location.attrs.geom_st_box2d) {
                const extentMatches = Array.from(
                    location.attrs.geom_st_box2d.matchAll(
                        /BOX\(([0-9\\.]+) ([0-9\\.]+),([0-9\\.]+) ([0-9\\.]+)\)/g
                    )
                )[0]
                let bottomLeft = [Number(extentMatches[1]), Number(extentMatches[2])]
                let topRight = [Number(extentMatches[3]), Number(extentMatches[4])]
                if (outputProjection.epsg !== LV95.epsg) {
                    bottomLeft = proj4(LV95.epsg, outputProjection.epsg, bottomLeft)
                    topRight = proj4(LV95.epsg, outputProjection.epsg, topRight)
                }
                // checking if both point are the same (can happen if what is shown is a point of interest)
                if (bottomLeft[0] !== topRight[0] && bottomLeft[1] !== topRight[1]) {
                    extent.push(bottomLeft, topRight)
                }
            }
            locationResults.push(
                new FeatureSearchResult(title, description, featureId, coordinate, extent, zoom)
            )
        })
    } catch (error) {
        log.error(`Failed to search locations, fallback to empty result`, error)
    }
    cancelToken = null
    return new CombinedSearchResults(layerResults, locationResults)
}

export default search
