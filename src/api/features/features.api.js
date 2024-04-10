import axios from 'axios'
import { WMSGetFeatureInfo } from 'ol/format'
import GeoJSON from 'ol/format/GeoJSON'

import LayerFeature from '@/api/features/LayerFeature.class'
import ExternalLayer from '@/api/layers/ExternalLayer.class'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import GeoAdminLayer from '@/api/layers/GeoAdminLayer.class'
import { API_BASE_URL } from '@/config'
import allCoordinateSystems, { LV95 } from '@/utils/coordinates/coordinateSystems'
import { projExtent } from '@/utils/coordinates/coordinateUtils'
import { createPixelExtentAround } from '@/utils/extentUtils'
import { getGeoJsonFeatureCoordinates, reprojectGeoJsonData } from '@/utils/geoJsonUtils'
import log from '@/utils/logging'

const DEFAULT_FEATURE_COUNT = 10
const GET_FEATURE_INFO_FAKE_VIEWPORT_SIZE = 100

const APPLICATION_JSON_TYPE = 'application/json'
const APPLICATION_GML_3_TYPE = 'application/vnd.ogc.gml'
const PLAIN_TEXT_TYPE = 'text/plain'

/**
 * In pixels
 *
 * @type {Number}
 */
const DEFAULT_FEATURE_IDENTIFICATION_TOLERANCE = 10

/**
 * Error when building or requesting an external layer's getFeatureInfo endpoint
 *
 * This class also contains an i18n translation key in plus of a technical english message. The
 * translation key can be used to display a translated user message.
 *
 * @property {String} message Technical english message
 * @property {String} key I18n translation key for a user message
 */
export class GetFeatureInfoError extends Error {
    constructor(message, key) {
        super(message)
        this.key = key
        this.name = 'GetFeatureInfoError'
    }
}

/**
 * Extract OL feature coordinates in format that we support in our application
 *
 * @param {Feature} feature Openlayer kml feature
 * @returns {[[lat, lon]]} Return the coordinate of the feature
 */
export function extractOlFeatureCoordinates(feature) {
    let coordinates = feature.getGeometry().getCoordinates()
    switch (feature.getGeometry().getType()) {
        case 'Polygon':
            // in the case of a polygon, the coordinates structure is
            // [
            //   [ (poly1)
            //      [coord1],[coord2]
            //   ],
            //   [ (poly2) ...
            // ]
            // so as we will not have multipoly, we only keep what's defined as poly one
            // (we remove the wrapping array that would enable us to have a second polygon)
            coordinates = coordinates[0]
            break
        case 'Point':
            // we ensure the coordinates are wrapped ([ [x,y] ]
            if (!Array.isArray(coordinates[0])) {
                coordinates = [coordinates]
            }
            break
    }
    return coordinates
}

/**
 * Extract geodesic coordinates from OL feature
 *
 * @param {Feature} feature OL feature
 * @returns {[[lat, lon]]} Return the geodesic coordinate of the feature
 */
export function extractOlFeatureGeodesicCoordinates(feature) {
    return feature.get('geodesic')?.getGeodesicGeom().getCoordinates()[0]
}

/**
 * @param {GeoAdminLayer} layer
 * @param {CoordinateSystem} projection
 * @param {[Number, Number]} coordinate
 * @param {Number} screenWidth
 * @param {Number} screenHeight
 * @param {[Number, Number, Number, Number]} mapExtent
 * @param {String} lang
 * @param {Number} featureCount
 * @returns {Promise<LayerFeature[]>}
 */
async function identifyOnGeomAdminLayer({
    layer,
    projection,
    coordinate,
    screenWidth,
    screenHeight,
    mapExtent,
    lang,
    featureCount,
}) {
    const identifyResponse = await axios.get(
        `${API_BASE_URL}rest/services/${layer.getTopicForIdentifyAndTooltipRequests()}/MapServer/identify`,
        {
            // params described as https://api3.geo.admin.ch/services/sdiservices.html#identify-features
            params: {
                layers: `all:${layer.id}`,
                sr: projection.epsgNumber,
                geometry: coordinate.join(','),
                mapExtent: mapExtent.join(','),
                imageDisplay: `${screenWidth},${screenHeight},96`,
                geometryFormat: 'geojson',
                geometryType: `esriGeometry${coordinate.length === 2 ? 'Point' : 'Envelope'}`,
                limit: featureCount,
                tolerance: DEFAULT_FEATURE_IDENTIFICATION_TOLERANCE,
                returnGeometry: true,
                timeInstant: layer.timeConfig?.currentYear ?? null,
                lang: lang,
            },
        }
    )
    // firing a getFeature (async/parallel) on each identified feature
    const featureRequests = []
    if (identifyResponse.data?.results?.length > 0) {
        // for each feature that has been identified, we will now load their metadata and tooltip content
        identifyResponse.data.results.forEach((feature) => {
            featureRequests.push(getFeature(layer, feature.id, projection, lang))
        })
    }
    // waiting on the result of all parallel getFeature requests
    return await Promise.all(featureRequests)
}

/**
 * @param {ExternalLayer} config.layer
 * @param {[Number, Number]} config.coordinate Point where we want to have a getFeatureInfo request
 *   being triggered
 * @param {Number} config.resolution Current map resolution, in meters/pixel
 * @param {Number} config.tolerance How much pixel tolerance the request should take into account
 *   (if applicable)
 * @param {CoordinateSystem} config.projection The projection to use when requesting data, must be
 *   one of the available projections of this layer. A GetFeatureInfoError will be raised if the
 *   projection isn't among the available ones.
 * @param {String} config.lang The ISO code for the lang the request should return data into
 * @param {Number} config.featureCount How many feature should be returned (maximum)
 * @returns {Promise<LayerFeature[]>}
 * @throws GetFeatureInfoError If any part of the input is not valid
 */
async function identifyOnExternalLayer(config) {
    const {
        layer = null,
        coordinate = null,
        resolution = null,
        tolerance = null,
        projection = null,
        lang = null,
        featureCount = null,
    } = config
    if (!layer) {
        throw new GetFeatureInfoError('Missing layer')
    }
    if (!layer.hasTooltip || !layer.getFeatureInfoCapability) {
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
    // deciding on which projection we should land to ask the WMS server (the current map projection might not be supported)
    let requestProjection = projection
    if (!requestProjection) {
        throw new GetFeatureInfoError('Missing projection to build a getFeatureInfo request')
    }
    if (
        !layer.availableProjections.some(
            (availableProjection) => availableProjection.epsg === requestProjection.epsg
        )
    ) {
        // trying to find a candidate among the app supported projections
        requestProjection = allCoordinateSystems.find((candidate) =>
            layer.availableProjections.some(
                (availableProjection) => availableProjection.epsg === candidate.epsg
            )
        )
    }
    if (!requestProjection) {
        throw new GetFeatureInfoError(
            `No common projection found with external WMS provider, possible projection were ${layer.availableProjections.map((proj) => proj.epsg).join(', ')}`
        )
    }
    if (layer instanceof ExternalWMSLayer) {
        return await identifyOnExternalWmsLayer({
            coordinate,
            projection: requestProjection,
            resolution,
            layer,
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
 *
 * @param {[Number, Number]} config.coordinate
 * @param {CoordinateSystem} config.projection
 * @param {Number} config.resolution
 * @param {ExternalWMSLayer} config.layer
 * @param {Number} config.featureCount
 * @param {String} config.lang
 * @param {Number} config.tolerance
 * @param {CoordinateSystem} config.outputProjection The wanted output projection. Enable us to
 *   request this WMS with a different projection and then reproject on the fly if this WMS doesn't
 *   suppor the current map projection.
 * @returns {Promise<LayerFeature[]>}
 */
async function identifyOnExternalWmsLayer(config) {
    const {
        coordinate,
        projection,
        resolution,
        layer,
        featureCount,
        lang,
        tolerance,
        outputProjection = null,
    } = config

    const requestExtent = createPixelExtentAround({
        size: GET_FEATURE_INFO_FAKE_VIEWPORT_SIZE,
        coordinate,
        projection,
        resolution,
        rounded: true,
    })
    if (!requestExtent) {
        throw new GetFeatureInfoError('Unable to build required request extent')
    }
    // selecting output format depending on external WMS capabilities
    // preferring JSON output
    let outputFormat = APPLICATION_JSON_TYPE
    if (!layer.getFeatureInfoCapability.formats?.includes(outputFormat)) {
        // if JSON isn't supported, we check if GML3 is supported
        if (layer.getFeatureInfoCapability.formats?.includes(APPLICATION_GML_3_TYPE)) {
            outputFormat = APPLICATION_GML_3_TYPE
        } else {
            // if neither JSON nor GML3 are supported, we will ask for plain text
            outputFormat = PLAIN_TEXT_TYPE
        }
    }
    // params described as https://docs.geoserver.org/2.22.x/en/user/services/wms/reference.html#getfeatureinfo
    const params = {
        SERVICE: 'WMS',
        VERSION: layer.wmsVersion ?? '1.3.0',
        REQUEST: 'GetFeatureInfo',
        LAYERS: layer.externalLayerId,
        STYLES: null,
        CRS: projection.epsg,
        BBOX: requestExtent.join(','),
        WIDTH: GET_FEATURE_INFO_FAKE_VIEWPORT_SIZE,
        HEIGHT: GET_FEATURE_INFO_FAKE_VIEWPORT_SIZE,
        QUERY_LAYERS: layer.externalLayerId,
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
        method: layer.getFeatureInfoCapability.method,
        url: layer.getFeatureInfoCapability.baseUrl,
        params,
    })
    if (getFeatureInfoResponse.data) {
        let features = []
        switch (outputFormat) {
            case APPLICATION_GML_3_TYPE:
                // transforming GML3 features into OL features, and then back to GeoJSON features
                features = new GeoJSON().writeFeaturesObject(
                    new WMSGetFeatureInfo().readFeatures(getFeatureInfoResponse.data, {
                        dataProjection: projection.epsg,
                    })
                )?.features
                break
            case APPLICATION_JSON_TYPE:
                // nothing to do other than extracting the data
                features = getFeatureInfoResponse.data.features
                break
            case PLAIN_TEXT_TYPE:
                // TODO : implement plain text parsing
                log.error('Plain text parsing not yet implemented')
                break
        }
        return features?.map((feature) => {
            let geometry = feature.geometry
            // if no geometry is defined (because we came from a GML or plain text parsing),
            // we use the click coordinate as a point
            if (!geometry) {
                geometry = {
                    type: 'Point',
                    coordinates: [...coordinate],
                }
            }
            return new LayerFeature({
                layer,
                id: feature.id,
                data: feature.properties,
                coordinates: getGeoJsonFeatureCoordinates(
                    geometry,
                    projection,
                    outputProjection ?? projection
                ),
                geometry: reprojectGeoJsonData(
                    geometry,
                    outputProjection ?? projection,
                    projection
                ),
            })
        })
    }
    return []
}

/**
 * Asks the backend for identification of features at the coordinates for the given layer using
 * http://api3.geo.admin.ch/services/sdiservices.html#identify-features or the
 * {@link getFeatureInfoCapability} of an external layer
 *
 * @param {AbstractLayer} config.layer
 * @param {Number[]} config.coordinate Coordinate where to identify feature in EPSG:3857
 * @param {Number} config.resolution Current map resolution, in meters/pixel
 * @param {Number[]} config.mapExtent
 * @param {Number} config.screenWidth
 * @param {Number} config.screenHeight
 * @param {String} config.lang
 * @param {CoordinateSystem} config.projection Projection in which the coordinates of the features
 *   should be expressed
 * @returns {Promise<LayerFeature[]>}
 */
export const identify = (config) => {
    const {
        layer = null,
        coordinate = null,
        resolution = null,
        mapExtent = null,
        screenWidth = null,
        screenHeight = null,
        lang = null,
        projection = null,
        featureCount = DEFAULT_FEATURE_COUNT,
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
        if (layer instanceof GeoAdminLayer) {
            identifyOnGeomAdminLayer({
                layer,
                projection,
                coordinate,
                screenWidth,
                screenHeight,
                mapExtent,
                lang,
                featureCount,
            })
                .then(resolve)
                .catch((error) => {
                    log.error("Wasn't able to get feature from GeoAdmin layer", layer, error)
                    reject(error)
                })
        } else if (layer instanceof ExternalLayer) {
            identifyOnExternalLayer({
                layer,
                coordinate,
                resolution,
                tolerance: DEFAULT_FEATURE_IDENTIFICATION_TOLERANCE,
                projection,
                lang,
                featureCount,
            })
                .then(resolve)
                .catch((error) => {
                    log.error("Wasn't able to get feature from external layer", layer, error)
                    reject(error)
                })
        } else {
            reject(new Error('Unknown layer type, cannot perform identify'))
        }
    })
}

/**
 * Loads a feature metadata and tooltip content from this two endpoint of the backend
 *
 * - http://api3.geo.admin.ch/services/sdiservices.html#identify-features
 * - http://api3.geo.admin.ch/services/sdiservices.html#htmlpopup-resource
 *
 * @param {GeoAdminLayer} layer The layer from which the feature is part of
 * @param {String | Number} featureID The feature ID in the BGDI
 * @param {CoordinateSystem} outputProjection Projection in which the coordinates (and possible
 *   extent) of the features should be expressed
 * @param {String} lang The language for the HTML popup
 * @returns {Promise<LayerFeature>}
 */
const getFeature = (layer, featureID, outputProjection, lang = 'en') => {
    return new Promise((resolve, reject) => {
        if (!layer?.id) {
            reject('Needs a valid layer with an ID')
        }
        if (!featureID) {
            reject('Needs a valid feature ID')
        }
        // combining the two requests in one promise
        const topic = layer.getTopicForIdentifyAndTooltipRequests()
        const featureUrl = `${API_BASE_URL}rest/services/${topic}/MapServer/${layer.id}/${featureID}`
        axios
            .all([
                axios.get(featureUrl, {
                    params: {
                        sr: LV95.epsgNumber,
                        geometryFormat: 'geojson',
                    },
                }),
                axios.get(`${featureUrl}/htmlPopup`, {
                    params: {
                        sr: LV95.epsgNumber,
                        lang: lang,
                    },
                }),
            ])
            .then((responses) => {
                const featureMetadata = responses[0].data.feature
                    ? responses[0].data.feature
                    : responses[0].data
                const featureHtmlPopup = responses[1].data
                const featureGeoJSONGeometry = featureMetadata.geometry
                let featureExtent = []
                if (featureMetadata.bbox) {
                    featureExtent.push(...featureMetadata.bbox)
                }
                const featureName = featureMetadata?.properties?.name ?? featureID

                if (outputProjection.epsg !== LV95.epsg) {
                    if (featureExtent.length === 4) {
                        featureExtent = projExtent(LV95, outputProjection, featureExtent)
                    }
                }

                resolve(
                    new LayerFeature({
                        layer,
                        id: featureID,
                        name: featureName,
                        data: featureHtmlPopup,
                        coordinates: getGeoJsonFeatureCoordinates(
                            featureGeoJSONGeometry,
                            LV95,
                            outputProjection
                        ),
                        extent: featureExtent,
                        geometry: featureGeoJSONGeometry,
                    })
                )
            })
            .catch((error) => {
                log.error(
                    'Error while requesting a feature to the backend',
                    layer,
                    featureID,
                    error
                )
                reject(error)
            })
    })
}

export default getFeature
