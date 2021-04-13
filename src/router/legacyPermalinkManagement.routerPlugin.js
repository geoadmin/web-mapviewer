import proj4 from 'proj4'
import { round } from '@/utils/numberUtils'
import { translateSwisstopoPyramidZoomToMercatorZoom } from '@/utils/zoomLevelUtils'
import { isLayersUrlParamLegacy } from '@/utils/legacyLayerParamUtils'

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
 * - `http://localhost:8080/?geolocation=true&layers=some.layer.id` =>
 *   `http://localhost:8080/#/?geolocation=true&layers=some.layer.id`
 *
 * In this process, we have the opportunity to alter/edit some parameters that are not expressed the
 * same way in web-mapviewer than what they were in mf-geoadmin3, essentially enabling
 * retro-compatibility for link sharing (which is an important feature to have)
 *
 * Some special cases are :
 * - Zoom: as mf-geoadmin3 was using zoom level fitting the LV95 projection, we translate those zoom
 *   levels into world wide zoom levels. See {@link translateSwisstopoPyramidZoomToMercatorZoom}
 * - Easting/northing, E/N or x/y: webmapviewer is using EPSG:3857 as its engine projection and shows
 *   EPSG:4326 to the user, during the import of X and Y type coordinates we reproject them to
 *   EPSG:4326 and relabel them lat and lon accordingly
 *
 * @param {VueRouter} router
 */
const legacyPermalinkManagementRouterPlugin = (router) => {
    let isFirstRequest = true
    const legacyParams =
        window.location && window.location.search ? parseLegacyParams(window.location.search) : null

    router.beforeEach((to, from, next) => {
        if (isFirstRequest) {
            // before the first request, we check out if we need to manage any legacy params (from the old viewer)
            isFirstRequest = false
            if (legacyParams) {
                // if so, we transfer all old param (stored before vue-router's /#) and transfer them to the MapView
                // we will also transform legacy zoom level here (see comment below)
                const newQuery = { ...to.query }
                const legacyCoordinates = []
                const legacyLayersParam = {
                    layers: [],
                    opacity: [],
                    visibility: [],
                    timestamps: [],
                }
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
                            legacyCoordinates[0] = Number(legacyParams[param])
                            break
                        case 'N':
                            legacyCoordinates[1] = Number(legacyParams[param])
                            break

                        // TODO: add support for X/Y and easting/northing (and have a look if there were other ways mf-geoadmin3 was expressing coordinates)

                        // taking all layers related param aside so that they can be processed later (see below)
                        // this only occurs if the syntax is recognized as a mf-geoadmin3 syntax (or legacy)
                        case 'layers':
                            if (isLayersUrlParamLegacy(legacyParams[param])) {
                                legacyLayersParam.layers.push(...legacyParams[param].split(','))
                            } else {
                                // if not legacy, we let it go as it is
                                value = legacyParams[param]
                            }
                            break
                        case 'layers_opacity':
                            legacyLayersParam.opacity.push(...legacyParams[param].split(','))
                            break
                        case 'layers_visibility':
                            legacyLayersParam.visibility.push(...legacyParams[param].split(','))
                            break
                        case 'layers_timestamp':
                            legacyLayersParam.timestamps.push(...legacyParams[param].split(','))
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
                        const center = proj4('EPSG:2056', 'EPSG:4326', legacyCoordinates)
                        newQuery['lon'] = round(center[0], 6)
                        newQuery['lat'] = round(center[1], 6)
                    }
                    if (value) {
                        newQuery[key] = value
                    }
                })
                // transforming old layers param into new syntax
                if (legacyLayersParam.layers.length > 0) {
                    let newLayerParam = ''
                    legacyLayersParam.layers.forEach((layer, index) => {
                        if (index > 0) {
                            newLayerParam += ';'
                        }
                        // grabbing all parts of this layer (visibility, opacity, timestamps)
                        const visibility =
                            legacyLayersParam.visibility.length > index
                                ? legacyLayersParam.visibility[index]
                                : null
                        const opacity =
                            legacyLayersParam.opacity.length > index
                                ? legacyLayersParam.opacity[index]
                                : null
                        const timestamp =
                            legacyLayersParam.timestamps.length > index
                                ? legacyLayersParam.timestamps[index]
                                : null
                        // first the layer ID
                        newLayerParam += layer
                        // then if a timestamp is defined, a @time notation timestamp
                        if (timestamp !== null) {
                            newLayerParam += `@time=${timestamp}`
                        }
                        // if visibility was set in the legacy params, we transform it in the new format
                        if (visibility === 'false' || visibility === 'true') {
                            newLayerParam += `,${visibility === 'true' ? '' : 'f'}`
                        }
                        // if opacity is set in the legacy params, we add it
                        if (opacity !== null) {
                            // if visibility is not set (overwritten) we must still add the coma before adding the opacity
                            if (visibility === null) {
                                newLayerParam += ','
                            }
                            newLayerParam += `,${opacity}`
                        }
                    })
                    newQuery.layers = newLayerParam
                }
                // removing old query part (new ones will be added by vue-router after the /# part of the URL)
                const urlWithoutQueryParam = window.location.href.substr(
                    0,
                    window.location.href.indexOf('?')
                )
                window.history.replaceState({}, document.title, urlWithoutQueryParam)
                next({
                    name: 'MapView',
                    query: newQuery,
                })
            } else {
                next()
            }
        } else {
            next()
        }
    })
}

export default legacyPermalinkManagementRouterPlugin
