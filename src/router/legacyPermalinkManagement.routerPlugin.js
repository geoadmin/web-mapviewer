import proj4 from 'proj4'

import { transformLayerIntoUrlString } from '@/router/storeSync/LayerParamConfig.class'
import { backgroundMatriceBetween2dAnd3d as backgroundMatriceBetweenLegacyAndNew } from '@/store/plugins/2d-to-3d-management.plugin'
import { LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import SwissCoordinateSystem from '@/utils/coordinates/SwissCoordinateSystem.class'
import {
    getKmlLayerFromLegacyAdminIdParam,
    getLayersFromLegacyUrlParams,
    isLayersUrlParamLegacy,
} from '@/utils/legacyLayerParamUtils'
import log from '@/utils/logging'

/**
 * @param {String} search
 * @returns {any}
 */
const parseLegacyParams = (search) => {
    const parts = search.match(/(\?|&)([^=]+)=([^&]+)/g)
    const params = {}
    if (parts && Array.isArray(parts)) {
        parts.forEach((part) => {
            const equalSignIndex = part.indexOf('=')
            const paramName = part.substr(1, equalSignIndex - 1)
            params[paramName] = part.substr(equalSignIndex + 1)
        })
    }
    return params
}

const handleLegacyKmlAdminIdParam = async (legacyParams, newQuery) => {
    log.debug('Transforming legacy kml adminId, get KML ID from adminId...')
    const kmlLayer = await getKmlLayerFromLegacyAdminIdParam(legacyParams['adminId'])
    log.debug('Adding KML layer from legacy kml adminId')
    if (newQuery.layers) {
        newQuery.layers = `${newQuery.layers};${kmlLayer.getID()}@adminId=${kmlLayer.adminId}`
    } else {
        newQuery.layers = `${kmlLayer.getID()}@adminId=${kmlLayer.adminId}`
    }

    // remove the legacy param from the newQuery
    delete newQuery.adminId

    return newQuery
}

const handleLegacyParam = (
    param,
    legacyValue,
    store,
    newQuery,
    latlongCoordinates,
    legacyCoordinates,
    cameraPosition
) => {
    const { projection } = store.state.position
    let newValue

    let key = param
    switch (param) {
        case 'zoom':
            // the legacy viewer always expresses its zoom level in the LV95 context (so in SwissCoordinateSystem)
            if (!(projection instanceof SwissCoordinateSystem)) {
                newValue = LV95.transformCustomZoomLevelToStandard(legacyValue)
                if (projection instanceof CustomCoordinateSystem) {
                    newValue = projection.transformStandardZoomLevelToCustom(newValue)
                }
            } else {
                newValue = legacyValue
            }
            key = 'z'
            break

        // storing coordinate parts for later conversion
        case 'E':
        case 'X':
            legacyCoordinates[0] = Number(legacyValue)
            break
        case 'N':
        case 'Y':
            legacyCoordinates[1] = Number(legacyValue)
            break

        case 'lon':
            latlongCoordinates[0] = Number(legacyValue)
            cameraPosition[0] = Number(legacyValue)
            break
        case 'lat':
            latlongCoordinates[1] = Number(legacyValue)
            cameraPosition[1] = Number(legacyValue)
            break

        // taking all layers related param aside so that they can be processed later (see below)
        // this only occurs if the syntax is recognized as a mf-geoadmin3 syntax (or legacy)
        case 'layers':
            if (isLayersUrlParamLegacy(legacyValue)) {
                // for legacy layers param, we need to give the whole search query
                // as it needs to look for layers, layers_visibility, layers_opacity and
                // layers_timestamp param altogether
                const layers = getLayersFromLegacyUrlParams(
                    store.state.layers.config,
                    window.location.search
                )
                newValue = layers.map((layer) => transformLayerIntoUrlString(layer)).join(';')
                log.debug('Importing legacy layers as', newValue)
            } else {
                // if not legacy, we let it go as it is
                newValue = legacyValue
            }
            break
        // Setting the position of the compare slider
        case 'swipe_ratio':
            newValue = legacyValue
            key = 'compare_ratio'
            break
        case 'layers_opacity':
        case 'layers_visibility':
        case 'layers_timestamp':
            // we ignore those params as they are now obsolete
            // see adr/2021_03_16_url_param_structure.md
            break

        case '3d':
            // if the 3d flag is given without being placed behind the hash (meaning at startup),
            // we need to make sure the projection is set to Mercator, otherwise the startup sequence
            // ends up not working properly and center the view wrongly
            if ((typeof legacyValue === 'string' && legacyValue === 'true') || legacyValue) {
                newQuery['sr'] = WEBMERCATOR.epsgNumber
            }
            newValue = legacyValue
            break

        case 'elevation':
            cameraPosition[2] = Number(legacyValue)
            break

        case 'pitch':
            cameraPosition[3] = Number(legacyValue)
            break

        case 'heading':
            cameraPosition[4] = Number(legacyValue)
            break

        // if no special work to do, we just copy past legacy params to the new viewer
        default:
            newValue = legacyValue
            break
    }

    if (newValue) {
        // When receiving a query, the application will encode the URI components
        // We decode those so that the new query won't encode encoded character
        // for example, we avoid having " " becoming %2520 in the URI
        newQuery[key] = decodeURIComponent(newValue)
    }
}

const handleLegacyParams = (legacyParams, store, to, next) => {
    log.info(`Legacy permalink with param=`, legacyParams)
    // if so, we transfer all old param (stored before vue-router's /#) and transfer them to the MapView
    // we will also transform legacy zoom level here (see comment below)
    const newQuery = { ...to.query }
    const { projection } = store.state.position
    let legacyCoordinates = []
    let latlongCoordinates = []
    let cameraPosition = []

    Object.keys(legacyParams).forEach((param) => {
        handleLegacyParam(
            param,
            legacyParams[param],
            store,
            newQuery,
            latlongCoordinates,
            legacyCoordinates,
            cameraPosition
        )
    })
    if (cameraPosition.length >= 3) {
        cameraPosition.push('')
        newQuery['camera'] = cameraPosition.join(',')
        newQuery['3d'] = true
        newQuery['sr'] = WEBMERCATOR.epsgNumber

        // Handle different background layer from legacy 3D parameter
        if (newQuery['bgLayer']) {
            const newBackgroundLayer = backgroundMatriceBetweenLegacyAndNew[newQuery['bgLayer']]
            if (newBackgroundLayer) {
                newQuery['bgLayer'] = newBackgroundLayer
            }
        }
    }

    // Convert legacies coordinates if needed
    if (latlongCoordinates.length === 2) {
        legacyCoordinates = proj4(WGS84.epsg, projection.epsg, latlongCoordinates)
    } else if (legacyCoordinates.length === 2) {
        if (projection.epsg !== LV95.epsg) {
            // if the current projection is not LV95, we also need to re-project x/y or N/E
            // (the legacy viewer was always writing coordinates in LV95 in the URL)
            legacyCoordinates = proj4(LV95.epsg, projection.epsg, legacyCoordinates)
        }
    }

    // if a legacy coordinate (x/y, N/E or lon/lat) was used, we need to build the
    // center param from them
    if (legacyCoordinates.length === 2) {
        newQuery['center'] = legacyCoordinates.join(',')
    }

    // removing old query part (new ones will be added by vue-router after the /# part of the URL)
    const urlWithoutQueryParam = window.location.href.substr(0, window.location.href.indexOf('?'))
    window.history.replaceState(window.history.state, document.title, urlWithoutQueryParam)

    if ('adminId' in legacyParams) {
        // adminId legacy param cannot be handle above in the loop because it needs to add a layer
        // to the layers param, thats why we do handle after.
        handleLegacyKmlAdminIdParam(legacyParams, newQuery)
            .then((updatedQuery) => {
                next({
                    name: 'MapView',
                    query: updatedQuery,
                })
            })
            .catch((error) => {
                log.error(`Failed to retrieve KML from admin_id: ${error}`)
                // make sure to remove the adminId from the query
                delete newQuery.adminId
                next({
                    name: 'MapView',
                    query: newQuery,
                })
            })
    } else {
        next({
            name: 'MapView',
            query: newQuery,
        })
    }
}

/**
 * Loads all URL parameters before the hash and adds them after the hash.
 *
 * Example:
 *
 * - `http://localhost:8080/?geolocation=true&layers=some.layer.id` =>
 *   `http://localhost:8080/#/?geolocation=true&layers=some.layer.id`
 *
 * In this process, we have the opportunity to alter/edit some parameters that are not expressed the
 * same way in web-mapviewer than what they were in mf-geoadmin3, essentially enabling
 * retro-compatibility for link sharing (which is an important feature to have)
 *
 * Some special cases are :
 *
 * - Zoom: as mf-geoadmin3 was using zoom level fitting the LV95 projection, we translate those zoom
 *   levels into world wide zoom levels. See {@link SwissCoordinateSystem}
 * - Easting/northing, E/N or x/y: webmapviewer is using EPSG:3857 as its engine projection and shows
 *   EPSG:4326 to the user, during the import of X and Y type coordinates we reproject them to
 *   EPSG:4326 and relabel them lat and lon accordingly
 *
 * @param {Router} router
 * @param {Store} store
 */
const legacyPermalinkManagementRouterPlugin = (router, store) => {
    let isFirstRequest = true
    // We need to take the legacy params from the window.location.search, because the Vue Router
    // to.query only parse the query after the /#? and legacy params are at the root /?
    const legacyParams =
        window.location && window.location.search ? parseLegacyParams(window.location.search) : null
    router.beforeEach((to, from, next) => {
        // Waiting for the app to enter the MapView before dealing with legacy param, otherwise
        // the storeSync plugin might overwrite some parameters. To handle legacy param we also
        // need the app to be ready because some data are required (e.g. the layer config)
        if (isFirstRequest && to.name === 'MapView') {
            // before the first request, we check out if we need to manage any legacy params
            // (from the old viewer)
            isFirstRequest = false
            if (legacyParams) {
                handleLegacyParams(legacyParams, store, to, next)
            } else {
                next()
            }
        } else {
            next()
        }
    })
}

export default legacyPermalinkManagementRouterPlugin
