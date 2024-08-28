import proj4 from 'proj4'
import { START_LOCATION } from 'vue-router'

import reframe from '@/api/lv03Reframe.api'
import { transformLayerIntoUrlString } from '@/router/storeSync/layersParamParser'
import {
    EMBED_VIEW,
    LEGACY_EMBED_PARAM_VIEW,
    LEGACY_PARAM_VIEW,
    LEGACY_VIEWS,
    MAP_VIEW,
    MAP_VIEWS,
} from '@/router/viewNames'
import { FeatureInfoPositions } from '@/store/modules/ui.store'
import { LV03, LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import SwissCoordinateSystem from '@/utils/coordinates/SwissCoordinateSystem.class'
import {
    getKmlLayerFromLegacyAdminIdParam,
    getLayersFromLegacyUrlParams,
    handleLegacyFeaturePreSelectionParam,
    isLegacyParams,
} from '@/utils/legacyLayerParamUtils'
import log from '@/utils/logging'

const handleLegacyKmlAdminIdParam = async (legacyParams, newQuery) => {
    log.debug('Transforming legacy kml adminId, get KML ID from adminId...')
    const kmlLayer = await getKmlLayerFromLegacyAdminIdParam(legacyParams.get('adminId'))
    log.debug('Adding KML layer from legacy kml adminId')
    if (newQuery.layers) {
        newQuery.layers = `${newQuery.layers};KML|${kmlLayer.id}@adminId=${kmlLayer.adminId}`
    } else {
        newQuery.layers = `KML|${kmlLayer.id}@adminId=${kmlLayer.adminId}`
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

        // storing coordinate parts for later conversion (LV03 or LV95)
        // legacy coordinates have to be saved in an array in order (y,x) for
        // convertion to be correct using proj4.
        case 'N':
        case 'X':
            legacyCoordinates[1] = Number(legacyValue)
            break
        case 'E':
        case 'Y':
            legacyCoordinates[0] = Number(legacyValue)
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
            // if the "legacy" value already contains our new separators, it means the app was accessed
            // without using the hash slash approach, but we still shouldn't be parsing as legacy
            if (
                ['@feature', '@year', ';'].some(
                    (newSeparator) => legacyValue.indexOf(newSeparator) !== -1
                )
            ) {
                newValue = legacyValue
                break
            }
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
                    transformLayerIntoUrlString(layer, store.getters.getLayerConfigById(layer.id))
                )
                .join(';')
            log.debug('Importing legacy layers as', newValue)

            break
        // Setting the position of the compare slider
        case 'swipe_ratio':
            newValue = legacyValue
            key = 'compareRatio'
            break
        case 'time':
            key = 'timeSlider'
            newValue = legacyValue
            break
        case 'layers_opacity':
        case 'layers_visibility':
        case 'layers_timestamp':
            // Those are combined with the layers case. We simply ensure here that
            // they're not called multiple times for nothing
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
        case 'showTooltip':
            key = 'featureInfo'
            newValue =
                legacyValue === 'true' ? FeatureInfoPositions.DEFAULT : FeatureInfoPositions.NONE
            break
        // if no special work to do, we just copy past legacy params to the new viewer
        default:
            // NOTE: legacyValue is parsed using URLSearchParams which don't make any difference
            // between &foo and &foo=
            newValue = legacyValue
            break
    }

    if (newValue !== undefined) {
        // When receiving a query, the application will encode the URI components
        // We decode those so that the new query won't encode encoded character
        // for example, we avoid having " " becoming %2520 in the URI
        newQuery[key] = decodeURIComponent(newValue)
        log.info(
            `[Legacy URL] ${param}=${legacyValue} parameter changed to ${key}=${decodeURIComponent(newValue)}`,
            newQuery
        )
    } else {
        log.error(`[Legacy URL] ${param}=${legacyValue} parameter not processed`)
    }
}

const handleLegacyParams = async (legacyParams, store, originView) => {
    // if so, we transfer all old param (stored before vue-router's /#) and transfer them to the MapView
    // we will also transform legacy zoom level here (see comment below)
    const newQuery = {}
    const { projection } = store.state.position
    const legacyCoordinates = []
    const latlongCoordinates = []
    let newCoordinates = []
    let cameraPosition = [null, null, null, null, null, null]

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
    if (cameraPosition.filter((value) => value !== null).length >= 3) {
        // if no pitch is set, we look down to the ground instead of letting no value (0, looking at the horizon) go through
        if (cameraPosition[3] === null) {
            cameraPosition[3] = -90
        }
        newQuery['camera'] = cameraPosition.map((value) => value ?? '').join(',')
        newQuery['3d'] = true
        newQuery['sr'] = WEBMERCATOR.epsgNumber
    }

    // Convert legacies coordinates if needed (only if the 3D camera isn't set too)
    if (latlongCoordinates.length === 2 && !newQuery['camera']) {
        newCoordinates = proj4(WGS84.epsg, projection.epsg, latlongCoordinates)
        newQuery['center'] = newCoordinates.join(',')
        log.info(
            `[Legacy URL] lat/lon=${JSON.stringify(latlongCoordinates)} parameter changed to center=${newQuery['center']}`
        )
    } else if (legacyCoordinates.length === 2 && !newQuery['camera']) {
        // The legacy viewer supports coordinate in LV03 and LV95 in X/Y and E/N parameter
        newCoordinates = legacyCoordinates
        if (LV95.isInBounds(...legacyCoordinates) && projection.epsg !== LV95.epsg) {
            // if the current projection is not LV95, we also need to re-project x/y or N/E
            newCoordinates = proj4(LV95.epsg, projection.epsg, legacyCoordinates)
            log.info(
                `[Legacy URL] converting LV95 X/Y|E/N=${JSON.stringify(legacyCoordinates)} to ${projection.epsg} => ${JSON.stringify(newCoordinates)}`
            )
        } else if (LV03.isInBounds(...legacyCoordinates) && projection.epsg !== LV03.epsg) {
            // if the current projection is not LV03, we also need to re-project x/y or N/E
            newCoordinates = await reframe({
                inputCoordinates: legacyCoordinates,
                inputProjection: LV03,
            })
            log.info(
                `[Legacy URL] converting LV03 X/Y|E/N=${JSON.stringify(legacyCoordinates)} to ${projection.epsg} => ${JSON.stringify(newCoordinates)}`
            )
        }
        newQuery['center'] = newCoordinates.join(',')
        log.info(
            `[Legacy URL] X/Y|E/N=${JSON.stringify(legacyCoordinates)} parameter changed to center=${newQuery['center']}`
        )
    }

    handleLegacyFeaturePreSelectionParam(legacyParams, store, newQuery)

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
            name: originView,
            query: newQuery,
            replace: true,
        }
    }
    return {
        name: originView,
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
        // NOTE: the legacy embed view was at /embed.html. Unfortunately we cannot in this application
        // reroute to another path before the #, because the vue router using the createWebHashHistory
        // can only handle route after the hash. Therefore we have an external redirect service
        // that will redirect to /embed.html to ?legacyEmbed. We use this pseudo legacyEmbed to
        // redirect to #/embed once the other legacy parameters have been translated.
        const legacyEmbed = legacyParams.has('legacyEmbed')
        log.debug(
            `[Legacy URL] starts legacy url param plugin params=${legacyParams.toString()}, legacyEmbed=${legacyEmbed}`,
            legacyParams
        )
        let unSubscribeStoreMutation = null
        const unsubscribeRouter = router.beforeEach(async (to, from) => {
            log.debug(
                `[Legacy URL] entry into the legacy router with parameters 'form' and 'to': `,
                from,
                to
            )

            if (MAP_VIEWS.includes(to.name) && from === START_LOCATION) {
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
                            `[Legacy URL] app is ready, handle legacy params=${legacyParams.toString()}`,
                            legacyParams
                        )
                        const newRoute = await handleLegacyParams(
                            legacyParams,
                            store,
                            legacyEmbed ? EMBED_VIEW : MAP_VIEW
                        )
                        log.info(`[Legacy URL] redirect to the converted params`, newRoute)
                        router.replace(newRoute)
                    }
                })
                log.debug(
                    `[Legacy URL]: redirect between embed legacy view or standard legacy view`
                )
                return {
                    name: legacyEmbed ? LEGACY_EMBED_PARAM_VIEW : LEGACY_PARAM_VIEW,
                    replace: true,
                }
            }

            if (MAP_VIEWS.includes(to.name) && LEGACY_VIEWS.includes(from.name)) {
                log.info('[Legacy URL] Work is done, unsuscribing from the mutations')
                unsubscribeRouter()
                unSubscribeStoreMutation()
            }
            log.debug('[Legacy URL] exiting the Legacy URL router.')
            return true
        })
    }
}

export default legacyPermalinkManagementRouterPlugin
