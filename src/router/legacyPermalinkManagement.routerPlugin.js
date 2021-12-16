import log from '@/utils/logging'
import { round } from '@/utils/numberUtils'
import { translateSwisstopoPyramidZoomToMercatorZoom } from '@/utils/zoomLevelUtils'
import {
    getLayersFromLegacyUrlParams,
    isLayersUrlParamLegacy,
    getKmlLayerFromLegacyAdminIdParam,
} from '@/utils/legacyLayerParamUtils'
import { transformLayerIntoUrlString } from '@/router/storeSync/LayerParamConfig.class'
import { reprojectUnknownSrsCoordsToWebMercator } from '@/utils/coordinateUtils'

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
 *   levels into world wide zoom levels. See {@link translateSwisstopoPyramidZoomToMercatorZoom}
 * - Easting/northing, E/N or x/y: webmapviewer is using EPSG:3857 as its engine projection and shows
 *   EPSG:4326 to the user, during the import of X and Y type coordinates we reproject them to
 *   EPSG:4326 and relabel them lat and lon accordingly
 *
 * @param {VueRouter} router
 * @param {Vuex.Store} store
 */
const legacyPermalinkManagementRouterPlugin = (router, store) => {
    let isFirstRequest = true
    const legacyParams =
        window.location && window.location.search ? parseLegacyParams(window.location.search) : null

    router.beforeEach((to, from, next) => {
        // waiting for the app to be ready before dealing with legacy param
        // as we need information from the layers' config
        if (isFirstRequest && store.state.app.isReady) {
            // before the first request, we check out if we need to manage any legacy params (from the old viewer)
            isFirstRequest = false
            if (legacyParams) {
                log('info', `Legacy permalink with param=`, legacyParams, ' to.query=', to.query)
                // if so, we transfer all old param (stored before vue-router's /#) and transfer them to the MapView
                // we will also transform legacy zoom level here (see comment below)
                const newQuery = { ...to.query }
                const legacyCoordinates = []
                Object.keys(legacyParams).forEach((param) => {
                    let value
                    let key = param
                    switch (param) {
                        // we need te re-evaluate LV95 zoom, as it was a zoom level tailor made for this projection
                        // (and not made to cover the whole globe)
                        case 'zoom':
                            value = translateSwisstopoPyramidZoomToMercatorZoom(legacyParams[param])
                            if (!value) {
                                // if the value is not defined in the old zoom system, we use the 'default' zoom level
                                // of 8 (which will roughly show the whole territory of Switzerland)
                                value = 8
                            }
                            key = 'z'
                            break

                        // storing coordinate parts for later conversion
                        case 'E':
                        case 'X':
                            legacyCoordinates[0] = Number(legacyParams[param])
                            break
                        case 'N':
                        case 'Y':
                            legacyCoordinates[1] = Number(legacyParams[param])
                            break

                        // taking all layers related param aside so that they can be processed later (see below)
                        // this only occurs if the syntax is recognized as a mf-geoadmin3 syntax (or legacy)
                        case 'layers':
                            if (isLayersUrlParamLegacy(legacyParams[param])) {
                                // for legacy layers param, we need to give the whole search query
                                // as it needs to look for layers, layers_visibility, layers_opacity and
                                // layers_timestamp param altogether
                                const layers = getLayersFromLegacyUrlParams(
                                    store.state.layers.config,
                                    window.location.search
                                )
                                value = layers
                                    .map((layer) => transformLayerIntoUrlString(layer))
                                    .join(';')
                                log('debug', 'Importing legacy layers as', value)
                            } else {
                                // if not legacy, we let it go as it is
                                value = legacyParams[param]
                            }
                            break
                        case 'layers_opacity':
                        case 'layers_visibility':
                        case 'layers_timestamp':
                        case 'adminid':
                            // we ignore those params as they are now obsolete
                            // see adr/2021_03_16_url_param_structure.md
                            break

                        // if no special work to do, we just copy past legacy params to the new viewer
                        default:
                            value = legacyParams[param]
                    }

                    // if a legacy coordinate (x,y or N,E) was used, we need to guess the SRS used (either LV95 or LV03)
                    // and covert it back to EPSG:4326 (Mercator)
                    if (
                        legacyCoordinates.length === 2 &&
                        legacyCoordinates[0] &&
                        legacyCoordinates[1]
                    ) {
                        const center = reprojectUnknownSrsCoordsToWebMercator(
                            legacyCoordinates[0],
                            legacyCoordinates[1]
                        )
                        newQuery['lon'] = round(center[0], 6)
                        newQuery['lat'] = round(center[1], 6)
                    }
                    if (value) {
                        newQuery[key] = value
                    }
                })

                // removing old query part (new ones will be added by vue-router after the /# part of the URL)
                const urlWithoutQueryParam = window.location.href.substr(
                    0,
                    window.location.href.indexOf('?')
                )
                window.history.replaceState({}, document.title, urlWithoutQueryParam)

                if ('adminid' in legacyParams) {
                    log('debug', 'Transforming legacy kml adminid...')
                    getKmlLayerFromLegacyAdminIdParam(legacyParams['adminid'])
                        .then((kmlLayer) => {
                            log('debug', 'Adding KML layer from legacy kml adminid')
                            if (newQuery.layers) {
                                newQuery.layers = `${newQuery.layers};${transformLayerIntoUrlString(
                                    kmlLayer
                                )}`
                            } else {
                                newQuery.layers = transformLayerIntoUrlString(kmlLayer)
                            }

                            next({
                                name: 'MapView',
                                query: newQuery,
                            })
                        })
                        .catch((error) => {
                            log('error', `Failed to retrieve KML from admin_id: ${error}`)
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
            } else {
                next()
            }
        } else {
            next()
        }
    })
}

export default legacyPermalinkManagementRouterPlugin
