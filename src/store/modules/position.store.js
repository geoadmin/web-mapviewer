import { DEFAULT_PROJECTION, LV95_RESOLUTIONS } from '@/config'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import allCoordinateSystems, {
    LV95,
    WEBMERCATOR,
    WGS84,
} from '@/utils/coordinates/coordinateSystems'
import log from '@/utils/logging'
import { round } from '@/utils/numberUtils'
import proj4 from 'proj4'

// for constants' values
// see https://en.wikipedia.org/wiki/Equator#Exact_length and https://en.wikipedia.org/wiki/World_Geodetic_System#A_new_World_Geodetic_System:_WGS_84
const WGS84_SEMI_MAJOR_AXIS_A = 6378137.0
const WGS84_EQUATOR_LENGTH_IN_METERS = 2 * Math.PI * WGS84_SEMI_MAJOR_AXIS_A
const PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES = WGS84_EQUATOR_LENGTH_IN_METERS / 256

/** @enum */
export const CrossHairs = {
    cross: 'cross',
    circle: 'circle',
    bowl: 'bowl',
    point: 'point',
    marker: 'marker',
}

/**
 * Normalizes any angle so that -PI < result <= PI
 *
 * @param {Number} rotation Angle in radians
 * @returns Normalized angle in radians in range -PI < result <= PI
 */
export function normalizeAngle(rotation) {
    while (rotation > Math.PI) {
        rotation -= 2 * Math.PI
    }
    while (rotation < -Math.PI || Math.abs(rotation + Math.PI) < 1e-9) {
        rotation += 2 * Math.PI
    }
    // Automatically fully northen the map if the user has set it approximately to the north.
    if (Math.abs(rotation) < 1e-2) {
        rotation = 0
    }
    return rotation
}

/**
 * Structure of the camera position
 *
 * @typedef CameraPosition
 * @property {Number} x X position of the camera in the 3D reference system (metric mercator)
 * @property {Number} y Y position of the camera in the 3D reference system (metric mercator)
 * @property {Number} z Z altitude of the camera in the 3D reference system (meters)
 * @property {Number} heading Degrees of camera rotation on the heading axis ("compass" axis)
 * @property {Number} pitch Degrees of camera rotation on the pitch axis ("nose up and down" axis)
 * @property {Number} roll Degrees of camera rotation on the roll axis ("barrel roll" axis, like if
 *   the camera was a plane)
 */

const state = {
    /**
     * The map zoom level, which define the resolution of the view
     *
     * @type Number
     */
    zoom: DEFAULT_PROJECTION.defaultZoom,
    /**
     * The map rotation expressed so that -Pi < rotation <= Pi
     *
     * @type Number
     */
    rotation: 0,

    /**
     * Center of the view expressed with the current projection
     *
     * @type Array<Number>
     */
    center: DEFAULT_PROJECTION.defaultCenter,

    /**
     * Projection used to express the position (and subsequently used to define how the mapping
     * framework will have to work under the hood)
     *
     * If LV95 is chosen, the map will use custom resolution to fit Swisstopo's Landeskarte specific
     * zooms (or scales) so that zoom levels will fit the different maps we have (1:500'000,
     * 1:100'000, etc...)
     *
     * @type {CoordinateSystem}
     */
    projection: DEFAULT_PROJECTION,

    /** @type CrossHairs */
    crossHair: null,

    /**
     * Position of the view when we are in 3D, always expressed in EPSG:3857 (only projection system
     * that works with Cesium)
     *
     * Will be set to null when the 3D map is not active
     *
     * @type {CameraPosition | null}
     */
    camera: null,
}

/**
 * @param mercatorZoomLevel
 * @param latitudeInRad
 * @returns {Number}
 */
const calculateWebMercatorResolution = (mercatorZoomLevel, latitudeInRad) => {
    // from https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
    // resolution = 156543.03 meters/pixel * cos(latitude) / (2 ^ zoomlevel)
    return round(
        Math.abs(
            (PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES * Math.cos(latitudeInRad)) /
                Math.pow(2, mercatorZoomLevel)
        ),
        2
    )
}

/**
 * @param resolution
 * @param latitudeInRad
 * @returns {Number}
 */
export const calculateWebMercatorZoom = (resolution, latitudeInRad) => {
    return (
        Math.log2(
            Math.abs(PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES * Math.cos(latitudeInRad))
        ) - Math.log2(resolution)
    )
}

const getters = {
    /**
     * The center of the map reprojected in EPSG:4326
     *
     * @param state
     * @returns {Number[]}
     */
    centerEpsg4326: (state) => {
        const centerEpsg4326Unrounded = proj4(state.projection.epsg, WGS84.epsg, state.center)
        return [
            // a precision of 6 digits means we can track position with 0.111m accuracy
            // see http://wiki.gis.com/wiki/index.php/Decimal_degrees
            round(centerEpsg4326Unrounded[0], WGS84.acceptableDecimalPoints),
            round(centerEpsg4326Unrounded[1], WGS84.acceptableDecimalPoints),
        ]
    },
    /**
     * The center of the map reprojected in EPSG:4326 expressed in radian
     *
     * @param _
     * @param getters
     * @returns {Number[]}
     */
    centerEpsg4326InRadian: (_, getters) => {
        const centerEpsg4326 = getters.centerEpsg4326
        return [(centerEpsg4326[0] * Math.PI) / 180.0, (centerEpsg4326[1] * Math.PI) / 180.0]
    },
    /**
     * Resolution of the view expressed in meter per pixel
     *
     * @type Number
     */
    resolution: (state, getters) => {
        if (state.projection.epsg === LV95.epsg) {
            // for LV95 we have custom-made resolution by zoom level, so no need to calculate it, just map it to the zoom
            return LV95_RESOLUTIONS[Math.floor(state.zoom)]
        }
        return calculateWebMercatorResolution(state.zoom, getters.centerEpsg4326InRadian[1])
    },

    /**
     * The extent of the view, expressed with two coordinates numbers (`[ bottomLeft, topRight ]`)
     *
     * @param state
     * @param getters
     * @param rootState
     * @returns {[[number, number], [number, number]]}
     */
    extent: (state, getters, rootState) => {
        const halfScreenInMeter = {
            width: (rootState.ui.width / 2) * getters.resolution,
            height: (rootState.ui.height / 2) * getters.resolution,
        }
        // calculating extent with resolution
        const bottomLeft = [
            round(
                state.center[0] - halfScreenInMeter.width,
                state.projection.acceptableDecimalPoints
            ),
            round(
                state.center[1] - halfScreenInMeter.height,
                state.projection.acceptableDecimalPoints
            ),
        ]
        const topRight = [
            round(
                state.center[0] + halfScreenInMeter.width,
                state.projection.acceptableDecimalPoints
            ),
            round(
                state.center[1] + halfScreenInMeter.height,
                state.projection.acceptableDecimalPoints
            ),
        ]
        return [bottomLeft, topRight]
    },
    /**
     * Flag telling if the current extent is contained into the LV95 bounds (meaning only things
     * from our LV 95 services are currently in display)
     *
     * @param state
     * @param getters
     * @returns {Boolean}
     */
    isExtentOnlyWithinLV95Bounds(state, getters) {
        let [currentExtentBottomLeft, currentExtentTopRight] = getters.extent
        const lv95boundsInCurrentProjection = LV95.getBoundsAs(state.projection)
        return (
            lv95boundsInCurrentProjection.isInBounds(currentExtentBottomLeft) &&
            lv95boundsInCurrentProjection.isInBounds(currentExtentTopRight)
        )
    },
}

const actions = {
    setZoom({ commit }, zoom) {
        if (typeof zoom !== 'number' || zoom < 0) {
            return
        }
        commit('setZoom', round(zoom, 3))
    },
    setRotation({ commit }, rotation) {
        if (typeof rotation !== 'number') {
            return
        }
        rotation = normalizeAngle(rotation)
        commit('setRotation', rotation)
    },
    setCenter: ({ commit }, center) => {
        if (
            !center ||
            (Array.isArray(center) && center.length !== 2) ||
            (!Array.isArray(center) && (!center.x || !center.y))
        ) {
            log.error('bad center received, ignoring', center)
            return
        }
        if (Array.isArray(center)) {
            commit('setCenter', {
                x: center[0],
                y: center[1],
            })
        } else {
            const { x, y } = center
            commit('setCenter', { x, y })
        }
    },
    zoomToExtent: ({ commit, getters, state, rootState }, extent) => {
        if (extent && Array.isArray(extent) && extent.length === 2) {
            // Convert extent points to WGS84 as adding the coordinates in EPSG:3857 gives incorrect results.
            const points = [
                proj4(state.projection.epsg, WGS84.epsg, extent[0]),
                proj4(state.projection.epsg, WGS84.epsg, extent[1]),
            ]
            // Calculate center of extent and convert position back to EPSG:3857.
            // Based on: https://github.com/Turfjs/turf/blob/v6.5.0/packages/turf-center/index.ts
            const centerOfExtent = proj4(WGS84.epsg, state.projection.epsg, [
                (points[0][0] + points[1][0]) / 2, // minX + maxX / 2
                (points[0][1] + points[1][1]) / 2, // minY + maxY / 2
            ])

            if (centerOfExtent && Array.isArray(centerOfExtent) && centerOfExtent.length === 2) {
                commit('setCenter', {
                    x: centerOfExtent[0],
                    y: centerOfExtent[1],
                })
            }
            const newResolution = (extent[1][0] - extent[0][0]) / rootState.ui.width
            // calculating new zoom level by reversing
            // resolution = 156543.03 meters/pixel * cos(latitude) / (2 ^ zoomlevel)
            const zoom = Math.abs(
                Math.log2(
                    newResolution /
                        PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES /
                        Math.cos(getters.centerEpsg4326InRadian[1])
                )
            )
            // for now, as there's no client zoom implemented, it's pointless to zoom further than 18
            // TODO: as soon as client zoom is implemented, remove this fixed value
            if (state.projection.epsg === LV95.epsg && zoom > 13) {
                commit('setZoom', 13)
            } else if (state.projection.epsg !== LV95.epsg && zoom > 18) {
                commit('setZoom', 18)
            } else {
                commit('setZoom', zoom)
            }
        }
    },
    increaseZoom: ({ dispatch, state }) => dispatch('setZoom', Number(state.zoom) + 1),
    decreaseZoom: ({ dispatch, state }) => dispatch('setZoom', Number(state.zoom) - 1),
    /** @param {CrossHairs | String | null} crossHair */
    setCrossHair: ({ commit }, crossHair) => {
        if (crossHair === null) {
            commit('setCrossHair', crossHair)
        } else if (crossHair in CrossHairs) {
            commit('setCrossHair', CrossHairs[crossHair])
        }
    },
    /**
     * @param commit
     * @param {CameraPosition} cameraPosition
     */
    setCameraPosition({ commit }, cameraPosition) {
        commit('setCameraPosition', cameraPosition)
    },
    setProjection({ commit }, projection) {
        let matchingProjection
        if (
            projection instanceof CoordinateSystem &&
            (projection.epsg === LV95.epsg || projection.epsg === WEBMERCATOR.epsg)
        ) {
            matchingProjection = projection
        } else if (typeof projection === 'number' || projection instanceof Number) {
            matchingProjection = allCoordinateSystems.find(
                (coordinateSystem) => coordinateSystem.epsgNumber === projection
            )
        }
        if (matchingProjection) {
            commit('setProjection', matchingProjection)
        } else {
            log.error('Unsupported projection', projection)
        }
    },
}

const mutations = {
    setZoom: (state, zoom) => (state.zoom = zoom),
    setRotation: (state, rotation) => (state.rotation = rotation),
    setCenter: (state, { x, y }) => (state.center = [x, y]),
    setCrossHair: (state, crossHair) => (state.crossHair = crossHair),
    setCameraPosition: (state, cameraPosition) => (state.camera = cameraPosition),
    setProjection: (state, projection) => (state.projection = projection),
}

export default {
    state,
    getters,
    actions,
    mutations,
}
