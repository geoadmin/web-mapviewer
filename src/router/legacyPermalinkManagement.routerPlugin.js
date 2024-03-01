import proj4 from 'proj4'
import { START_LOCATION } from 'vue-router'

import { transformLayerIntoUrlString } from '@/router/storeSync/LayerParamConfig.class'
import { backgroundMatriceBetween2dAnd3d as backgroundMatriceBetweenLegacyAndNew } from '@/store/plugins/2d-to-3d-management.plugin'
import { LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import SwissCoordinateSystem from '@/utils/coordinates/SwissCoordinateSystem.class'
import {
    getKmlLayerFromLegacyAdminIdParam,
    getLayersFromLegacyUrlParams,
    isLegacyParams,
} from '@/utils/legacyLayerParamUtils'
import log from '@/utils/logging'

const handleLegacyKmlAdminIdParam = async (legacyParams, newQuery) => {
    log.debug('Transforming legacy kml adminId, get KML ID from adminId...')
    const kmlLayer = await getKmlLayerFromLegacyAdminIdParam(legacyParams.get('adminId'))
    log.debug('Adding KML layer from legacy kml adminId')
    if (newQuery.layers) {
        newQuery.layers = `${newQuery.layers};${kmlLayer.getID()}@adminId=${kmlLayer.adminId}`
    } else {
        newQuery.layers = `${kmlLayer.getID()}@adminId=${kmlLayer.adminId}`
    }

    // remove the legacy param from the newQuery
    delete newQuery.adminId
}

const handleLegacyParam = (
    params,
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

        case 'layers':
            // for legacy layers param, we need to give the layers visibility, opacity and timestamps,
            // as they are combined into one value with the layer in the current 'layers' parameter
            // implementation
            newValue = getLayersFromLegacyUrlParams(
                store.state.layers.config,
                legacyValue,
                params.get('layers_visibility'),
                params.get('layers_opacity'),
                params.get('layers_timestamp')
            )
                .map((layer) =>
                    transformLayerIntoUrlString(
                        layer,
                        store.getters.getLayerConfigById(layer.getID())
                    )
                )
                .join(';')
            log.debug('Importing legacy layers as', newValue)

            break
        // Setting the position of the compare slider
        case 'swipe_ratio':
            newValue = legacyValue
            key = 'compare_ratio'
            break
        case 'layers_opacity':
        case 'layers_visibility':
        case 'layers_timestamp':
            // Those are combined with the layers case. We simply ensure here that
            // they're not called multiple times for nothing
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

const handleLegacyParams = async (legacyParams, store) => {
    // if so, we transfer all old param (stored before vue-router's /#) and transfer them to the MapView
    // we will also transform legacy zoom level here (see comment below)
    const newQuery = {}
    const { projection } = store.state.position
    let legacyCoordinates = []
    let latlongCoordinates = []
    let cameraPosition = []

    legacyParams.forEach((param_value, param_key) => {
        handleLegacyParam(
            legacyParams,
            param_key,
            param_value,
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
    if (legacyParams.get('adminId')) {
        // adminId legacy param cannot be handle above in the loop because it needs to add a layer
        // to the layers param, thats why we do handle after.
        try {
            await handleLegacyKmlAdminIdParam(legacyParams, newQuery)
        } catch (error) {
            log.error(`Failed to retrieve KML from admin_id: ${error}`)
            // make sure to remove the adminId from the query
            delete newQuery.adminId
        }
        return {
            name: 'MapView',
            query: newQuery,
            replace: true,
        }
    }
    return {
        name: 'MapView',
        query: newQuery,
        replace: true,
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
    // We need to take the legacy params from the window.location.search, because the Vue Router
    // to.query only parse the query after the /#? and legacy params are at the root /?
    const legacyParams = isLegacyParams(window?.location?.search)
        ? new URLSearchParams(window?.location?.search)
        : null
    if (legacyParams) {
        log.debug(
            `[Legacy URL] starts legacy url param plugin params=${legacyParams.toString()}`,
            legacyParams
        )
        let unSubscribeStoreMutation = null
        const unsubscribeRouter = router.beforeEach(async (to, from) => {
            if (to.name === 'MapView' && from === START_LOCATION) {
                // Redirect to the LegacyParamsView until the app is ready and that the legacy
                // params have been parsed and converted. This is needed in order to postpone the
                // storeSync until the legacy params have been converted.
                log.info(
                    `[Legacy URL] redirect to LegacyParamsView params=${legacyParams.toString()}`,
                    legacyParams
                )

                unSubscribeStoreMutation = store.subscribe(async (mutation) => {
                    // Wait until the app is ready before dealing with legacy params. To handle
                    // legacy params some data are required (e.g. the layer config)
                    if (mutation.type === 'setAppIsReady') {
                        log.debug(
                            '[Legacy URL] app is ready, handle legacy params=${legacyParams.toString()}',
                            legacyParams
                        )
                        const newRoute = await handleLegacyParams(legacyParams, store)
                        log.info(`[Legacy URL] redirect to the converted params`, newRoute)
                        router.replace(newRoute)
                    }
                })
                return { name: 'LegacyParamsView', replace: true }
            }

            if (to.name === 'MapView' && from.name === 'LegacyParamsView') {
                log.debug('[Legacy URL] leaving the legacy URL plugin')
                unsubscribeRouter()
                unSubscribeStoreMutation()
            }
        })
    }
}

export default legacyPermalinkManagementRouterPlugin
