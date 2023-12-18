import proj4 from 'proj4'

import { DEFAULT_PROJECTION } from '@/config'
import CoordinateSystem from '@/utils/coordinates/CoordinateSystem.class'
import allCoordinateSystems, { LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import CustomCoordinateSystem from '@/utils/coordinates/CustomCoordinateSystem.class'
import StandardCoordinateSystem from '@/utils/coordinates/StandardCoordinateSystem.class'
import log from '@/utils/logging'

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
    // some unit tests fail because DEFAULT_PROJECTION is somehow not yet defined when they are run
    // hence the `?.` operator
    zoom: DEFAULT_PROJECTION?.getDefaultZoom(),

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
    // some unit tests fail because DEFAULT_PROJECTION is somehow not yet defined when they are run
    // hence the `?.` operator
    center: DEFAULT_PROJECTION?.bounds.center,

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
    /** @type Number[] */
    crossHairPosition: null,
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
            WGS84.roundCoordinateValue(centerEpsg4326Unrounded[0]),
            WGS84.roundCoordinateValue(centerEpsg4326Unrounded[1]),
        ]
    },
    /**
     * Resolution of the view expressed in meter per pixel
     *
     * @type Number
     */
    resolution: (state) => {
        return state.projection.getResolutionForZoomAndCenter(state.zoom, state.center)
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
            state.projection.roundCoordinateValue(state.center[0] - halfScreenInMeter.width),
            state.projection.roundCoordinateValue(state.center[1] - halfScreenInMeter.height),
        ]
        const topRight = [
            state.projection.roundCoordinateValue(state.center[0] + halfScreenInMeter.width),
            state.projection.roundCoordinateValue(state.center[1] + halfScreenInMeter.height),
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
    setZoom({ commit, state }, zoom) {
        if (typeof zoom !== 'number' || zoom < 0) {
            return
        }
        commit('setZoom', state.projection.roundZoomLevel(zoom))
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
    zoomToExtent: ({ commit, state, rootState }, extent) => {
        if (extent && Array.isArray(extent) && extent.length === 2) {
            // Convert extent points to WGS84 as adding the coordinates in metric gives incorrect results.
            const points = [
                proj4(state.projection.epsg, WGS84.epsg, extent[0]),
                proj4(state.projection.epsg, WGS84.epsg, extent[1]),
            ]
            // Calculate center of extent and convert position back to the wanted projection
            // Based on: https://github.com/Turfjs/turf/blob/v6.5.0/packages/turf-center/index.ts
            const centerOfExtent = proj4(WGS84.epsg, state.projection.epsg, [
                (points[0][0] + points[1][0]) / 2.0, // minX + maxX / 2
                (points[0][1] + points[1][1]) / 2.0, // minY + maxY / 2
            ])

            if (centerOfExtent && Array.isArray(centerOfExtent) && centerOfExtent.length === 2) {
                commit('setCenter', {
                    x: centerOfExtent[0],
                    y: centerOfExtent[1],
                })
            }
            // taking the biggest resolution calculated with either the width or height of the screen
            // so that it fits to the screen
            const newResolution = Math.max(
                (extent[1][0] - extent[0][0]) / rootState.ui.width,
                (extent[1][1] - extent[0][1]) / rootState.ui.height
            )
            commit(
                'setZoom',
                state.projection.getZoomForResolutionAndCenter(newResolution, centerOfExtent)
            )
        }
    },
    increaseZoom: ({ dispatch, state }) => dispatch('setZoom', Number(state.zoom) + 1),
    decreaseZoom: ({ dispatch, state }) => dispatch('setZoom', Number(state.zoom) - 1),
    /**
     * @param {CrossHairs | String | null} crossHair
     * @param {Number[] | null} crossHairPosition
     */
    setCrossHair: ({ commit, state }, { crossHair, crossHairPosition }) => {
        if (crossHair === null) {
            commit('setCrossHair', null)
            commit('setCrossHairPosition', null)
        } else if (crossHair in CrossHairs) {
            commit('setCrossHair', CrossHairs[crossHair])

            // if a position is defined as param we use it
            if (crossHairPosition) {
                commit('setCrossHairPosition', crossHairPosition)
            } else {
                // if no position was given, we use the current center of the map as crosshair position
                commit('setCrossHairPosition', state.center)
            }
        }
    },
    /**
     * @param commit
     * @param {CameraPosition} cameraPosition
     */
    setCameraPosition({ commit }, cameraPosition) {
        commit('setCameraPosition', cameraPosition)
    },
    setProjection({ commit, state }, projection) {
        let matchingProjection
        if (projection instanceof CoordinateSystem) {
            matchingProjection = projection
        } else if (typeof projection === 'number' || projection instanceof Number) {
            matchingProjection = allCoordinateSystems.find(
                (coordinateSystem) => coordinateSystem.epsgNumber === projection
            )
        } else if (typeof projection === 'string' || projection instanceof String) {
            matchingProjection = allCoordinateSystems.find(
                (coordinateSystem) =>
                    coordinateSystem.epsg === projection ||
                    coordinateSystem.epsgNumber === parseInt(projection)
            )
        }
        if (matchingProjection.epsg === state.projection.epsg) {
            log.debug(
                'Attempt at setting the same projection than the one already set in the store, ignoring'
            )
            return
        }
        if (matchingProjection) {
            const oldProjection = state.projection
            // reprojecting the center of the map
            const [x, y] = proj4(oldProjection.epsg, matchingProjection.epsg, state.center)
            commit('setCenter', { x, y })
            // adapting the zoom level (if needed)
            if (
                oldProjection instanceof StandardCoordinateSystem &&
                matchingProjection instanceof CustomCoordinateSystem
            ) {
                commit('setZoom', matchingProjection.transformStandardZoomLevelToCustom(state.zoom))
            }
            if (
                oldProjection instanceof CustomCoordinateSystem &&
                matchingProjection instanceof StandardCoordinateSystem
            ) {
                commit('setZoom', oldProjection.transformCustomZoomLevelToStandard(state.zoom))
            }
            if (
                oldProjection instanceof CustomCoordinateSystem &&
                matchingProjection instanceof CustomCoordinateSystem &&
                oldProjection.epsg !== matchingProjection.epsg
            ) {
                // we have to revert the old projection zoom level to standard, and then transform it to the new projection custom zoom level
                commit(
                    'setZoom',
                    oldProjection.transformCustomZoomLevelToStandard(
                        matchingProjection.transformStandardZoomLevelToCustom(state.zoom)
                    )
                )
            }

            if (state.crossHairPosition) {
                commit(
                    'setCrossHairPosition',
                    proj4(oldProjection.epsg, matchingProjection.epsg, state.crossHairPosition)
                )
            }

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
    setCrossHairPosition: (state, crossHairPosition) =>
        (state.crossHairPosition = crossHairPosition),
    setCameraPosition: (state, cameraPosition) => (state.camera = cameraPosition),
    setProjection: (state, projection) => (state.projection = projection),
}

export default {
    state,
    getters,
    actions,
    mutations,
}
