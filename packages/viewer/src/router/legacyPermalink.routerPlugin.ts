import type { CoordinateSystem, SingleCoordinate } from '@swissgeo/coordinates'
import type { GeoAdminLayer } from '@swissgeo/layers'

import { LV03, LV95, WEBMERCATOR, WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import proj4 from 'proj4'
import { type LocationQueryRaw, type RouteLocationRaw, START_LOCATION } from 'vue-router'

import type { RouterPlugin } from '@/router/types'
import type { CameraPosition } from '@/store/modules/position/types/position'

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
import useAppStore from '@/store/modules/app'
import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'
import { FeatureInfoPositions } from '@/store/modules/ui'
import {
    getKmlLayerFromLegacyAdminIdParam,
    getLayersFromLegacyUrlParams,
    handleLegacyFeaturePreSelectionParam,
    isLegacyParams,
} from '@/utils/legacyLayerParamUtils'

function toNumber(input: string | number): number {
    return typeof input === 'number' ? input : parseFloat(input)
}

async function handleLegacyKmlAdminIdParam(
    legacyParams: URLSearchParams,
    newQuery: LocationQueryRaw
): Promise<void> {
    log.debug({
        title: 'Legacy URL',
        titleColor: LogPreDefinedColor.Amber,
        messages: ['Transforming legacy kml adminId, get KML ID from adminId...'],
    })
    const adminId = legacyParams.get('adminId')
    if (adminId) {
        const kmlLayer = await getKmlLayerFromLegacyAdminIdParam(adminId)
        log.debug({
            title: 'Legacy URL',
            titleColor: LogPreDefinedColor.Amber,
            messages: ['Adding KML layer from legacy kml adminId'],
        })
        if (newQuery.layers && typeof newQuery.layers === 'string') {
            newQuery.layers = `${newQuery.layers};KML|${kmlLayer.id}@adminId=${kmlLayer.adminId}`
        } else {
            newQuery.layers = `KML|${kmlLayer.id}@adminId=${kmlLayer.adminId}`
        }

        // remove the legacy param from the newQuery
        delete newQuery.adminId
    }
}

export function handleLegacyParam(
    params: URLSearchParams,
    legacyParamName: string,
    legacyParamValue: string | number,
    newQuery: LocationQueryRaw,
    latLongCoordinates: SingleCoordinate,
    legacyCoordinates: SingleCoordinate,
    cameraPosition: CameraPosition,
    storeInputs: StoreInputForLegacyParsing
): void {
    const { projection, config } = storeInputs
    let newValue: string | number | undefined
    let key: string = legacyParamName
    switch (legacyParamName) {
        case 'zoom':
            // the legacy viewer always expresses its zoom level in the LV95 context (so in SwissCoordinateSystem)
            if (projection.usesMercatorPyramid) {
                newValue = LV95.transformCustomZoomLevelToStandard(toNumber(legacyParamValue))
            } else {
                newValue = legacyParamValue
            }
            key = 'z'
            break

        // storing coordinate parts for later conversion (LV03 or LV95)
        // legacy coordinates have to be saved in an array in order (y,x) for
        // conversion to be correct using proj4.
        case 'N':
        case 'X':
            legacyCoordinates[1] = toNumber(legacyParamValue)
            break
        case 'E':
        case 'Y':
            legacyCoordinates[0] = toNumber(legacyParamValue)
            break

        case 'lon':
            latLongCoordinates[0] = toNumber(legacyParamValue)
            cameraPosition.x = toNumber(legacyParamValue)
            break
        case 'lat':
            latLongCoordinates[1] = toNumber(legacyParamValue)
            cameraPosition.y = toNumber(legacyParamValue)
            break

        case 'layers':
            // if the "legacy" value already contains our new separators, it means the app was accessed
            // without using the hash slash approach, but we still shouldn't be parsing as legacy
            if (
                ['@feature', '@year', ';'].some(
                    (newSeparator) => `${legacyParamValue}`.indexOf(newSeparator) !== -1
                )
            ) {
                newValue = legacyParamValue
                break
            }
            // for legacy layers param, we need to give the layers visibility, opacity and timestamps,
            // as they are combined into one value with the layer in the current 'layers' parameter
            // implementation
            newValue = getLayersFromLegacyUrlParams(
                config,
                `${legacyParamValue}`,
                params.get('layers_visibility') ?? undefined,
                params.get('layers_opacity') ?? undefined,
                params.get('layers_timestamp') ?? undefined
            )
                .map((layer) =>
                    transformLayerIntoUrlString(
                        layer,
                        config.find((configLayer) => configLayer.id === layer.id)
                    )
                )
                .join(';')
            log.debug({
                title: 'Legacy URL',
                titleColor: LogPreDefinedColor.Amber,
                messages: ['Importing legacy layers as', newValue],
            })

            break
        // Setting the position of the compare slider
        case 'swipe_ratio':
            newValue = legacyParamValue
            key = 'compareRatio'
            break
        case 'time':
            key = 'timeSlider'
            newValue = legacyParamValue
            break
        case 'layers_opacity':
        case 'layers_visibility':
        case 'layers_timestamp':
            // Those are combined with the layers case. We simply ensure here that
            // they're not called multiple times for nothing
            break

        case 'elevation':
            cameraPosition.z = toNumber(legacyParamValue)
            break

        case 'pitch':
            cameraPosition.pitch = toNumber(legacyParamValue)
            break

        case 'heading':
            cameraPosition.heading = toNumber(legacyParamValue)
            break
        case 'showTooltip':
            key = 'featureInfo'
            newValue =
                legacyParamValue === 'true'
                    ? FeatureInfoPositions.Default
                    : FeatureInfoPositions.None
            break
        case 'bgLayer':
            newValue = legacyParamValue === 'voidLayer' ? 'void' : legacyParamValue
            break
        // if no special work to do, we just copy past legacy params to the new viewer
        default:
            // NOTE: legacyValue is parsed using URLSearchParams which don't make any difference
            // between &foo and &foo=
            newValue = legacyParamValue
            break
    }

    if (newValue !== undefined) {
        // When receiving a query, the application will encode the URI components
        // We decode those so that the new query won't encode encoded character
        // for example, we avoid having " " becoming %2520 in the URI
        // But we don't decode the value if it's a layer, as it's already encoded in transformLayerIntoUrlString function
        newQuery[key] = legacyParamName === 'layers' ? newValue : decodeURIComponent(`${newValue}`)
        log.info({
            title: 'Legacy URL',
            titleColor: LogPreDefinedColor.Amber,
            messages: [
                `${legacyParamName}=${legacyParamValue} parameter changed to ${key}=${newValue}`,
                newQuery,
            ],
        })
    } else {
        log.error({
            title: 'Legacy URL',
            titleColor: LogPreDefinedColor.Amber,
            messages: [`${legacyParamName}=${legacyParamValue} parameter not processed`],
        })
    }
}

export interface StoreInputForLegacyParsing {
    config: GeoAdminLayer[]
    projection: CoordinateSystem
}

async function handleLegacyParams(
    legacyParams: URLSearchParams,
    originView: string,
    storeInputs: StoreInputForLegacyParsing
): Promise<RouteLocationRaw> {
    // if so, we transfer all old param (stored before vue-router's /#) and transfer them to the MapView
    // we will also transform legacy zoom level here (see comment below)
    const newQuery: LocationQueryRaw = {}
    const { projection } = storeInputs
    const legacyCoordinates: SingleCoordinate = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]
    const latLongCoordinates: SingleCoordinate = [
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
    ]
    let newCoordinates = []
    const cameraPosition: CameraPosition = {
        x: Number.NEGATIVE_INFINITY,
        y: Number.NEGATIVE_INFINITY,
        z: Number.NEGATIVE_INFINITY,
        // if no pitch is set, we look down to the ground instead of letting no value (0, looking at the horizon) go through
        pitch: -90,
        heading: 0,
        roll: 0,
    }

    legacyParams.forEach((param_value, param_key) => {
        handleLegacyParam(
            legacyParams,
            param_key,
            param_value,
            newQuery,
            latLongCoordinates,
            legacyCoordinates,
            cameraPosition,
            storeInputs
        )
    })
    if (
        cameraPosition.x !== Number.NEGATIVE_INFINITY &&
        cameraPosition.y !== Number.NEGATIVE_INFINITY
    ) {
        const { x, y, z, pitch, heading, roll } = cameraPosition
        newQuery['camera'] = [x, y, z, pitch, heading, roll]
            .map((value) => (value === 0 ? '' : `${value}`))
            .join(',')
        newQuery['3d'] = 'true'
        newQuery['sr'] = WEBMERCATOR.epsgNumber
    }

    // Convert legacy coordinates if needed (only if the 3D camera isn't set too)
    if (
        !latLongCoordinates.some((value) => value === Number.NEGATIVE_INFINITY) &&
        !newQuery['camera']
    ) {
        newCoordinates = proj4(WGS84.epsg, projection.epsg, latLongCoordinates)
        newQuery['center'] = newCoordinates.join(',')
        log.info({
            title: 'Legacy URL',
            titleColor: LogPreDefinedColor.Amber,
            messages: [
                `lat/lon=${JSON.stringify(latLongCoordinates)} parameter changed to center=${newQuery['center']}`,
            ],
        })
    } else if (
        !legacyCoordinates.some((value) => value === Number.NEGATIVE_INFINITY) &&
        !newQuery['camera']
    ) {
        // The legacy viewer supports coordinate in LV03 and LV95 in X/Y and E/N parameter
        newCoordinates = legacyCoordinates
        if (LV95.isInBounds(legacyCoordinates) && projection.epsg !== LV95.epsg) {
            // if the current projection is not LV95, we also need to re-project x/y or N/E
            newCoordinates = proj4(LV95.epsg, projection.epsg, legacyCoordinates)
            log.info({
                title: 'Legacy URL',
                titleColor: LogPreDefinedColor.Amber,
                messages: [
                    `converting LV95 X/Y|E/N=${JSON.stringify(legacyCoordinates)} to ${projection.epsg} => ${JSON.stringify(newCoordinates)}`,
                ],
            })
        } else if (LV03.isInBounds(legacyCoordinates) && projection.epsg !== LV03.epsg) {
            // if the current projection is not LV03, we also need to re-project x/y or N/E
            newCoordinates = await reframe({
                inputCoordinates: legacyCoordinates,
                inputProjection: LV03,
                outputProjection: projection,
            })
            log.info({
                title: 'Legacy URL',
                titleColor: LogPreDefinedColor.Amber,
                messages: [
                    `converting LV03 X/Y|E/N=${JSON.stringify(legacyCoordinates)} to ${projection.epsg} => ${JSON.stringify(newCoordinates)}`,
                ],
            })
        }
        newQuery['center'] = newCoordinates.join(',')
        log.info({
            title: 'Legacy URL',
            titleColor: LogPreDefinedColor.Amber,
            messages: [
                `X/Y|E/N=${JSON.stringify(legacyCoordinates)} parameter changed to center=${newQuery['center']}`,
            ],
        })
    }

    handleLegacyFeaturePreSelectionParam(legacyParams, newQuery)

    // removing old query part (new ones will be added by vue-router after the /# part of the URL)
    const urlWithoutQueryParam = window.location.href.substring(
        0,
        window.location.href.indexOf('?')
    )
    window.history.replaceState(window.history.state, document.title, urlWithoutQueryParam)
    if (legacyParams.get('adminId')) {
        // adminId legacy param cannot be handle above in the loop because it needs to add a layer
        // to the layers param, thats why we do handle after.
        try {
            await handleLegacyKmlAdminIdParam(legacyParams, newQuery)
        } catch (error) {
            log.error({
                title: 'Legacy URL',
                titleColor: LogPreDefinedColor.Amber,
                messages: [`Failed to retrieve KML from admin_id`, error],
            })
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
 */
export const legacyPermalinkManagementRouterPlugin: RouterPlugin = (router): void => {
    // We need to take the legacy params from the window.location.search, because the Vue Router
    // to.query only parse the query after the /#? and legacy params are at the root /?
    const legacyParams: URLSearchParams | undefined = isLegacyParams(window?.location?.search)
        ? new URLSearchParams(window?.location?.search)
        : undefined
    if (legacyParams) {
        // NOTE: the legacy embed view was at /embed.html. Unfortunately we cannot in this application
        // reroute to another path before the #, because the vue router using the createWebHashHistory
        // can only handle route after the hash. Therefore we have an external redirect service
        // that will redirect to /embed.html to ?legacyEmbed. We use this pseudo legacyEmbed to
        // redirect to #/embed once the other legacy parameters have been translated.
        const legacyEmbed = legacyParams.has('legacyEmbed')
        log.debug({
            title: 'Legacy URL',
            titleColor: LogPreDefinedColor.Amber,
            messages: [
                `starts legacy url param plugin params=${legacyParams.toString()}, legacyEmbed=${legacyEmbed}`,
                legacyParams,
            ],
        })
        let unSubscribeStoreAction: () => void | undefined
        const unsubscribeRouter = router.beforeEach((to, from) => {
            const appStore = useAppStore()
            const layersStore = useLayersStore()
            const positionStore = usePositionStore()

            log.debug({
                title: 'Legacy URL',
                titleColor: LogPreDefinedColor.Amber,
                messages: [
                    `entry into the legacy router with parameters 'form' and 'to': `,
                    from,
                    to,
                ],
            })

            if (
                typeof to.name === 'string' &&
                MAP_VIEWS.includes(to.name) &&
                from === START_LOCATION
            ) {
                // Redirect to the LegacyParamsView until the app is ready and that the legacy
                // params have been parsed and converted. This is needed in order to postpone the
                // storeSync until the legacy params have been converted.
                log.info({
                    title: 'Legacy URL',
                    titleColor: LogPreDefinedColor.Amber,
                    messages: [
                        `redirect to LegacyParamsView params=${legacyParams.toString()}`,
                        legacyParams,
                    ],
                })

                unSubscribeStoreAction = appStore.$onAction(({ name }) => {
                    // Wait until the app is ready before dealing with legacy params. To handle
                    // legacy params some data are required (e.g. the layer config)
                    if (name === 'setAppIsReady') {
                        log.debug({
                            title: 'Legacy URL',
                            titleColor: LogPreDefinedColor.Amber,
                            messages: [
                                `app is ready, handle legacy params=${legacyParams.toString()}`,
                                legacyParams,
                            ],
                        })
                        handleLegacyParams(legacyParams, legacyEmbed ? EMBED_VIEW : MAP_VIEW, {
                            config: layersStore.config,
                            projection: positionStore.projection,
                        })
                            .then((newRoute) => {
                                log.info({
                                    title: 'Legacy URL',
                                    titleColor: LogPreDefinedColor.Amber,
                                    messages: [`redirect to the converted params`, newRoute],
                                })
                                router.replace(newRoute).catch((error) => {
                                    log.error({
                                        title: 'Legacy URL',
                                        titleColor: LogPreDefinedColor.Amber,
                                        messages: [
                                            `failed to redirect to the converted params`,
                                            error,
                                        ],
                                    })
                                })
                            })
                            .catch((error) => {
                                log.error({
                                    title: 'Legacy URL',
                                    titleColor: LogPreDefinedColor.Amber,
                                    messages: [`failed to convert legacy params`, error],
                                })
                            })
                    }
                })
                log.debug({
                    title: 'Legacy URL',
                    titleColor: LogPreDefinedColor.Amber,
                    messages: [`redirect between embed legacy view or standard legacy view`],
                })
                return {
                    name: legacyEmbed ? LEGACY_EMBED_PARAM_VIEW : LEGACY_PARAM_VIEW,
                    replace: true,
                }
            }

            if (
                typeof to.name === 'string' &&
                typeof from.name === 'string' &&
                MAP_VIEWS.includes(to.name) &&
                LEGACY_VIEWS.includes(from.name)
            ) {
                log.info({
                    title: 'Legacy URL',
                    titleColor: LogPreDefinedColor.Amber,
                    messages: ['Work is done, unsuscribing from the mutations'],
                })
                unsubscribeRouter()
                if (unSubscribeStoreAction) {
                    unSubscribeStoreAction()
                }
            }
            log.debug({
                title: 'Legacy URL',
                titleColor: LogPreDefinedColor.Amber,
                messages: ['exiting the Legacy URL router.'],
            })
            return true
        })
    }
}

export default legacyPermalinkManagementRouterPlugin
