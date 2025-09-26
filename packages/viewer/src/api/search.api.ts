import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'
import { CoordinateSystem, CustomCoordinateSystem, LV95, WGS84 } from '@swissgeo/coordinates'
import type { GPXLayer, KMLLayer, Layer } from '@swissgeo/layers'
import { LayerType } from '@swissgeo/layers'
import type Feature from 'ol/Feature'
import type OLFeature from 'ol/Feature'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { bbox, points } from '@turf/turf'
import axios, { type AxiosResponse, type CancelToken, type CancelTokenSource } from 'axios'
import proj4 from 'proj4'

import type { DrawingIconSet } from '@/api/icon.api'

import { extractOlFeatureCoordinates } from '@/api/features.api'
import { getApi3BaseUrl } from '@/config/baseUrl.config'
import i18n from '@/modules/i18n'
import { getGeoJsonFeatureCenter } from '@/utils/geoJsonUtils'
import { parseGpx } from '@/utils/gpxUtils'
import { parseKml } from '@/utils/kmlUtils'

const KML_GPX_SEARCH_FIELDS = ['name', 'description', 'id']

// API file that covers the backend endpoint http://api3.geo.admin.ch/services/sdiservices.html#search

/**
 * Error when building/sending/parsing a search request
 *
 * @property {String} message Technical english message
 */
export class SearchError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = 'SearchError'
    }
}

export enum SearchResultTypes {
    LAYER = 'LAYER',
    LOCATION = 'LOCATION',
    FEATURE = 'FEATURE',
}

// comes from https://stackoverflow.com/questions/5002111/how-to-strip-html-tags-from-string-in-javascript
const REGEX_DETECT_HTML_TAGS = /<\/?[^>]+(>|$)/g

/**
 * Exported so that it may be unit tested, it is intended to only care for search results title and
 * nothing more
 */
export function sanitizeTitle(title: string = ''): string {
    return title.replace(REGEX_DETECT_HTML_TAGS, '')
}

export interface SearchResult {
    resultType: SearchResultTypes
    /** ID of this search result */
    id: string
    /** Title of this search result (can be HTML as a string) */
    title: string
    /** The title without any HTML tags (will keep what's inside <b> or <i> tags if there are) */
    sanitizedTitle: string
    /** A description of this search result (plain text only, no HTML) */
    description: string
}

export interface LayerSearchResult extends SearchResult {
    /** ID of the layer in the layers config */
    layerId: string
}

export interface LocationSearchResult extends SearchResult {
    /**
     * ID of this feature given by the backend (can be then used to access other information about
     * the feature, such as the HTML popup). If the backend doesn't give a feature ID for this
     * feature, the description will be used as a fallback ID.
     */
    featureId: string
    /** Coordinate of this feature where to anchor the popup */
    coordinate?: SingleCoordinate
    /**
     * Extent of this feature described as `[ [bottomLeftCoords], [topRightCoords] ]` (if this
     * feature is a point, there will be two times the same point in the extent)
     */
    extent?: FlatExtent
    /**
     * The zoom level at which the map should be zoomed when showing the feature (if the extent is
     * defined, this should be ignored). The zoom level correspond to a zoom level in the projection
     * system this feature was requested in.
     */
    zoom: number
}

export interface LayerFeatureSearchResult extends LayerSearchResult, LocationSearchResult {
    /** The layer of this feature. */
    layer: Layer
}

interface SearchResponseResult {
    id: number
    weight: number
    attrs?: {
        featureId: string
        detail: string
        geom_quadindex: string
        geom_st_box2d: string
        label: string
        lat: number
        lon: number
        num: number
        objectclass: string
        origin: string
        rank: number
        x: number
        y: number
        zoomlevel: number
        layer?: string
    }
}

interface SearchResponse {
    results: SearchResponseResult[]
}

const generateAxiosSearchRequest = (
    query: string,
    lang: string,
    type: string,
    cancelToken: CancelToken,
    extraParams: object = {}
): Promise<AxiosResponse<SearchResponse>> => {
    return axios.get<SearchResponse>(`${getApi3BaseUrl()}rest/services/ech/SearchServer`, {
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

function parseLayerResult(result: SearchResponseResult): LayerSearchResult {
    if (!result.attrs) {
        throw new SearchError('Invalid layer result, cannot be parsed')
    }
    const { label: title, detail: description, layer: layerId } = result.attrs
    return {
        resultType: SearchResultTypes.LAYER,
        id: layerId ?? title,
        title,
        sanitizedTitle: sanitizeTitle(title),
        description,
        layerId: layerId ?? title,
    }
}

function parseLocationResult(
    result: SearchResponseResult,
    outputProjection: CoordinateSystem
): LocationSearchResult {
    if (!result.attrs) {
        throw new SearchError('Invalid location result, cannot be parsed')
    }
    // reading the main values from the attrs
    const { label: title, detail: description, featureId, origin } = result.attrs

    let coordinate: SingleCoordinate | undefined
    let zoom = result.attrs.zoomlevel
    if (result.attrs.lon && result.attrs.lat) {
        coordinate = [result.attrs.lon, result.attrs.lat]
        if (outputProjection.epsg !== WGS84.epsg) {
            coordinate = proj4(WGS84.epsg, outputProjection.epsg, coordinate)
        }
    }
    if (outputProjection.epsg !== LV95.epsg) {
        // re-projecting result coordinate and zoom to wanted projection
        zoom = LV95.transformCustomZoomLevelToStandard(zoom)
        if (outputProjection instanceof CustomCoordinateSystem) {
            zoom = outputProjection.transformStandardZoomLevelToCustom(zoom)
        }
    }
    // reading the extent from the LineString (if defined)
    let extent: FlatExtent | undefined
    if (result.attrs.geom_st_box2d) {
        const extentMatches = Array.from(
            result.attrs.geom_st_box2d.matchAll(
                /BOX\(([0-9\\.]+) ([0-9\\.]+),([0-9\\.]+) ([0-9\\.]+)\)/g
            )
        )[0]
        if (Array.isArray(extentMatches) && extentMatches.length >= 5) {
            let bottomLeft = [Number(extentMatches[1]), Number(extentMatches[2])]
            let topRight = [Number(extentMatches[3]), Number(extentMatches[4])]
            if (outputProjection.epsg !== LV95.epsg) {
                bottomLeft = proj4(LV95.epsg, outputProjection.epsg, bottomLeft)
                topRight = proj4(LV95.epsg, outputProjection.epsg, topRight)
            }
            // checking if both point are the same (can happen if what is shown is a point of interest)
            if (bottomLeft[0] !== topRight[0] && bottomLeft[1] !== topRight[1]) {
                extent = [...bottomLeft, ...topRight] as FlatExtent
            }
        }
    }
    // when no zoom and no extent are given, we go 1:25'000 map by default
    if (!zoom && !extent) {
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

async function searchLayers(
    queryString: string,
    lang: string,
    cancelToken: CancelToken,
    limit?: number
) {
    try {
        const layerResponse = await generateAxiosSearchRequest(
            queryString,
            lang,
            'layers',
            cancelToken,
            { limit }
        )
        if (!layerResponse?.data || !layerResponse?.data?.results) {
            return []
        }
        // checking that there is something of interest to parse
        const resultWithAttrs = layerResponse?.data.results?.filter(
            (result: SearchResponseResult) => !!result.attrs
        )
        return resultWithAttrs?.map(parseLayerResult) ?? []
    } catch (error) {
        log.error({
            title: 'Search API',
            titleColor: LogPreDefinedColor.Amber,
            messages: [`Failed to search layer, fallback to empty result`, error],
        })
        return []
    }
}

/**
 * Search locations for this query string in our backend, returning results reprojected to the
 * outputProjection (if it isn't LV95 already)
 */
async function searchLocation(
    outputProjection: CoordinateSystem,
    queryString: string,
    lang: string,
    cancelToken: CancelToken,
    limit?: number
): Promise<LocationSearchResult[]> {
    try {
        const locationResponse = await generateAxiosSearchRequest(
            queryString,
            lang,
            'locations',
            cancelToken,
            { limit }
        )
        if (!locationResponse?.data || !locationResponse?.data?.results) {
            return []
        }
        // checking that there is something of interest to parse
        const resultWithAttrs = locationResponse?.data.results?.filter(
            (result: SearchResponseResult) => !!result.attrs
        )
        return (
            resultWithAttrs.map((location) => parseLocationResult(location, outputProjection)) ?? []
        )
    } catch (error) {
        log.error({
            title: 'Search API',
            titleColor: LogPreDefinedColor.Amber,
            messages: [`Failed to search locations, fallback to empty result`, error],
        })
        return []
    }
}

async function searchLayerFeatures(
    outputProjection: CoordinateSystem,
    queryString: string,
    layer: Layer,
    lang: string,
    cancelToken: CancelTokenSource
): Promise<SearchResult[]> {
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
        log.error({
            title: 'Search API',
            titleColor: LogPreDefinedColor.Amber,
            messages: [
                `Failed to search layer features for layer ${layer.id}, fallback to empty result`,
                error,
            ],
        })
        return []
    }
}

/** Searches for the query string in the feature inside the provided search fields */
function isQueryInFeature(feature: Feature, queryString: string, searchFields: string[]): boolean {
    const queryStringClean = queryString
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // replaces all special characters and accents
    return searchFields.some((field) => {
        const value = feature.get(field)?.toString()
        return !!value && value.trim().toLowerCase().includes(queryStringClean)
    })
}

/** Searches for the query string in the vector layer */
function searchFeatures(
    features: Feature[],
    outputProjection: CoordinateSystem,
    queryString: string,
    layer: KMLLayer | GPXLayer
): SearchResult[] {
    try {
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
        log.error({
            title: 'Search API',
            titleColor: LogPreDefinedColor.Amber,
            messages: [
                `Failed to search layer features for layer ${layer.id}, fallback to empty result`,
                error,
            ],
        })
        return []
    }
}

/** Searches for features in KML and GPX layers based on a query string and output projection */
function searchLayerFeaturesKMLGPX(
    layersToSearch: Layer[],
    queryString: string,
    outputProjection: CoordinateSystem,
    resolution: number,
    iconSets: DrawingIconSet[]
): SearchResult[] {
    return layersToSearch.reduce((returnLayers: SearchResult[], currentLayer: Layer) => {
        if (currentLayer.type === LayerType.KML) {
            const kmlLayer = currentLayer as KMLLayer
            return returnLayers.concat(
                searchFeatures(
                    parseKml(kmlLayer, outputProjection, resolution, iconSets),
                    outputProjection,
                    queryString,
                    kmlLayer
                )
            )
        }
        if (currentLayer.type === LayerType.GPX) {
            const gpxData = (currentLayer as GPXLayer).gpxData
            if (!gpxData) {
                return returnLayers
            }
            const gpxFeatures = parseGpx(gpxData, outputProjection)
            if (!gpxFeatures) {
                return returnLayers
            }
            return returnLayers.concat(
                ...searchFeatures(gpxFeatures, outputProjection, queryString, currentLayer)
            )
        }
        return returnLayers
    }, [])
}

/** Creates the SearchResult for a layer */
function createSearchResultFromLayer(
    layer: KMLLayer | GPXLayer,
    feature: OLFeature,
    outputProjection: CoordinateSystem
): LayerFeatureSearchResult {
    const featureName: string = feature.get('name') || layer.name || '' // this needs || to avoid using empty string when feature.get("name") is an empty string
    const coordinates: SingleCoordinate[] = extractOlFeatureCoordinates(feature)
    const zoom: number = outputProjection.get1_25000ZoomLevel()

    const coordinatePoints = points(coordinates)
    let extent: number[] = bbox(coordinatePoints)
    if (extent.length > 4) {
        extent = extent.slice(0, 4)
    }

    const featureId = feature.getId() ? `${feature.getId()}` : layer.id
    return {
        resultType: SearchResultTypes.FEATURE,
        id: featureId,
        title: featureName,
        sanitizedTitle: sanitizeTitle(featureName),
        description: feature.get('description') ?? '',
        featureId: featureId,
        coordinate: getGeoJsonFeatureCenter(coordinatePoints, outputProjection, outputProjection),
        extent: extent as FlatExtent,
        zoom,
        layer,
        layerId: layer.id,
    }
}

interface SearchConfig {
    /** The projection in which the search results must be returned */
    outputProjection: CoordinateSystem
    /** The query string that describe what is wanted from the search */
    queryString: string
    /** The lang ISO code in which the search must be conducted */
    lang: string
    /** The resolution of the map in which the search must be conducted, in meters per pixel */
    resolution: number
    /** List of searchable layers for which to fire search requests. */
    layersToSearch?: Layer[]
    /** The maximum number of results to return */
    limit?: number
    iconSets: DrawingIconSet[]
}

let cancelTokenSource: CancelTokenSource | undefined
export default async function search(config: SearchConfig): Promise<SearchResult[]> {
    const {
        outputProjection,
        queryString,
        lang,
        resolution,
        layersToSearch = [],
        limit,
        iconSets = [],
    } = config
    if (!outputProjection) {
        const errorMessage = `A valid output projection is required to start a search request`
        log.error(errorMessage)
        throw new SearchError(errorMessage)
    }
    if (!lang || lang.length !== 2) {
        const errorMessage = `A valid lang ISO code is required to start a search request, received: ${lang}`
        log.error(errorMessage)
        throw new SearchError(errorMessage)
    }
    if (!queryString || queryString.length < 2) {
        const errorMessage = `At least to character are needed to launch a backend search, received: ${queryString}`
        log.error(errorMessage)
        throw new SearchError(errorMessage)
    }
    // if a request is currently pending, we cancel it to start the new one
    if (cancelTokenSource) {
        cancelTokenSource.cancel('new search query')
    }
    cancelTokenSource = axios.CancelToken.source()
    const allResults: SearchResult[] = [
        ...(await searchLayers(queryString, lang, cancelTokenSource?.token, limit)),
        ...(await searchLocation(
            outputProjection,
            queryString,
            lang,
            cancelTokenSource?.token,
            limit
        )),
    ]

    const searchableLayers = layersToSearch.filter(
        (layer) => 'searchable' in layer && !!layer.searchable
    )
    for (const searchableLayer of searchableLayers) {
        allResults.push(
            ...(await searchLayerFeatures(
                outputProjection,
                queryString,
                searchableLayer,
                lang,
                cancelTokenSource
            ))
        )
    }

    allResults.push(
        ...searchLayerFeaturesKMLGPX(
            layersToSearch,
            queryString,
            outputProjection,
            resolution,
            iconSets
        )
    )

    cancelTokenSource = undefined

    return allResults.flat()
}
