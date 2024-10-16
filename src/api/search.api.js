import bbox from '@turf/bbox'
import center from '@turf/center'
import { points } from '@turf/helpers'
import axios from 'axios'
import proj4 from 'proj4'

import { extractOlFeatureCoordinates } from '@/api/features/features.api'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { getServiceSearchBaseUrl } from '@/config/baseUrl.config'
import i18n from '@/modules/i18n'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import { LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import LV95CoordinateSystem from '@/utils/coordinates/LV95CoordinateSystem.class'
import { normalizeExtent } from '@/utils/extentUtils'
import { parseGpx } from '@/utils/gpxUtils'
import { parseKml } from '@/utils/kmlUtils'
import log from '@/utils/logging'

const KML_GPX_SEARCH_FIELDS = ['name', 'description', 'id']

// API file that covers the backend endpoint http://api3.geo.admin.ch/services/sdiservices.html#search

/**
 * Error when building/sending/parsing a search request
 *
 * @property {String} message Technical english message
 */
export class SearchError extends Error {
    constructor(message) {
        super(message)
        this.name = 'SearchError'
    }
}

/**
 * Enum for search result types
 *
 * @readonly
 * @enum {String}
 */
export const SearchResultTypes = {
    LAYER: 'LAYER',
    LOCATION: 'LOCATION',
    FEATURE: 'FEATURE',
}

// comes from https://stackoverflow.com/questions/5002111/how-to-strip-html-tags-from-string-in-javascript
const REGEX_DETECT_HTML_TAGS = /<\/?[^>]+(>|$)/g

/**
 * Exported so that it may be unit tested, it is intended to only care for search results title and
 * nothing more
 *
 * @param title
 * @returns {string}
 */
export function sanitizeTitle(title = '') {
    return title.replace(REGEX_DETECT_HTML_TAGS, '')
}

/**
 * @typedef {Object} SearchResult
 * @param {SearchResultTypes} resultType
 * @param {String} id ID of this search result
 * @param {String} title Title of this search result (can be HTML as a string)
 * @param {String} sanitizedTitle The title without any HTML tags (will keep what's inside <b> or
 *   <i> tags if there are)
 * @param {String} description A description of this search result (plain text only, no HTML)
 */

/**
 * @extends SearchResult
 * @typedef {Object} LayerSearchResult
 * @param {SearchResultTypes} resultType
 * @param {String} layerId ID of the layer in the layers config
 */

/**
 * @extends SearchResult
 * @typedef {Object} LocationSearchResult
 * @param {SearchResultTypes} resultType
 * @param {String} featureId ID of this feature given by the backend (can be then used to access
 *   other information about the feature, such as the HTML popup). If the backend doesn't give a
 *   feature ID for this feature, the description will be used as a fallback ID.
 * @param {[Number, Number]} coordinate Coordinate of this feature where to anchor the popup
 * @param {[Number, Number, Number, Number]} extent Extent of this feature described as `[
 *   [bottomLeftCoords], [topRightCoords] ]` (if this feature is a point, there will be two times
 *   the same point in the extent)
 * @param {Number} zoom The zoom level at which the map should be zoomed when showing the feature
 *   (if the extent is defined, this should be ignored). The zoom level correspond to a zoom level
 *   in the projection system this feature was requested in.
 */

/**
 * @extends LayerSearchResult
 * @extends LocationSearchResult
 * @typedef {Object} LayerFeatureSearchResult
 * @param {GeoAdminLayer} layer The layer of this feature.
 */

/**
 * @param {String} query
 * @param {String} lang
 * @param {String} type
 * @param {CancelToken} cancelToken
 * @returns Promise<Array<Any>>
 */
const generateAxiosSearchRequest = (query, lang, type, cancelToken, extraParams = {}) => {
    return axios.get(`${getServiceSearchBaseUrl()}rest/services/ech/SearchServer`, {
        cancelToken,
        params: {
            sr: LV95.epsgNumber,
            searchText: query.trim(),
            lang,
            type,
            ...extraParams,
        },
    })
}

function parseLayerResult(result) {
    if (!result.attrs) {
        throw new SearchError('Invalid layer result, cannot be parsed')
    }
    const { label: title, detail: description, layer: layerId } = result.attrs
    return {
        resultType: SearchResultTypes.LAYER,
        id: layerId,
        title,
        sanitizedTitle: sanitizeTitle(title),
        description,
        layerId,
    }
}

function parseLocationResult(result, outputProjection) {
    if (!result.attrs) {
        throw new SearchError('Invalid location result, cannot be parsed')
    }
    // reading the main values from the attrs
    const { label: title, detail: description, featureId, origin } = result.attrs

    let coordinate = []
    let zoom = result.attrs.zoomlevel
    if (result.attrs.lon && result.attrs.lat) {
        coordinate = [result.attrs.lon, result.attrs.lat]
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
    let extent = []
    if (result.attrs.geom_st_box2d) {
        const extentMatches = Array.from(
            result.attrs.geom_st_box2d.matchAll(
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
    // when no zoom and no extent are given, we go 1:25'000 map by default
    if (!zoom && extent.length === 0) {
        zoom = outputProjection.get1_25000ZoomLevel()
    }
    let newOrigin
    if (['district', 'kantone'].includes(origin)) {
        newOrigin = origin === 'district' ? i18n.global.t('district') : i18n.global.t('ct')
    }
    const newTitle = newOrigin ? `${newOrigin} ${title}` : title
    return {
        resultType: SearchResultTypes.LOCATION,
        id: featureId,
        title: newTitle,
        sanitizedTitle: sanitizeTitle(title),
        description,
        featureId: featureId ?? description,
        coordinate,
        extent,
        zoom,
    }
}

async function searchLayers(queryString, lang, cancelToken, limit = 0) {
    try {
        const layerResponse = await generateAxiosSearchRequest(
            queryString,
            lang,
            'layers',
            cancelToken.token,
            { limit }
        )
        // checking that there is something of interest to parse
        const resultWithAttrs = layerResponse?.data.results?.filter((result) => result.attrs)
        return resultWithAttrs?.map(parseLayerResult) ?? []
    } catch (error) {
        log.error(`Failed to search layer, fallback to empty result`, error)
        return []
    }
}

/**
 * Search locations for this query string in our backend, returning results reprojected to the
 * outputProjection (if it isn't LV95 already)
 *
 * @param outputProjection
 * @param queryString
 * @param lang
 * @param cancelToken
 * @param limit
 * @returns {Promise<LocationSearchResult[]>}
 */
async function searchLocation(outputProjection, queryString, lang, cancelToken, limit = 0) {
    try {
        const locationResponse = await generateAxiosSearchRequest(
            queryString,
            lang,
            'locations',
            cancelToken.token,
            { limit }
        )
        // checking that there is something of interest to parse
        const resultWithAttrs = locationResponse?.data.results?.filter((result) => result.attrs)
        return (
            resultWithAttrs.map((location) => parseLocationResult(location, outputProjection)) ?? []
        )
    } catch (error) {
        log.error(`Failed to search locations, fallback to empty result`, error)
        return []
    }
}

/**
 * @param outputProjection
 * @param queryString
 * @param layer
 * @param lang
 * @param cancelToken
 * @returns {Promise<LayerFeatureSearchResult[]>}
 */
async function searchLayerFeatures(outputProjection, queryString, layer, lang, cancelToken) {
    try {
        const layerFeatureResponse = await generateAxiosSearchRequest(
            queryString,
            lang,
            'featuresearch',
            cancelToken.token,
            {
                features: layer.id,
                timeEnabled: false,
            }
        )
        // checking that there is something of interest to parse
        const resultWithAttrs = layerFeatureResponse?.data.results?.filter((result) => result.attrs)
        return (
            resultWithAttrs.map((layerFeature) => {
                const layerContent = parseLayerResult(layerFeature)
                const locationContent = parseLocationResult(layerFeature, outputProjection)
                const title = `<strong>${layer.name}</strong><br/>${layerContent.title}`
                return {
                    ...layerContent,
                    ...locationContent,
                    resultType: SearchResultTypes.FEATURE,
                    title,
                    layer,
                }
            }) ?? []
        )
    } catch (error) {
        log.error(
            `Failed to search layer features for layer ${layer.id}, fallback to empty result`,
            error
        )
        return []
    }
}

/**
 * Searches for the query string in the feature inside the provided search fields
 *
 * @param {ol/Feature} feature
 * @param {String} queryString
 * @param {String[]} searchFields
 * @returns {Boolean}
 */
function isQueryInFeature(feature, queryString, searchFields) {
    const queryStringClean = queryString
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // replaces all special characters and accents
    return searchFields.some((field) => {
        const value = feature.values_[field]?.toString()
        return !!value && value.trim().toLowerCase().includes(queryStringClean)
    })
}

/**
 * Searches for the query string in the layer
 *
 * @param {CoordinateSystem} outputProjection
 * @param {String} queryString
 * @param {GeoAdminLayer} layer
 * @param {any} parseData Data needed in the parseFunction
 * @param {Function} parseFunction Function to parse the data
 * @returns {SearchResult[]}
 */
function searchFeatures(outputProjection, queryString, layer, parseData, parseFunction) {
    try {
        const features = parseFunction(parseData, outputProjection, [])
        if (!features || !features.length) {
            return []
        }
        const includedFeatures = features.filter((feature) =>
            isQueryInFeature(feature, queryString, KML_GPX_SEARCH_FIELDS)
        )
        if (!includedFeatures.length) {
            return []
        }
        return includedFeatures.map((feature) =>
            createSearchResultFromLayer(layer, feature, outputProjection)
        )
    } catch (error) {
        log.error(
            `Failed to search layer features for layer ${layer.id}, fallback to empty result`,
            error
        )
        return []
    }
}

/**
 * Searches for features in KML and GPX layers based on a query string and output projection
 *
 * @param {GeoAdminLayer[]} layersToSearch - The layers to search through
 * @param {string} queryString - The query string to search for
 * @param {string} outputProjection - The projection to use for the output
 * @returns {SearchResult[]}
 */
function searchLayerFeaturesKMLGPX(layersToSearch, queryString, outputProjection) {
    return layersToSearch.reduce((returnLayers, currentLayer) => {
        if (currentLayer.type === LayerTypes.KML) {
            return returnLayers.concat(
                searchFeatures(outputProjection, queryString, currentLayer, currentLayer, parseKml)
            )
        }
        if (currentLayer.type === LayerTypes.GPX) {
            return returnLayers.concat(
                ...searchFeatures(
                    outputProjection,
                    queryString,
                    currentLayer,
                    currentLayer.gpxData,
                    parseGpx
                )
            )
        }
        return returnLayers
    }, [])
}

/**
 * Creates the SearchResult for a layer
 *
 * @param {GeoAdminLayer} layer
 * @param {ol/Feature} feature
 * @param {ol/extent|null} extent
 * @param {CoordinateSystem} outputProjection
 * @returns {SearchResult}
 */
function createSearchResultFromLayer(layer, feature, outputProjection) {
    const featureName = feature.values_.name || layer.name || '' // this needs || to avoid using empty string when feature.values_.name is an empty string
    const coordinates = extractOlFeatureCoordinates(feature)
    const zoom = outputProjection.get1_25000ZoomLevel()

    const coordinatePoints = points(coordinates)
    const centerPoint = center(coordinatePoints)
    const normalExtent = normalizeExtent(bbox(coordinatePoints))

    const featureId = feature.getId()
    const layerContent = {
        resultType: SearchResultTypes.LAYER,
        id: layer.id,
        title: layer.name ?? '',
        sanitizedTitle: sanitizeTitle(layer.name),
        description: layer.description ?? '',
        layerId: layer.id,
    }
    const locationContent = {
        resultType: SearchResultTypes.LOCATION,
        id: featureId,
        title: featureName,
        sanitizedTitle: sanitizeTitle(featureName),
        description: feature.values_.description ?? '',
        featureId: featureId,
        coordinate: centerPoint.geometry.coordinates,
        extent: normalExtent,
        zoom,
    }
    return {
        ...layerContent,
        ...locationContent,
        resultType: SearchResultTypes.FEATURE,
        title: featureName,
        layer,
    }
}

let cancelToken = null
/**
 * @param {CoordinateSystem} config.outputProjection The projection in which the search results must
 *   be returned
 * @param {String} config.queryString The query string that describe what is wanted from the search
 * @param {String} config.lang The lang ISO code in which the search must be conducted
 * @param {GeoAdminLayer[]} [config.layersToSearch=[]] List of searchable layers for which to fire
 *   search requests. Default is `[]`
 * @param {number} config.limit The maximum number of results to return
 * @returns {Promise<SearchResult[]>}
 */
export default async function search(config) {
    const {
        outputProjection = null,
        queryString = null,
        lang = null,
        layersToSearch = [],
        limit = 0,
    } = config
    if (!(outputProjection instanceof CoordinateSystem)) {
        const errorMessage = `A valid output projection is required to start a search request`
        log.error(errorMessage)
        throw new SearchError(errorMessage)
    }
    if (!lang || lang.length !== 2) {
        const errorMessage = `A valid lang ISO code is required to start a search request, received: ${lang}`
        log.error(errorMessage)
        throw SearchError(errorMessage)
    }
    if (!queryString || queryString.length < 2) {
        const errorMessage = `At least to character are needed to launch a backend search, received: ${queryString}`
        log.error(errorMessage)
        throw SearchError(errorMessage)
    }
    // if a request is currently pending, we cancel it to start the new one
    if (cancelToken) {
        cancelToken.cancel('new search query')
    }
    cancelToken = axios.CancelToken.source()

    /** @type {Promise<SearchResult[]>[]} */
    const allRequests = [
        searchLayers(queryString, lang, cancelToken, limit),
        searchLocation(outputProjection, queryString, lang, cancelToken, limit),
    ]

    // TODO limit also in the local kml and gpx files ?
    if (layersToSearch.some((layer) => layer.searchable)) {
        allRequests.push(
            ...layersToSearch
                .filter((layer) => layer.searchable)
                .map((layer) =>
                    searchLayerFeatures(outputProjection, queryString, layer, lang, cancelToken)
                )
        )
    }

    allRequests.push(searchLayerFeaturesKMLGPX(layersToSearch, queryString, outputProjection))

    // letting all requests finish in parallel
    const allResults = await Promise.all(allRequests)
    cancelToken = null

    return allResults.flat()
}
