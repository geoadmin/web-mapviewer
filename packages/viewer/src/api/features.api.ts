import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { ExternalLayer, ExternalWMSLayer, GeoAdminLayer, Layer } from '@swissgeo/layers'
import type { Feature as GeoJsonFeature, FeatureCollection, Geometry } from 'geojson'
import type Feature from 'ol/Feature'
import type { LineString, MultiLineString, MultiPolygon, Point, Polygon } from 'ol/geom'

import { allCoordinateSystems, CoordinateSystem, extentUtils, LV95 } from '@swissgeo/coordinates'
import { ALL_YEARS_TIMESTAMP, CURRENT_YEAR_TIMESTAMP, LayerType } from '@swissgeo/layers'
import { layerUtils } from '@swissgeo/layers/utils'
import log from '@swissgeo/log'
import axios, { type AxiosResponse } from 'axios'
import { WMSGetFeatureInfo } from 'ol/format'
import GeoJSON from 'ol/format/GeoJSON'
import proj4 from 'proj4'

import type { DrawingIcon } from '@/api/icon.api'

import { getApi3BaseUrl } from '@/config/baseUrl.config'
import {
    DEFAULT_FEATURE_COUNT_SINGLE_POINT,
    DEFAULT_FEATURE_IDENTIFICATION_TOLERANCE,
} from '@/config/map.config'
import {
    type FeatureStyleColor,
    type FeatureStyleSize,
    TextPlacement,
} from '@/utils/featureStyleUtils'
import { getGeoJsonFeatureCenter, reprojectGeoJsonGeometry } from '@/utils/geoJsonUtils'

const GET_FEATURE_INFO_FAKE_VIEWPORT_SIZE = 100

const APPLICATION_JSON_TYPE = 'application/json'
const APPLICATION_GML_3_TYPE = 'application/vnd.ogc.gml'
const APPLICATION_OGC_WMS_XML_TYPE = 'application/vnd.ogc.wms_xml'
const PLAIN_TEXT_TYPE = 'text/plain'

export interface SelectableFeature<IsEditable extends boolean> {
    /**
     * Unique identifier for this feature (unique in the context it comes from, not for the whole
     * app)
     */
    readonly id: string | number
    /** Coordinates describing the center of this feature. Format is [[x,y],[x2,y2],...] */
    coordinates: SingleCoordinate[] | SingleCoordinate
    /** Title of this feature */
    title: string
    /** A description of this feature. Cannot be HTML content (only text). */
    description?: string
    /** The extent of this feature (if any) expressed as [minX, minY, maxX, maxY]. */
    extent?: FlatExtent
    /** GeoJSON representation of this feature (if it has a geometry, for points it isn't necessary). */
    geometry?: Geometry
    /** Whether this feature is editable when selected (color, size, etc...). */
    readonly isEditable: IsEditable
}

export enum EditableFeatureTypes {
    Marker = 'MARKER',
    Annotation = 'ANNOTATION',
    LinePolygon = 'LINEPOLYGON',
    Measure = 'MEASURE',
}

export interface EditableFeature extends SelectableFeature<true> {
    featureType: EditableFeatureTypes
    textOffset: [number, number]
    textColor?: FeatureStyleColor
    textSize?: FeatureStyleSize
    fillColor?: FeatureStyleColor
    strokeColor?: FeatureStyleColor
    icon?: DrawingIcon
    /** Size of the icon (if defined) that will be covering this feature */
    iconSize?: FeatureStyleSize
    /** Anchor of the text around the feature. Only useful for markers */
    textPlacement: TextPlacement
    showDescriptionOnMap: boolean
}

export interface LayerFeature extends SelectableFeature<false> {
    /** The layer in which this feature belongs */
    readonly layer: Layer
    /** Data for this feature's popup (or tooltip). */
    readonly data?: Record<string, string>
    /** HTML representation of this feature */
    readonly popupData?: string
    /**
     * If sanitization should take place before rendering the popup (as HTML) or not (trusted
     * source)
     *
     * We can't trust the content of the popup data for external layers, and for KML layers. For
     * KML, the issue is that users can create text-rich (HTML) description with links, and such. It
     * would then be possible to do some XSS through this, so we need to sanitize this before
     * showing it.
     */
    readonly popupDataCanBeTrusted: boolean
}

export type StoreFeature = EditableFeature | LayerFeature

/**
 * The api3 identify endpoint timeInstant parameter doesn't support the "all" and "current"
 * timestamps, we need to set it to null in this case.
 *
 * @param layer
 */
function getApi3TimeInstantParam(layer: GeoAdminLayer): string | undefined {
    if (
        layer.timeConfig?.currentTimeEntry &&
        layer.timeConfig.currentTimeEntry.timestamp !== ALL_YEARS_TIMESTAMP &&
        layer.timeConfig.currentTimeEntry.timestamp !== CURRENT_YEAR_TIMESTAMP
    ) {
        return layer.timeConfig.currentTimeEntry.timestamp
    }
    return
}

/**
 * Error when building or requesting an external layer's getFeatureInfo endpoint
 *
 * This class also contains an i18n translation key in plus of a technical English message. The
 * translation key can be used to display a translated user message.
 *
 * @property {String} message Technical english message
 * @property {String} key I18n translation key for a user message
 */
export class GetFeatureInfoError extends Error {
    readonly key: string | undefined

    constructor(message?: string, key?: string) {
        super(message)
        this.key = key
        this.name = 'GetFeatureInfoError'
    }
}

/**
 * Extract OL feature coordinates in a format that we support in our application
 *
 * @param feature OpenLayers KML feature
 * @returns Coordinates of the feature, in WGS84
 */
export function extractOlFeatureCoordinates(feature?: Feature): SingleCoordinate[] {
    if (!feature) {
        return []
    }
    const geometry = feature.getGeometry()
    if (!geometry) {
        return []
    }
    let coordinates: number[][] = []
    if (geometry.getType() === 'Point') {
        coordinates = [(geometry as Point).getCoordinates()]
    } else if (geometry.getType() === 'LineString') {
        coordinates = (geometry as LineString).getCoordinates()
    } else if (geometry.getType() === 'MultiLineString') {
        coordinates = (geometry as MultiLineString).getCoordinates().flat(1)
    } else if (geometry.getType() === 'Polygon') {
        coordinates = (geometry as Polygon).getCoordinates().flat(1)
    } else if (geometry.getType() === 'MultiPolygon') {
        coordinates = (geometry as MultiPolygon).getCoordinates().flat(2)
    }
    return coordinates as SingleCoordinate[]
}

interface IdentifyResult {
    featureId: string
    bbox: FlatExtent
    layerBodId: string
    layerName: string
    id: string
    geometry: Geometry
    properties: Record<string, string>
}

interface IdentifyResponse {
    results: IdentifyResult[]
}

export async function identifyOnGeomAdminLayer(
    identifyConfig: IdentifyConfig
): Promise<LayerFeature[]> {
    const {
        layer,
        projection,
        coordinate,
        screenWidth,
        screenHeight,
        mapExtent,
        lang,
        featureCount = DEFAULT_FEATURE_COUNT_SINGLE_POINT,
        offset,
    } = identifyConfig
    if (!layer) {
        throw new GetFeatureInfoError('Missing layer')
    }
    if (layer.isExternal) {
        throw new GetFeatureInfoError('Wrong type of layer')
    }
    const geoadminLayer = layer as GeoAdminLayer
    if (!Array.isArray(coordinate)) {
        throw new GetFeatureInfoError('Coordinate are required to perform a getFeatureInfo request')
    }
    if (!featureCount) {
        throw new GetFeatureInfoError(
            'A feature count is required to perform a getFeatureInfo request'
        )
    }
    if (!lang) {
        throw new GetFeatureInfoError('A lang is required to build a getFeatureInfo request')
    }
    const imageDisplay = `${screenWidth},${screenHeight},96`
    const identifyResponse = await axios.get<IdentifyResponse>(
        `${getApi3BaseUrl()}rest/services/${layerUtils.getTopicForIdentifyAndTooltipRequests(geoadminLayer)}/MapServer/identify`,
        {
            // params described as https://api3.geo.admin.ch/services/sdiservices.html#identify-features
            params: {
                layers: `all:${geoadminLayer.id}`,
                sr: projection.epsgNumber,
                geometry: coordinate.join(','),
                mapExtent: mapExtent.join(','),
                imageDisplay,
                geometryFormat: 'geojson',
                geometryType: `esriGeometry${coordinate.length === 2 ? 'Point' : 'Envelope'}`,
                limit: featureCount,
                tolerance: DEFAULT_FEATURE_IDENTIFICATION_TOLERANCE,
                returnGeometry: geoadminLayer.isHighlightable,
                timeInstant: getApi3TimeInstantParam(geoadminLayer),
                lang: lang,
                offset,
            },
        }
    )
    // firing a getHtmlPopup (async/parallel) on each identified feature
    const features: LayerFeature[] = []
    if (identifyResponse.data?.results?.length > 0) {
        for (const feature of identifyResponse.data.results) {
            let featureCoordinate: SingleCoordinate | undefined
            if (coordinate.length === 2) {
                featureCoordinate = coordinate
            } else if (coordinate.length === 4) {
                // taking the center of the extent as coordinate
                featureCoordinate = [
                    (coordinate[0] + coordinate[2]) / 2,
                    (coordinate[1] + coordinate[3]) / 2,
                ]
            }
            if (!featureCoordinate) {
                throw new GetFeatureInfoError('Unable to build required feature coordinate')
            }
            const featureData = await getFeatureHtmlPopup(geoadminLayer, feature.id, {
                lang,
                screenWidth,
                screenHeight,
                mapExtent,
                coordinate: featureCoordinate,
            })
            const parsedFeature = parseGeomAdminFeature(
                geoadminLayer,
                feature,
                featureData,
                projection,
                {
                    lang,
                    coordinate: featureCoordinate,
                }
            )
            if (parsedFeature) {
                features.push(parsedFeature)
            }
        }
    }
    return features
}

/** @throws GetFeatureInfoError If any part of the input is not valid */
async function identifyOnExternalLayer(config: IdentifyConfig): Promise<LayerFeature[]> {
    const { layer, coordinate, resolution, tolerance, projection, lang, featureCount } = config
    if (!layer) {
        throw new GetFeatureInfoError('Missing layer')
    }
    if (
        !layer.hasTooltip ||
        !layer.isExternal ||
        !(layer as ExternalLayer).getFeatureInfoCapability
    ) {
        throw new GetFeatureInfoError(`Layer ${layer.id} can't be getFeatureInfo requested`)
    }
    if (coordinate === null) {
        throw new GetFeatureInfoError('Coordinate are required to perform a getFeatureInfo request')
    }
    if (resolution === null) {
        throw new GetFeatureInfoError(
            'Map resolution is required to perform a getFeatureInfo request'
        )
    }
    if (featureCount === null) {
        throw new GetFeatureInfoError(
            'A feature count is required to perform a getFeatureInfo request'
        )
    }
    if (tolerance === null) {
        throw new GetFeatureInfoError('A tolerance is required to perform a getFeatureInfo request')
    }
    if (lang === null) {
        throw new GetFeatureInfoError('A lang is required to build a getFeatureInfo request')
    }
    const externalLayer = layer as ExternalLayer
    // deciding on which projection we should land to ask the WMS server (the current map projection might not be supported)
    let requestProjection: CoordinateSystem | undefined = projection
    let requestedCoordinate = coordinate
    if (!requestProjection) {
        throw new GetFeatureInfoError('Missing projection to build a getFeatureInfo request')
    }
    if (
        externalLayer.availableProjections &&
        !externalLayer.availableProjections.some(
            (availableProjection) => availableProjection.epsg === requestProjection?.epsg
        )
    ) {
        // trying to find a candidate among the app supported projections
        requestProjection = allCoordinateSystems.find((candidate) =>
            externalLayer.availableProjections!.some(
                (availableProjection) => availableProjection.epsg === candidate.epsg
            )
        )
    }
    if (!requestProjection) {
        throw new GetFeatureInfoError(
            `No common projection found with external WMS provider, possible projection were ${externalLayer.availableProjections?.map((proj) => proj.epsg).join(', ')}`
        )
    }
    if (requestProjection.epsg !== projection.epsg) {
        // If we use different projection, we also need to project out initial coordinate
        requestedCoordinate = proj4(projection.epsg, requestProjection.epsg, coordinate)
    }
    if (layer.type === LayerType.WMS) {
        return await identifyOnExternalWmsLayer({
            ...config,
            coordinate: requestedCoordinate,
            projection: requestProjection,
            resolution,
            layer: externalLayer,
            featureCount,
            lang,
            tolerance,
            outputProjection: projection,
        })
    } else {
        throw new GetFeatureInfoError(
            `Unsupported external layer type to build getFeatureInfo request: ${layer.type}`
        )
    }
}

// Parse OGC WMS XML response to GeoJSON
function parseOGCWMSFeatureInfoResponse(data: string): FeatureCollection | undefined {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(data, 'text/xml')

    // Check for parsing errors
    const parserError = xmlDoc.getElementsByTagName('parsererror')
    if (parserError.length > 0) {
        log.error('Error parsing OGC WMS XML response')
        return
    }

    const features = []
    const fieldElements = xmlDoc.getElementsByTagName('FIELDS')

    for (let i = 0; i < fieldElements.length; i++) {
        const fieldElement = fieldElements[i]
        const properties: { [key: string]: string } = {}

        if (!fieldElement) {
            continue
        }

        // Extract attributes from the FIELDS element
        for (let j = 0; j < fieldElement.attributes.length; j++) {
            const attribute = fieldElement.attributes[j]
            if (!attribute) {
                continue
            }
            properties[attribute.name] = attribute.value
        }

        const feature: GeoJsonFeature = {
            type: 'Feature',
            // Assuming geometry is not provided in the response (stubbing it)
            geometry: {
                type: 'Point',
                coordinates: [0, 0],
            },
            properties: properties,
        }

        features.push(feature)
    }

    return {
        type: 'FeatureCollection',
        features: features,
    }
}

/**
 * Runs a getFeatureInfo request on the backend of an external WMS layer.
 *
 * To do so, it will create a "fake" 100x100 pixel extent around the given coordinate to build the
 * request (with the request asking for the pixel 50:50).
 *
 * This is done because, after many attempts to give the current map viewport and click pixel
 * position without any positive results, I looked at what OpenLayers does under the hood, and
 * that's exactly their approach (and the approach mf-geoadmin3 had, because it relied on the Ol
 * class to do exactly that).
 *
 * And as we wanted to be as framework-agnostic as possible, I couldn't get myself to pass the OL
 * instance of the WMS source to this function to use the utils directly, and preferred to implement
 * it on my own.
 */
async function identifyOnExternalWmsLayer(config: IdentifyConfig): Promise<LayerFeature[]> {
    const {
        coordinate,
        projection,
        resolution,
        layer,
        featureCount,
        lang,
        tolerance,
        outputProjection,
    } = config

    let requestExtent: FlatExtent | undefined

    if (!coordinate) {
        throw new GetFeatureInfoError('Missing coordinate to build a getFeatureInfo request')
    }

    if (coordinate.length === 2) {
        requestExtent = extentUtils.createPixelExtentAround({
            size: GET_FEATURE_INFO_FAKE_VIEWPORT_SIZE,
            coordinate,
            projection,
            resolution,
        })
    } else if (coordinate.length === 4) {
        requestExtent = coordinate
    }
    if (!requestExtent) {
        throw new GetFeatureInfoError('Unable to build required request extent')
    }
    if (!layer.isExternal) {
        throw new GetFeatureInfoError('Layer is not external')
    }
    const externalLayer = layer as ExternalWMSLayer
    // selecting output format depending on external WMS capabilities
    // preferring JSON output
    let outputFormat = APPLICATION_JSON_TYPE
    if (!externalLayer.getFeatureInfoCapability?.formats?.includes(outputFormat)) {
        // if JSON isn't supported, we check if GML3 is supported
        if (externalLayer.getFeatureInfoCapability?.formats?.includes(APPLICATION_GML_3_TYPE)) {
            outputFormat = APPLICATION_GML_3_TYPE
        } else if (
            externalLayer.getFeatureInfoCapability?.formats?.includes(APPLICATION_OGC_WMS_XML_TYPE)
        ) {
            outputFormat = APPLICATION_OGC_WMS_XML_TYPE
        } else {
            // if neither JSON nor GML3 are supported, we will ask for plain text
            outputFormat = PLAIN_TEXT_TYPE
        }
    }
    // params described as https://docs.geoserver.org/2.22.x/en/user/services/wms/reference.html#getfeatureinfo
    const params: { [key: string]: string | number | string[] | undefined } = {
        SERVICE: 'WMS',
        VERSION: externalLayer.wmsVersion ?? '1.3.0',
        REQUEST: 'GetFeatureInfo',
        LAYERS: layer.id,
        CRS: projection.epsg,
        BBOX: requestExtent.join(','),
        WIDTH: GET_FEATURE_INFO_FAKE_VIEWPORT_SIZE,
        HEIGHT: GET_FEATURE_INFO_FAKE_VIEWPORT_SIZE,
        QUERY_LAYERS: layer.id,
        INFO_FORMAT: outputFormat,
        FEATURE_COUNT: featureCount,
        LANG: lang,
        // Trying to activate a tolerance feature, guessing which are the main WMS server running environment
        // and looking at their documentation to see if it is supported.
        // ***************
        // It wasn't clear if MapServer used TOLERANCE directly, but that's what shows up in mapfiles in their doc
        // see: https://mapserver.org/mapfile/cluster.html#handling-getfeatureinfo
        TOLERANCE: tolerance,
        // Tolerance param for GeoServer
        // see: https://docs.geoserver.org/main/en/user/services/wms/reference.html#getfeatureinfo
        BUFFER: tolerance,
        // Tolerance param for QGIS server
        // see: https://docs.qgis.org/3.34/en/docs/server_manual/services/wms.html#wms-getfeatureinfo
        FI_POINT_TOLERANCE: tolerance,
        FI_LINE_TOLERANCE: tolerance,
        FI_POLYGON_TOLERANCE: tolerance,
        // tried to no avail finding this in degree doc (https://download.deegree.org/documentation/3.5.5/html)
        // there might exist more implementation of WMS, but I stopped there looking for more
        // (please add more if you think one of our customer/external layer providers uses another flavor of WMS)
    }
    // In WMS "all" years mean no TIME parameter
    if (
        externalLayer.timeConfig?.currentTimeEntry &&
        externalLayer.timeConfig.currentTimeEntry?.timestamp !== ALL_YEARS_TIMESTAMP
    ) {
        params.TIME = externalLayer.timeConfig.currentTimeEntry.timestamp
    }
    // WMS 1.3.0 uses i,j to describe pixel coordinate where we want feature info
    if (params.VERSION === '1.3.0') {
        params.I = GET_FEATURE_INFO_FAKE_VIEWPORT_SIZE / 2
        params.J = GET_FEATURE_INFO_FAKE_VIEWPORT_SIZE / 2
    } else {
        // older WMS versions use x,y instead
        params.X = GET_FEATURE_INFO_FAKE_VIEWPORT_SIZE / 2
        params.Y = GET_FEATURE_INFO_FAKE_VIEWPORT_SIZE / 2
    }
    const getFeatureInfoResponse = await axios({
        method: externalLayer.getFeatureInfoCapability?.method,
        url: externalLayer.getFeatureInfoCapability?.baseUrl,
        params,
    })
    if (getFeatureInfoResponse.data) {
        let features: GeoJsonFeature<Geometry>[] = []
        if (outputFormat === APPLICATION_GML_3_TYPE) {
            // transforming GML3 features into OL features, and then back to GeoJSON features
            features = new GeoJSON().writeFeaturesObject(
                new WMSGetFeatureInfo().readFeatures(getFeatureInfoResponse.data, {
                    dataProjection: projection.epsg,
                })
            )?.features
        } else if (outputFormat === APPLICATION_JSON_TYPE) {
            // nothing to do other than extracting the data
            features = getFeatureInfoResponse.data.features
        } else if (outputFormat === APPLICATION_OGC_WMS_XML_TYPE) {
            const getFeatureInfoFeatures = parseOGCWMSFeatureInfoResponse(
                getFeatureInfoResponse.data
            )
            if (getFeatureInfoFeatures) {
                features = getFeatureInfoFeatures.features
            }
        } else if (outputFormat === PLAIN_TEXT_TYPE) {
            // TODO : implement plain text parsing
            log.error('Plain text parsing not yet implemented')
        }
        return features?.map((feature) => {
            let geometry: Geometry = feature.geometry
            // if no geometry is defined (because we came from a GML or plain text parsing),
            // we use the click coordinate as a point
            if (!geometry) {
                geometry = {
                    type: 'Point',
                    coordinates: [...coordinate],
                }
            }
            const {
                id = null,
                identifier = null,
                title = null,
                name = null,
                label = null,
            } = feature.properties ?? {}
            const featureId = feature.id ?? id ?? identifier ?? title ?? name ?? label
            const featureName = label ?? name ?? title ?? identifier ?? id ?? featureId
            const layerFeature: LayerFeature = {
                isEditable: false,
                layer,
                id: featureId,
                title: featureName,
                data: feature.properties ?? undefined,
                coordinates: getGeoJsonFeatureCenter(
                    geometry,
                    projection,
                    outputProjection ?? projection
                ),
                geometry: reprojectGeoJsonGeometry(
                    geometry,
                    outputProjection ?? projection,
                    projection
                ),
                popupDataCanBeTrusted: !layer.isExternal && layer.type !== LayerType.KML,
            }
            return layerFeature
        })
    }
    return []
}

export interface IdentifyConfig {
    layer: Layer
    /** Coordinate where to identify */
    coordinate: SingleCoordinate | FlatExtent
    /** Current map resolution, in meters/pixel */
    resolution: number
    mapExtent: FlatExtent
    screenWidth: number
    screenHeight: number
    lang: string
    projection: CoordinateSystem
    featureCount: number
    tolerance?: number
    /**
     * Offset of how many items the identification should start after. This enables us to do some
     * "pagination" or "load more" (if you already have 10 features, set an offset of 10 to get the
     * 10 next, 20 in total). This only works with GeoAdmin backends
     */
    offset?: number
    /**
     * The wanted output projection. Enable us to request this WMS with a different projection and
     * then reproject on the fly if this WMS doesn't support the current map projection.
     */
    outputProjection?: CoordinateSystem
}

/**
 * Asks the backend for identification of features at the coordinates for the given layer using
 * http://api3.geo.admin.ch/services/sdiservices.html#identify-features or the
 * {@link getFeatureInfoCapability} of an external layer
 */
export function identify(config: IdentifyConfig): Promise<LayerFeature[]> {
    const {
        layer,
        coordinate,
        mapExtent,
        screenWidth,
        screenHeight,
        featureCount = DEFAULT_FEATURE_COUNT_SINGLE_POINT,
        tolerance = DEFAULT_FEATURE_IDENTIFICATION_TOLERANCE,
    } = config
    return new Promise((resolve, reject) => {
        if (!layer?.id) {
            log.error('Invalid layer', layer)
            reject(new Error('Needs a valid layer with an ID'))
        }
        if (!layer.hasTooltip) {
            log.error('Non queriable layer/no tooltip on this layer', layer)
            reject(new Error('Non queriable layer/no tooltip on this layer'))
        }
        if (!Array.isArray(coordinate) || (coordinate.length !== 2 && coordinate.length !== 4)) {
            log.error('Invalid coordinate', coordinate)
            reject(new Error('Needs a valid coordinate to run identification'))
        }
        if (!Array.isArray(mapExtent) || mapExtent.length !== 4) {
            log.error('Invalid extent', mapExtent)
            reject(new Error('Needs a valid map extent to run identification'))
        }
        if (screenWidth <= 0 || screenHeight <= 0) {
            log.error('Invalid screen size', screenWidth, screenHeight)
            reject(new Error('Needs valid screen width and height to run identification'))
        }
        if (!layer.isExternal) {
            identifyOnGeomAdminLayer({ ...config, tolerance, featureCount })
                .then(resolve)
                .catch((error) => {
                    log.error("Wasn't able to get feature from GeoAdmin layer", layer, error)
                    reject(new Error(error))
                })
        } else if (layer.isExternal) {
            identifyOnExternalLayer({
                ...config,
                tolerance,
                featureCount,
            })
                .then(resolve)
                .catch((error) => {
                    log.error("Wasn't able to get feature from external layer", layer, error)
                    reject(new Error(error))
                })
        } else {
            reject(new Error('Unknown layer type, cannot perform identify'))
        }
    })
}

/**
 * @param layer The layer from which the feature is part of
 * @param featureId The feature ID in the BGDI
 */
function generateFeatureUrl(layer: GeoAdminLayer, featureId: string | number): string {
    return `${getApi3BaseUrl()}rest/services/${layerUtils.getTopicForIdentifyAndTooltipRequests(layer)}/MapServer/${layer.id}/${featureId}`
}

/**
 * Generates parameters used to request endpoint to get a single feature's data and endpoint to get
 * a single feature's HTML popup. As some layers have a resolution-dependent answer, we have to give
 * the map extent and the current screen size with each request.
 */
function generateFeatureParams(options: GetFeatureOptions = {}): {
    [key: string]: number | string | undefined
} {
    const { lang = 'en', screenWidth, screenHeight, mapExtent, coordinate } = options
    let imageDisplay: string | undefined
    if (screenWidth && screenHeight) {
        imageDisplay = `${screenWidth},${screenHeight},96`
    }
    return {
        sr: LV95.epsgNumber,
        lang,
        imageDisplay,
        mapExtent: mapExtent?.join(','),
        coord: coordinate?.join(','),
    }
}

/**
 * @param layer The layer to which this feature belongs to
 * @param featureMetadata The backend response (either identify, or feature-resource) for this
 *   feature
 * @param featureHtmlPopup The backend response for the getHtmlPopup endpoint for this feature
 * @param outputProjection In which projection the feature should be in.
 * @param options
 */
function parseGeomAdminFeature(
    layer: GeoAdminLayer,
    featureMetadata: IdentifyResult,
    featureHtmlPopup: string,
    outputProjection: CoordinateSystem,
    options: GetFeatureOptions = {}
) {
    const { lang = 'en', coordinate } = options
    let featureExtent: FlatExtent | undefined
    if (featureMetadata.bbox) {
        featureExtent = extentUtils.flattenExtent(featureMetadata.bbox)
    }
    let featureName: string | undefined = featureMetadata.id
    if (featureMetadata.properties) {
        const { name, title, label } = featureMetadata.properties
        const titleInCurrentLang = featureMetadata.properties[`title_${lang}`]
        if (label) {
            featureName = label
        } else if (name) {
            featureName = name
        } else if (title) {
            featureName = title
        } else if (titleInCurrentLang) {
            featureName = titleInCurrentLang
        }
    }

    if (outputProjection.epsg !== LV95.epsg && featureExtent?.length === 4) {
        featureExtent = extentUtils.projExtent(LV95, outputProjection, featureExtent)
    }

    let featureGeoJSONGeometry: Geometry | undefined
    if (layer.isHighlightable) {
        featureGeoJSONGeometry = featureMetadata.geometry
    } else if (coordinate) {
        featureGeoJSONGeometry = {
            type: 'MultiPoint',
            coordinates: [coordinate],
        }
    }
    let center: SingleCoordinate | undefined
    if (featureGeoJSONGeometry) {
        center = getGeoJsonFeatureCenter(featureGeoJSONGeometry, LV95, outputProjection)
    } else {
        if (coordinate && coordinate.length === 4) {
            center = extentUtils.getExtentCenter(coordinate)
        } else {
            center = coordinate
        }
    }
    if (!center) {
        log.error('Unable to get center for feature', featureMetadata, options)
        return
    }

    const layerFeature: LayerFeature = {
        isEditable: false,
        layer,
        id: featureMetadata.id,
        title: featureName,
        popupData: featureHtmlPopup,
        coordinates: center,
        extent: featureExtent,
        geometry: featureGeoJSONGeometry,
        popupDataCanBeTrusted: !layer.isExternal && layer.type !== LayerType.KML,
    }
    return layerFeature
}

interface GetFeatureOptions {
    /** The language for the HTML popup. Will default to `en` if none given. */
    lang?: string
    /** Width of the screen in pixels */
    screenWidth?: number
    /** Height of the screen in pixels */
    screenHeight?: number
    /** Current extent of the map, described in LV95. */
    mapExtent?: FlatExtent
    coordinate?: SingleCoordinate | FlatExtent
}

/**
 * Loads a feature metadata and tooltip content from this two endpoint of the backend
 *
 * - https://api3.geo.admin.ch/services/sdiservices.html#feature-resource
 * - http://api3.geo.admin.ch/services/sdiservices.html#htmlpopup-resource
 *
 * @param layer The layer from which the feature is part of
 * @param featureId The feature ID in the BGDI
 * @param outputProjection Projection in which the coordinates (and possible extent) of the features
 *   should be expressed
 * @param options
 * @returns {Promise<LayerFeature>}
 */
const getFeature = (
    layer: GeoAdminLayer,
    featureId: string | number,
    outputProjection: CoordinateSystem,
    options: GetFeatureOptions = {}
): Promise<LayerFeature> => {
    return new Promise((resolve, reject) => {
        if (!layer?.id) {
            reject(new Error('Needs a valid layer with an ID'))
        }
        if (!featureId) {
            reject(new Error(`Needs a valid feature ID, got ${featureId} instead`))
        }
        if (!outputProjection) {
            reject(new Error('An output projection is required'))
        }
        const allRequests: Promise<unknown>[] = []
        allRequests.push(
            axios.get(generateFeatureUrl(layer, featureId), {
                params: {
                    geometryFormat: 'geojson',
                    ...generateFeatureParams(options),
                },
            }),
            getFeatureHtmlPopup(layer, featureId, options)
        )
        Promise.all(allRequests)
            .then((responses: unknown[]) => {
                const getFeatureResponse = responses[0] as AxiosResponse
                const featureHtmlPopup = responses[1] as string
                const featureMetadata = getFeatureResponse.data.feature ?? getFeatureResponse.data
                const parsedFeature = parseGeomAdminFeature(
                    layer,
                    featureMetadata,
                    featureHtmlPopup,
                    outputProjection,
                    options
                )
                if (parsedFeature) {
                    resolve(parsedFeature)
                } else {
                    reject(new Error('Unable to parse feature'))
                }
            })
            .catch((error) => {
                log.error(
                    'Error while requesting a feature to the backend',
                    layer,
                    featureId,
                    error
                )
                reject(new Error(error))
            })
    })
}

/**
 * Retrieves the HTML popup of a feature (the backend builds it for us).
 *
 * As the request's outcome is dependent on the resolution, we have to give the screen size and map
 * extent with the request.
 */
export function getFeatureHtmlPopup(
    layer: GeoAdminLayer,
    featureId: string | number,
    options: GetFeatureOptions
): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!layer?.id) {
            reject(new Error('Needs a valid layer with an ID'))
        }
        if (!featureId) {
            reject(new Error('Needs a valid feature ID'))
        }
        axios
            .get(`${generateFeatureUrl(layer, featureId)}/htmlPopup`, {
                params: generateFeatureParams(options),
            })
            .then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                log.error(
                    'Error while requesting a the HTML popup of a feature to the backend',
                    layer,
                    featureId,
                    error
                )
                reject(new Error(error))
            })
    })
}

export function isLineOrMeasure(feature: EditableFeature) {
    return (
        feature.featureType == EditableFeatureTypes.Measure ||
        feature.featureType == EditableFeatureTypes.LinePolygon
    )
}

export default getFeature
