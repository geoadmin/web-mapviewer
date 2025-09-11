import { round } from '@swissgeo/numbers'
import { earthRadius } from '@turf/turf'
import proj4 from 'proj4'

import type { SingleCoordinate } from '@/coordinatesUtils'
import type { ResolutionStep } from '@/proj/types'

import CoordinateSystemBounds from '@/proj/CoordinateSystemBounds'

/**
 * These are the zoom levels, for each projection, which give us a 1:25'000 ratio map.
 *
 * These variables are declared here, as the config.js import the LV95 coordinate system, and it
 * could lead to initialization errors (even when initializing the constants before importing the
 * class). Thus we declare them here, at the root class of the coordinates systems.
 */
export const STANDARD_ZOOM_LEVEL_1_25000_MAP: number = 15.5
export const SWISS_ZOOM_LEVEL_1_25000_MAP: number = 8

/**
 * Resolution (pixel/meter) found at zoom level 0 while looking at the equator. This constant is
 * used to calculate the resolution taking latitude into account. With Mercator projection, the
 * deformation increases when latitude increases.
 *
 * Length of the Earth around its equator (in meters) / 256 pixels
 *
 * @see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
 * @see https://wiki.openstreetmap.org/wiki/Zoom_levels
 */
export const PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES: number =
    (2 * Math.PI * earthRadius) / 256

export interface CoordinateSystemProps {
    /**
     * EPSG:xxxx representation of this coordinate system, but only the numerical part (without the
     * "EPSG:")
     */
    epsgNumber: number
    /**
     * Label to show users when they are dealing with this coordinate system (can be a translation
     * key)
     */
    label: string
    /**
     * Name of this projection, if applicable, so that it can be tested against name in fields such
     * as COG metadata parsing.
     */
    technicalName?: string
    /**
     * A string describing how proj4 should handle projection/reprojection of this coordinate
     * system, in regard to WGS84. These matrices can be found on the EPSG website for each
     * projection in the Export section, inside the PROJ.4 export type (can be directly accessed by
     * adding .proj4 to the URL of one projection's page on the EPSG website, i.e.
     * https://epsg.io/3857.proj4 for WebMercator)
     */
    proj4transformationMatrix: string
    /**
     * Bounds of this projection system, expressed as in its own coordinate system. These boundaries
     * can also be found on the EPSG website, in the section "Projected bounds" of a projection's
     * page. It is possible to specify a custom center to these bounds, so that the application
     * starts at this custom center instead of the natural center (when no coordinates are specified
     * at startup).
     */
    bounds?: CoordinateSystemBounds
    /**
     * A boolean variable indicating whether the Mercator projection pyramid is used.
     *
     * The Mercator projection pyramid is a specific spatial reference system commonly used in
     * mapping and geographic information systems (GIS) applications.
     *
     * If set to `true`, it signifies that the system or dataset is leveraging this projection
     * methodology.
     *
     * If set to `false`, it indicates that the dataset uses an alternative projection or tiling
     * scheme.
     */
    usesMercatorPyramid: boolean
}

/**
 * Representation of a coordinate system (or also called projection system) in the context of this
 * application.
 *
 * These coordinate systems will be used to drive the mapping framework, helping it grasp which zoom
 * level or resolution to show, where to start the view (with the center of bounds), how to handle a
 * projection change, etc...
 *
 * @abstract
 */
export default abstract class CoordinateSystem {
    /**
     * EPSG:xxxx representation of this coordinate system, but only the numerical part (without the
     * "EPSG:")
     */
    public readonly epsgNumber: number
    /** EPSG:xxxx representation of this coordinate system */
    public readonly epsg: string
    /**
     * Label to show users when they are dealing with this coordinate system (can be a translation
     * key)
     */
    public readonly label: string
    /**
     * Name of this projection, if applicable, so that it can be tested against name in fields such
     * as COG metadata parsing.
     */
    public readonly technicalName?: string
    /**
     * A string describing how proj4 should handle projection/reprojection of this coordinate
     * system, in regard to WGS84. These matrices can be found on the EPSG website for each
     * projection in the Export section, inside the PROJ.4 export type (can be directly accessed by
     * adding .proj4 to the URL of one projection's page on the EPSG website, i.e.
     * https://epsg.io/3857.proj4 for WebMercator)
     */
    public readonly proj4transformationMatrix: string
    /**
     * Bounds of this projection system, expressed as in its own coordinate system. These boundaries
     * can also be found on the EPSG website, in the section "Projected bounds" of a projection's
     * page. It is possible to specify a custom center to these bounds, so that the application
     * starts at this custom center instead of the natural center (when no coordinates are specified
     * at startup).
     */
    public readonly bounds?: CoordinateSystemBounds
    /**
     * A boolean variable indicating whether the Mercator projection pyramid is used.
     *
     * The Mercator projection pyramid is a specific spatial reference system commonly used in
     * mapping and geographic information systems (GIS) applications.
     *
     * If set to `true`, it signifies that the system or dataset is leveraging this projection
     * methodology.
     *
     * If set to `false`, it indicates that the dataset uses an alternative projection or tiling
     * scheme.
     */
    public readonly usesMercatorPyramid: boolean

    constructor(args: CoordinateSystemProps) {
        const {
            epsgNumber,
            label,
            proj4transformationMatrix,
            bounds,
            technicalName,
            usesMercatorPyramid = false,
        } = args
        this.epsgNumber = epsgNumber
        /**
         * Full EPSG identifier used by most libraries (such as proj4, or OpenLayers)
         *
         * @type {`EPSG:${Number}`}
         */
        this.epsg = `EPSG:${epsgNumber}`
        this.label = label
        this.proj4transformationMatrix = proj4transformationMatrix
        this.bounds = bounds
        this.technicalName = technicalName
        this.usesMercatorPyramid = usesMercatorPyramid
    }

    /**
     * Transforms the bounds of this coordinates system to be expressed in the wanted coordinate
     * system
     *
     * If the coordinate system is invalid, or if bounds are not defined, it will return null
     *
     * @param {CoordinateSystem} coordinateSystem The target coordinate system we want bounds
     *   expressed in
     * @returns {CoordinateSystemBounds | undefined} Bounds, expressed in the coordinate system, or
     *   undefined if bounds are undefined or the coordinate system is invalid
     */
    getBoundsAs(coordinateSystem: CoordinateSystem): CoordinateSystemBounds | undefined {
        if (this.bounds) {
            if (coordinateSystem.epsg === this.epsg) {
                return this.bounds
            }
            const newBottomLeft = proj4(this.epsg, coordinateSystem.epsg, this.bounds.bottomLeft)
            const newTopRight = proj4(this.epsg, coordinateSystem.epsg, this.bounds.topRight)
            let customCenter: SingleCoordinate | undefined
            if (this.bounds.customCenter) {
                customCenter = proj4(this.epsg, coordinateSystem.epsg, this.bounds.customCenter)
            }
            return new CoordinateSystemBounds({
                lowerX: newBottomLeft[0],
                lowerY: newBottomLeft[1],
                upperX: newTopRight[0],
                upperY: newTopRight[1],
                customCenter,
            })
        }
        return
    }

    /**
     * Tells if a coordinate (described by X and Y) is in bound of this coordinate system.
     *
     * Will return false if no bounds are defined for this coordinate system
     */
    isInBounds(x: number, y: number): boolean {
        return !!this.bounds?.isInBounds(x, y)
    }

    /**
     * @abstract
     * @returns The Index in the resolution list where the 1:25000 zoom level is
     */
    abstract get1_25000ZoomLevel(): number

    /**
     * @abstract
     * @returns The default zoom to use when starting the map in this coordinate system (if none are
     *   set so far)
     */
    abstract getDefaultZoom(): number

    /**
     * Rounds a zoom level.
     *
     * You can, by overwriting this function, add custom zoom level roundings or similar function in
     * your custom coordinate systems.
     *
     * @param zoom A zoom level in this coordinate system
     * @returns The given zoom level after rounding
     */
    roundZoomLevel(zoom: number): number {
        return round(zoom, 3)
    }

    /**
     * Returns the corresponding resolution to the given zoom level and center (some coordinate
     * system must take some deformation into account the further north we are)
     *
     * @abstract
     * @param zoom A zoom level
     * @param center The current center of view, expressed with this coordinate system
     * @returns The resolution at the given zoom level, in the context of this coordinate system
     */
    abstract getResolutionForZoomAndCenter(zoom: number, center: SingleCoordinate): number

    /**
     * Returns the zoom level to match the given resolution and center (some coordinate system must
     * take some deformation into account the further north we are)
     *
     * @abstract
     * @param resolution The resolution of the map, expressed in meter per pixel
     * @param center The current center of view, expressed in this coordinate system
     * @returns The corresponding zoom level, in the context of this coordinate system
     */
    abstract getZoomForResolutionAndCenter(resolution: number, center: SingleCoordinate): number

    /**
     * Returns a rounded value of a coordinate value, in the context of this coordinate system. This
     * enables us to decide how many decimal points we want to keep for numbers after calculation
     * within this coordinate system (no need to keep values that are irrelevant to precision for
     * most maps, such as below 1cm)
     *
     * @abstract
     * @param {Number} value A value to be rounded
     * @returns {Number} The rounded value, with desired remaining decimal point for this coordinate
     *   system
     */
    abstract roundCoordinateValue(value: number): number

    /**
     * A (descending) list of all the available resolution steps for this coordinate system. If this
     * is not the behavior you want, you have to override this function.
     */
    getResolutionSteps(latitude?: number): ResolutionStep[] {
        if (!this.bounds) {
            return []
        }
        const zoom0PixelSizeInMeters = PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES
        const resolutions: ResolutionStep[] = []
        const latInRad = ((latitude ?? 0) * Math.PI) / 180.0
        for (let z = 0; z < 21; ++z) {
            resolutions.push({
                resolution: (zoom0PixelSizeInMeters * Math.cos(latInRad)) / Math.pow(2, z),
                zoom: z,
            })
        }
        return resolutions
    }

    /**
     * The origin to use as anchor for tile coordinate calculations. It will return the bound's
     * [lowerX, upperY] as default value (meaning the top-left corner of bounds). If this is not the
     * behavior you want, you have to override this function.
     *
     * If no bounds are defined, it will return [0, 0]
     */
    getTileOrigin(): SingleCoordinate {
        return this.bounds?.topLeft ?? [0, 0]
    }

    /**
     * List of matrix identifiers for this coordinate system. If this is not the behavior you want,
     * you have to override this function.
     */
    getMatrixIds(): number[] {
        const matrixIds = []
        for (let z = 0; z < this.getResolutionSteps().length; ++z) {
            matrixIds[z] = z
        }
        return matrixIds
    }
}
