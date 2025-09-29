import type { FlatExtent, NormalizedExtent, SingleCoordinate } from '@swissgeo/coordinates'
import {
    allCoordinateSystems,
    CoordinateSystem,
    CustomCoordinateSystem,
    extentUtils,
    LV95,
    StandardCoordinateSystem,
    SwissCoordinateSystem,
    WGS84,
} from '@swissgeo/coordinates'
import type { Position } from 'geojson'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { isNumber, wrapDegrees } from '@swissgeo/numbers'
import { center, points } from '@turf/turf'
import { defineStore } from 'pinia'
import proj4 from 'proj4'

import type { ActionDispatcher } from '@/store/types'

import { DEFAULT_PROJECTION } from '@/config/map.config'
import useUIStore from '@/store/modules/ui.store'
import type { CoordinateFormat } from '@/utils/coordinates/coordinateFormat'
import { LV95Format } from '@/utils/coordinates/coordinateFormat'

/**
 * Normalizes any angle so that -PI < result <= PI
 *
 * @param rotation Angle in radians
 * @returns Normalized angle in radians in range -PI < result <= PI
 */
export function normalizeAngle(rotation: number): number {
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

export enum CrossHairs {
    cross = 'cross',
    circle = 'circle',
    bowl = 'bowl',
    point = 'point',
    marker = 'marker',
}

export interface CameraPosition {
    /** X position of the camera in the 3D reference system (metric mercator) */
    x: number
    /** Y position of the camera in the 3D reference system (metric mercator) */
    y: number
    /** Z altitude of the camera in the 3D reference system (meters) */
    z: number
    /** Degrees of camera rotation on the heading axis ("compass" axis) */
    heading: number
    /** Degrees of camera rotation on the pitch axis ("nose up and down" axis) */
    pitch: number
    /**
     * Degrees of camera rotation on the roll axis ("barrel roll" axis, like if the camera was a
     * plane)
     */
    roll: number
}

export interface PositionState {
    /** The display format selected for the mouse tracker */
    displayFormat: CoordinateFormat
    /** The map zoom level, which define the resolution of the view */
    zoom: number
    /** The map rotation expressed so that -Pi < rotation <= Pi */
    rotation: number
    /**
     * Flag which indicates if openlayers map rotates to align with true / magnetic north (only
     * possible if the device has orientation capabilities)
     */
    autoRotation: boolean
    /**
     * Flag which indicates if the device has orientation capabilities (e.g. can use map auto
     * rotate)
     */
    hasOrientation: boolean
    /** Center of the view expressed with the current projection */
    center: SingleCoordinate
    /**
     * Projection used to express the position (and subsequently used to define how the mapping
     * framework will have to work under the hood)
     *
     * If LV95 is chosen, the map will use custom resolution to fit Swisstopo's Landeskarte specific
     * zooms (or scales) so that zoom levels will fit the different maps we have (1:500'000,
     * 1:100'000, etc...)
     */
    projection: CoordinateSystem
    crossHair?: CrossHairs
    crossHairPosition?: number[]
    /**
     * Position of the view when we are in 3D, always expressed in EPSG:3857 (only projection system
     * that works with Cesium)
     *
     * Will be set to undefined when the 3D map is not active
     */
    camera?: CameraPosition
}

const usePositionStore = defineStore('position', {
    state: (): PositionState => ({
        displayFormat: LV95Format,
        // some unit tests fail because DEFAULT_PROJECTION is somehow not yet defined when they are run
        // hence the `?.` operator
        zoom: DEFAULT_PROJECTION?.getDefaultZoom(),
        rotation: 0,
        autoRotation: false,
        hasOrientation: false,
        // some unit tests fail because DEFAULT_PROJECTION is somehow not yet defined when they are run
        // hence the `?.` operator
        center: DEFAULT_PROJECTION?.bounds.center,
        projection: DEFAULT_PROJECTION,
        crossHair: undefined,
        crossHairPosition: undefined,
        camera: undefined,
    }),
    getters: {
        /** The center of the map reprojected in EPSG:4326 */
        centerEpsg4326(): SingleCoordinate {
            const centerEpsg4326Unrounded = proj4(this.projection.epsg, WGS84.epsg, this.center)
            return [
                WGS84.roundCoordinateValue(centerEpsg4326Unrounded[0]),
                WGS84.roundCoordinateValue(centerEpsg4326Unrounded[1]),
            ]
        },

        /** Resolution of the view expressed in meter per pixel */
        resolution(): number {
            return this.projection.getResolutionForZoomAndCenter(this.zoom, this.center)
        },

        /**
         * The extent of the view, expressed with two coordinates numbers (`[ bottomLeft, topRight
         * ]`)
         */
        extent(): NormalizedExtent {
            const uiStore = useUIStore()
            const halfScreenInMeter = {
                width: (uiStore.width / 2) * this.resolution,
                height: (uiStore.height / 2) * this.resolution,
            }
            // calculating extent with resolution
            const bottomLeft: SingleCoordinate = [
                this.projection.roundCoordinateValue(this.center[0] - halfScreenInMeter.width),
                this.projection.roundCoordinateValue(this.center[1] - halfScreenInMeter.height),
            ]
            const topRight: SingleCoordinate = [
                this.projection.roundCoordinateValue(this.center[0] + halfScreenInMeter.width),
                this.projection.roundCoordinateValue(this.center[1] + halfScreenInMeter.height),
            ]
            return [bottomLeft, topRight]
        },

        /**
         * Flag telling if the current extent is contained into the LV95 bounds (meaning only things
         * from our LV 95 services are currently in display)
         */
        isExtentOnlyWithinLV95Bounds(): boolean {
            const [currentExtentBottomLeft, currentExtentTopRight] = this.extent
            const lv95boundsInCurrentProjection = LV95.getBoundsAs(this.projection)
            return !!(
                lv95boundsInCurrentProjection?.isInBounds(
                    currentExtentBottomLeft[0],
                    currentExtentBottomLeft[1]
                ) &&
                lv95boundsInCurrentProjection?.isInBounds(
                    currentExtentTopRight[0],
                    currentExtentTopRight[1]
                )
            )
        },
    },
    actions: {
        setDisplayedFormat(displayedFormat: CoordinateFormat, dispatcher: ActionDispatcher) {
            this.displayFormat = displayedFormat
        },

        setZoom(zoom: number, dispatcher: ActionDispatcher) {
            if (!isNumber(zoom) || zoom < 0) {
                log.error({
                    title: 'Position store / setZoom',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: ['Invalid zoom level', zoom, dispatcher],
                })
                return
            }
            this.zoom = this.projection.roundZoomLevel(zoom)
        },

        increaseZoom(dispatcher: ActionDispatcher) {
            if (this.projection instanceof SwissCoordinateSystem) {
                // for Swiss coordinate system, there's an extra param to trigger normalization
                // (snapping to the closest rounded value)
                this.zoom = this.projection.roundZoomLevel(this.zoom, true) + 1
            }
            this.zoom = this.projection.roundZoomLevel(this.zoom) + 1
        },

        decreaseZoom(dispatcher: ActionDispatcher) {
            if (this.projection instanceof SwissCoordinateSystem) {
                // for Swiss coordinate system, there's an extra param to trigger normalization
                // (snapping to the closest rounded value)
                this.zoom = this.projection.roundZoomLevel(this.zoom, true) - 1
            }
            this.zoom = this.projection.roundZoomLevel(this.zoom) - 1
        },

        zoomToExtent(
            payload: {
                extent: FlatExtent | NormalizedExtent
                extentProjection?: CoordinateSystem
                maxZoom?: number
            },
            dispatcher: ActionDispatcher
        ) {
            const { extent, extentProjection, maxZoom } = payload

            // Convert extent points to WGS84 as TurfJS needs them in this format
            const normalizedWGS84Extent: NormalizedExtent = extentUtils.projExtent(
                extentProjection ?? this.projection,
                WGS84,
                extentUtils.normalizeExtent(extent)
            )
            if (
                normalizedWGS84Extent &&
                Array.isArray(normalizedWGS84Extent) &&
                normalizedWGS84Extent.length === 2
            ) {
                // Calculate the center of the extent and convert it back to the wanted projection
                const centerOfExtent: SingleCoordinate = proj4(
                    WGS84.epsg,
                    this.projection.epsg,
                    center(
                        points([
                            normalizedWGS84Extent[0] as Position,
                            normalizedWGS84Extent[1] as Position,
                        ])
                    ).geometry.coordinates
                ) as SingleCoordinate

                if (
                    centerOfExtent &&
                    Array.isArray(centerOfExtent) &&
                    centerOfExtent.length === 2
                ) {
                    this.center = centerOfExtent
                }
                const extentSize = {
                    width: normalizedWGS84Extent[1][0] - normalizedWGS84Extent[0][0],
                    height: normalizedWGS84Extent[1][1] - normalizedWGS84Extent[0][1],
                }

                const uiStore = useUIStore()
                let targetResolution
                // if the extent's height is greater than width, we base our resolution calculation on that
                if (extentSize.height > extentSize.width) {
                    targetResolution = extentSize.height / (uiStore.height - uiStore.headerHeight)
                } else {
                    targetResolution = extentSize.width / uiStore.width
                }

                const zoomForResolution = this.projection.getZoomForResolutionAndCenter(
                    targetResolution,
                    centerOfExtent
                )
                // if maxZoom is not set, we set it to the current projection value to
                // have a 1:25000 ratio.
                const computedMaxZoom = maxZoom ?? this.projection.get1_25000ZoomLevel()
                // Zoom levels are fixed value with LV95, the one calculated is the fixed zoom the closest to the floating
                // zoom level required to show the full extent on the map (scale to fill).
                // So the view will be too zoomed-in to have an overview of the extent.
                // We then set the zoom level to the one calculated minus one (expect when the calculated zoom is 0...).
                // We also cannot zoom further than the maxZoom specified if it is specified
                this.zoom = Math.min(Math.max(zoomForResolution - 1, 0), computedMaxZoom)
            }
        },

        setRotation(rotation: number, dispatcher: ActionDispatcher) {
            if (!isNumber(rotation)) {
                log.error({
                    title: 'Position store / setRotation',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: ['Invalid rotation', rotation, dispatcher],
                })
                return
            }
            this.rotation = normalizeAngle(rotation)
        },

        setAutoRotation(autoRotation: boolean, dispatcher: ActionDispatcher) {
            this.autoRotation = autoRotation
        },

        setHasOrientation(hasOrientation: boolean, dispatcher: ActionDispatcher) {
            this.hasOrientation = hasOrientation
        },

        setCenter(center: SingleCoordinate, dispatcher: ActionDispatcher) {
            if (!center || (Array.isArray(center) && center.length !== 2)) {
                log.error({
                    title: 'Position store / setCenter',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: ['Invalid center, ignoring', center, dispatcher],
                })
                return
            }
            if (!this.projection.isInBounds(center[0], center[1])) {
                this.center = center
            } else {
                log.warn({
                    title: 'Position store / setCenter',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: [
                        'Center received is out of projection bounds, ignoring',
                        this.projection,
                        this.center,
                        dispatcher,
                    ],
                })
            }
        },

        setCrossHair(
            payload: {
                crossHair?: CrossHairs
                crossHairPosition?: SingleCoordinate
            },
            dispatcher: ActionDispatcher
        ) {
            const { crossHair, crossHairPosition } = payload
            if (!crossHair) {
                this.crossHair = undefined
                this.crossHairPosition = undefined
            } else if (crossHair in CrossHairs) {
                this.crossHair = crossHair
                // if a position is defined as param we use it
                // if no position was given, we use the current center of the map as crosshair position
                this.crossHairPosition = crossHairPosition ?? this.center
            }
        },

        setCameraPosition(position: CameraPosition, dispatcher: ActionDispatcher) {
            // position can be null (in 2d mode), we do not wrap it in this case
            this.camera = position
                ? {
                      x: position.x,
                      y: position.y,
                      z: position.z,
                      // wrapping all angle-based values so that they do not exceed a full-circle value
                      roll: wrapDegrees(position.roll),
                      pitch: wrapDegrees(position.pitch),
                      heading: wrapDegrees(position.heading),
                  }
                : undefined
        },

        setProjection(
            projection: CoordinateSystem | number | string,
            dispatcher: ActionDispatcher
        ) {
            let matchingProjection: CoordinateSystem | undefined
            if (projection instanceof CoordinateSystem) {
                matchingProjection = projection
            } else if (typeof projection === 'number' || isNumber(projection)) {
                matchingProjection = allCoordinateSystems.find(
                    (coordinateSystem) => coordinateSystem.epsgNumber === projection
                )
            } else {
                matchingProjection = allCoordinateSystems.find(
                    (coordinateSystem) =>
                        coordinateSystem.epsg === projection ||
                        coordinateSystem.epsgNumber === parseInt(projection)
                )
            }
            if (matchingProjection) {
                if (matchingProjection.epsg === this.projection.epsg) {
                    log.debug({
                        title: 'Position store / setProjection',
                        titleStyle: {
                            backgroundColor: LogPreDefinedColor.Red,
                        },
                        messages: [
                            'Projection already set, ignoring',
                            this.projection,
                            matchingProjection,
                            dispatcher,
                        ],
                    })
                    return
                }
                const oldProjection: CoordinateSystem = this.projection
                // reprojecting the center of the map
                this.center = proj4(oldProjection.epsg, matchingProjection.epsg, this.center)
                // adapting the zoom level (if needed)
                if (
                    oldProjection instanceof StandardCoordinateSystem &&
                    matchingProjection instanceof CustomCoordinateSystem
                ) {
                    this.zoom = matchingProjection.transformStandardZoomLevelToCustom(this.zoom)
                } else if (
                    oldProjection instanceof CustomCoordinateSystem &&
                    matchingProjection instanceof StandardCoordinateSystem
                ) {
                    this.zoom = oldProjection.transformCustomZoomLevelToStandard(this.zoom)
                }
                if (
                    oldProjection instanceof CustomCoordinateSystem &&
                    matchingProjection instanceof CustomCoordinateSystem &&
                    oldProjection.epsg !== matchingProjection.epsg
                ) {
                    // we have to revert the old projection zoom level to standard, and then transform it to the new projection custom zoom level
                    this.zoom = oldProjection.transformCustomZoomLevelToStandard(
                        matchingProjection.transformStandardZoomLevelToCustom(this.zoom)
                    )
                }

                if (this.crossHairPosition) {
                    this.crossHairPosition = proj4(
                        oldProjection.epsg,
                        matchingProjection.epsg,
                        this.crossHairPosition
                    )
                }

                this.projection = matchingProjection
            } else {
                log.error({
                    title: 'Position store / setProjection',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: ['Unsupported projection', projection, dispatcher],
                })
            }
        },
    },
})

export default usePositionStore
