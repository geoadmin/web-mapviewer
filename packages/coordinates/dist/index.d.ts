import { proj4 as proj4_2 } from 'proj4';

/** Representation of many (available in this app) projection systems */
export declare const allCoordinateSystems: CoordinateSystem[];

declare interface ConfigCreatePixelExtentAround {
    /**
     * Number of pixels the extent should be (if s100 is given, a box of 100x100 pixels with the
     * coordinate at its center will be returned)
     */
    size: number;
    /** Where the center of the "size" pixel(s) extent should be. */
    coordinate: SingleCoordinate;
    /** Projection used to describe the coordinates */
    projection: CoordinateSystem;
    /** Current map resolution, necessary to calculate how much distance "size" pixel(s) means. */
    resolution: number;
    /** Tells if the extent's value should be rounded before being returned. Default is `false` */
    rounded?: boolean;
}

export declare const constants: GeoadminCoordinateConstants;

declare const coordinates: GeoadminCoordinates;
export default coordinates;

/**
 * Group of coordinates resulting in a "split by bounds" function. Will also contain information if
 * this chunk is within or outside the bounds from which it was cut from.
 */
export declare interface CoordinatesChunk {
    /** Coordinates of this chunk */
    coordinates: SingleCoordinate[];
    /** Will be true if this chunk contains coordinates that are located within bounds */
    isWithinBounds: boolean;
}

/**
 * Group of coordinates resulting in a "split by bounds" function. Will also contain information if
 * this chunk is within or outside the bounds from which it was cut from.
 */
declare interface CoordinatesChunk_2 {
    /** Coordinates of this chunk */
    coordinates: SingleCoordinate[];
    /** Will be true if this chunk contains coordinates that are located within bounds */
    isWithinBounds: boolean;
}

export declare const coordinatesUtils: GeoadminCoordinatesUtils;

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
export declare abstract class CoordinateSystem {
    /**
     * EPSG:xxxx representation of this coordinate system, but only the numerical part (without the
     * "EPSG:")
     */
    readonly epsgNumber: number;
    /** EPSG:xxxx representation of this coordinate system */
    readonly epsg: string;
    /**
     * Label to show users when they are dealing with this coordinate system (can be a translation
     * key)
     */
    readonly label: string;
    /**
     * Name of this projection, if applicable, so that it can be tested against name in fields such
     * as COG metadata parsing.
     */
    readonly technicalName?: string;
    /**
     * A string describing how proj4 should handle projection/reprojection of this coordinate
     * system, in regard to WGS84. These matrices can be found on the EPSG website for each
     * projection in the Export section, inside the PROJ.4 export type (can be directly accessed by
     * adding .proj4 to the URL of one projection's page on the EPSG website, i.e.
     * https://epsg.io/3857.proj4 for WebMercator)
     */
    readonly proj4transformationMatrix: string;
    /**
     * Bounds of this projection system, expressed as in its own coordinate system. These boundaries
     * can also be found on the EPSG website, in the section "Projected bounds" of a projection's
     * page. It is possible to specify a custom center to these bounds, so that the application
     * starts at this custom center instead of the natural center (when no coordinates are specified
     * at startup).
     */
    readonly bounds?: CoordinateSystemBounds;
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
    readonly usesMercatorPyramid: boolean;
    constructor(args: CoordinateSystemProps);
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
    getBoundsAs(coordinateSystem: CoordinateSystem): CoordinateSystemBounds | undefined;
    isInBounds(x: number, y: number): boolean;
    isInBounds(coordinate: SingleCoordinate): boolean;
    /**
     * @abstract
     * @returns The Index in the resolution list where the 1:25000 zoom level is
     */
    abstract get1_25000ZoomLevel(): number;
    /**
     * @abstract
     * @returns The default zoom to use when starting the map in this coordinate system (if none are
     *   set so far)
     */
    abstract getDefaultZoom(): number;
    /**
     * Rounds a zoom level.
     *
     * You can, by overwriting this function, add custom zoom level roundings or similar function in
     * your custom coordinate systems.
     *
     * @param zoom A zoom level in this coordinate system
     * @returns The given zoom level after rounding
     */
    roundZoomLevel(zoom: number): number;
    /**
     * Returns the corresponding resolution to the given zoom level and center (some coordinate
     * system must take some deformation into account the further north we are)
     *
     * @abstract
     * @param zoom A zoom level
     * @param center The current center of view, expressed with this coordinate system
     * @returns The resolution at the given zoom level, in the context of this coordinate system
     */
    abstract getResolutionForZoomAndCenter(zoom: number, center: SingleCoordinate): number;
    /**
     * Returns the zoom level to match the given resolution and center (some coordinate system must
     * take some deformation into account the further north we are)
     *
     * @abstract
     * @param resolution The resolution of the map, expressed in meter per pixel
     * @param center The current center of view, expressed in this coordinate system
     * @returns The corresponding zoom level, in the context of this coordinate system
     */
    abstract getZoomForResolutionAndCenter(resolution: number, center: SingleCoordinate): number;
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
    abstract roundCoordinateValue(value: number): number;
    /**
     * A (descending) list of all the available resolution steps for this coordinate system. If this
     * is not the behavior you want, you have to override this function.
     */
    getResolutionSteps(latitude?: number): ResolutionStep[];
    /**
     * The origin to use as anchor for tile coordinate calculations. It will return the bound's
     * [lowerX, upperY] as default value (meaning the top-left corner of bounds). If this is not the
     * behavior you want, you have to override this function.
     *
     * If no bounds are defined, it will return [0, 0]
     */
    getTileOrigin(): SingleCoordinate;
    /**
     * List of matrix identifiers for this coordinate system. If this is not the behavior you want,
     * you have to override this function.
     */
    getMatrixIds(): number[];
}

/**
 * Representation of boundaries of a coordinate system (also sometime called extent)
 *
 * It is expressed by the most bottom left points possible / top right point possible, meaning that
 * a combination of these two gives us the area in which the coordinate system can produce valid
 * coordinates
 */
export declare class CoordinateSystemBounds {
    readonly lowerX: number;
    readonly upperX: number;
    readonly lowerY: number;
    readonly upperY: number;
    readonly customCenter?: SingleCoordinate;
    readonly bottomLeft: SingleCoordinate;
    readonly bottomRight: SingleCoordinate;
    readonly topLeft: SingleCoordinate;
    readonly topRight: SingleCoordinate;
    readonly center: SingleCoordinate;
    /** A flattened version of the bounds such as [lowerX, lowerY, upperX, upperY] */
    readonly flatten: [number, number, number, number];
    /**
     * @param args.lowerX
     * @param args.upperX
     * @param args.lowerY
     * @param args.upperY
     * @param args.customCenter If this bounds must have a different center (if we want to offset
     *   the natural center of those bounds). If no custom center is given, the center will be
     *   calculated relative to the bounds.
     */
    constructor(args: CoordinateSystemBoundsProps);
    isInBounds(x: number, y: number): boolean;
    isInBounds(coordinate: SingleCoordinate): boolean;
    /**
     * Will split the coordinates in chunks if some portion of the coordinates are outside bounds
     * (one chunk for the portion inside, one for the portion outside, rinse and repeat if
     * necessary)
     *
     * Can be helpful when requesting information from our backends, but said backend doesn't
     * support world-wide coverage. Typical example is service-profile, if we give it coordinates
     * outside LV95 bounds it will fill what it doesn't know with coordinates following LV95 extent
     * instead of returning undefined
     *
     * @param {[Number, Number][]} coordinates Coordinates `[[x1,y1],[x2,y2],...]` expressed in the
     *   same coordinate system (projection) as the bounds
     * @returns {CoordinatesChunk[] | undefined}
     */
    splitIfOutOfBounds(coordinates: SingleCoordinate[]): CoordinatesChunk_2[] | undefined;
}

declare interface CoordinateSystemBoundsProps {
    lowerX: number;
    upperX: number;
    lowerY: number;
    upperY: number;
    customCenter?: SingleCoordinate;
}

declare interface CoordinateSystemProps {
    /**
     * EPSG:xxxx representation of this coordinate system, but only the numerical part (without the
     * "EPSG:")
     */
    epsgNumber: number;
    /**
     * Label to show users when they are dealing with this coordinate system (can be a translation
     * key)
     */
    label: string;
    /**
     * Name of this projection, if applicable, so that it can be tested against name in fields such
     * as COG metadata parsing.
     */
    technicalName?: string;
    /**
     * A string describing how proj4 should handle projection/reprojection of this coordinate
     * system, in regard to WGS84. These matrices can be found on the EPSG website for each
     * projection in the Export section, inside the PROJ.4 export type (can be directly accessed by
     * adding .proj4 to the URL of one projection's page on the EPSG website, i.e.
     * https://epsg.io/3857.proj4 for WebMercator)
     */
    proj4transformationMatrix: string;
    /**
     * Bounds of this projection system, expressed as in its own coordinate system. These boundaries
     * can also be found on the EPSG website, in the section "Projected bounds" of a projection's
     * page. It is possible to specify a custom center to these bounds, so that the application
     * starts at this custom center instead of the natural center (when no coordinates are specified
     * at startup).
     */
    bounds?: CoordinateSystemBounds;
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
    usesMercatorPyramid: boolean;
}

export declare function createPixelExtentAround(config: ConfigCreatePixelExtentAround): FlatExtent | undefined;

export declare const crs: GeoadminCoordinateCRS;

/**
 * Description of a coordinate system that will not use the standard resolution and zoom level
 * (a.k.a. mercator pyramid).
 *
 * This can be used to describe national coordinate systems that are built to represent a subset of
 * the World, with a custom zoom pyramid to match their map resolutions.
 *
 * You can see examples by following {@link SwissCoordinateSystem} and its children.
 *
 * @abstract
 * @see https://wiki.openstreetmap.org/wiki/Zoom_levels
 */
export declare abstract class CustomCoordinateSystem extends CoordinateSystem {
    readonly bounds: CoordinateSystemBounds;
    protected constructor(args: CustomCoordinateSystemProps);
    /**
     * The origin to use as anchor for tile coordinate calculations. It will return the bound's
     * [lowerX, upperY] as default value (meaning the top-left corner of bounds). If this is not the
     * behavior you want, you have to override this function.
     */
    getTileOrigin(): SingleCoordinate;
    /**
     * Transforms a zoom level from this custom coordinate system, back to a zoom level such as
     * described in https://wiki.openstreetmap.org/wiki/Zoom_levels
     *
     * @abstract
     * @param customZoomLevel A zoom level in this custom coordinate system
     * @returns A standard (or OpenStreetMap) zoom level
     */
    abstract transformCustomZoomLevelToStandard(customZoomLevel: number): number;
    /**
     * Transforms a standard (or OpenStreetMap) zoom level into a zoom level in this coordinate
     * system
     *
     * @param standardZoomLevel A standard zoom level
     * @returns A zoom level in this custom coordinate system
     */
    abstract transformStandardZoomLevelToCustom(standardZoomLevel: number): number;
}

declare interface CustomCoordinateSystemProps extends CoordinateSystemProps {
    /** With a custom coordinate system, bounds are mandatory. */
    bounds: CoordinateSystemBounds;
}

export declare const extentUtils: GeoadminExtentUtils;

export declare type FlatExtent = [number, number, number, number];

/**
 * Flatten extent
 *
 * @param extent Extent to flatten
 * @returns Flatten extent in from [minx, miny, maxx, maxy]
 */
export declare function flattenExtent(extent: FlatExtent | NormalizedExtent): FlatExtent;

declare interface GeoadminCoordinateConstants {
    STANDARD_ZOOM_LEVEL_1_25000_MAP: number;
    SWISS_ZOOM_LEVEL_1_25000_MAP: number;
    LV95_RESOLUTIONS: number[];
    SWISSTOPO_TILEGRID_RESOLUTIONS: number[];
}

export declare interface GeoadminCoordinateCRS {
    LV95: LV95CoordinateSystem;
    LV03: LV03CoordinateSystem;
    WGS84: WGS84CoordinateSystem;
    WEBMERCATOR: WebMercatorCoordinateSystem;
    allCoordinateSystems: CoordinateSystem[];
}

declare interface GeoadminCoordinates extends GeoadminCoordinateCRS {
    coordinatesUtils: GeoadminCoordinatesUtils;
    extentUtils: GeoadminExtentUtils;
    registerProj4: typeof registerProj4;
}

export declare interface GeoadminCoordinatesUtils {
    toRoundedString: typeof toRoundedString;
    wrapXCoordinates: typeof wrapXCoordinates;
    unwrapGeometryCoordinates: typeof unwrapGeometryCoordinates;
    removeZValues: typeof removeZValues;
    reprojectAndRound: typeof reprojectAndRound;
    parseCRS: typeof parseCRS;
}

export declare interface GeoadminExtentUtils {
    projExtent: typeof projExtent;
    normalizeExtent: typeof normalizeExtent;
    flattenExtent: typeof flattenExtent;
    getExtentIntersectionWithCurrentProjection: typeof getExtentIntersectionWithCurrentProjection;
    createPixelExtentAround: typeof createPixelExtentAround;
    getExtentCenter: typeof getExtentCenter;
}

export declare function getExtentCenter(extent: FlatExtent | NormalizedExtent): SingleCoordinate;

/**
 * Get the intersection of the extent with the current projection, as a flatten extent expressed in
 * the current projection
 *
 * @param extent Such as [minx, miny, maxx, maxy]. or [bottomLeft, topRight]
 * @param extentProjection
 * @param currentProjection
 */
export declare function getExtentIntersectionWithCurrentProjection(extent: FlatExtent | NormalizedExtent, extentProjection: CoordinateSystem, currentProjection: CoordinateSystem): FlatExtent | undefined;

export declare const LV03: LV03CoordinateSystem;

declare class LV03CoordinateSystem extends SwissCoordinateSystem {
    constructor();
}

export declare const LV95: LV95CoordinateSystem;

declare class LV95CoordinateSystem extends SwissCoordinateSystem {
    constructor();
}

export declare type NormalizedExtent = [[number, number], [number, number]];

/**
 * Return an extent normalized to [[x, y], [x, y]] from a flat extent
 *
 * @param extent Extent to normalize
 * @returns Extent in the form [[x, y], [x, y]]
 */
export declare function normalizeExtent(extent: FlatExtent | NormalizedExtent): NormalizedExtent;

declare function parseCRS(crs?: string): CoordinateSystem | undefined;

/**
 * @param fromProj Current projection used to describe the extent
 * @param toProj Target projection we want the extent be expressed in
 * @param extent An extent, described as `[minx, miny, maxx, maxy].` or `[[minx, miny], [maxx,
 *   maxy]]`
 * @returns The reprojected extent
 */
export declare function projExtent<T extends FlatExtent | NormalizedExtent>(fromProj: CoordinateSystem, toProj: CoordinateSystem, extent: T): T;

/**
 * Proj4 comes with [EPSG:4326]{@link https://epsg.io/4326} as default projection.
 *
 * By default, this adds the two Swiss projections ([LV95/EPSG:2056]{@link https://epsg.io/2056} and
 * [LV03/EPSG:21781]{@link https://epsg.io/21781}) and metric Web Mercator
 * ([EPSG:3857]{@link https://epsg.io/3857}) definitions to proj4
 *
 * Further projection can be added by settings the param projections (do not forget to include LV95,
 * LV03 and/or WebMercator if you intended to use them too)
 */
export declare const registerProj4: (proj4: proj4_2, projections?: CoordinateSystem[]) => void;

/**
 * Remove any Z value from a set of coordinates
 *
 * @param coordinates
 */
declare function removeZValues(coordinates: SingleCoordinate[] | Single3DCoordinate[]): SingleCoordinate[];

declare function reprojectAndRound<T extends SingleCoordinate | SingleCoordinate[]>(from: CoordinateSystem, into: CoordinateSystem, coordinates: T): T;

/** Representation of a resolution step in a coordinate system. Can be linked to a zoom level or not. */
export declare interface ResolutionStep {
    /** Resolution of this step, in meters/pixel */
    resolution: number;
    /** Corresponding zoom level for this resolution step */
    zoom?: number;
    /** Name of the map product shown at this resolution/zoom */
    label?: string;
}

export declare type Single3DCoordinate = [number, number, number];

export declare type SingleCoordinate = [number, number];

/**
 * Coordinate system with a zoom level/resolution calculation based on the size of the Earth at the
 * equator.
 *
 * These will be used to represent WebMercator and WGS84 among others.
 *
 * @abstract
 * @see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
 * @see https://wiki.openstreetmap.org/wiki/Zoom_levels
 */
export declare abstract class StandardCoordinateSystem extends CoordinateSystem {
    /** The index in the resolution list where the 1:25000 zoom level is */
    get1_25000ZoomLevel(): number;
    getDefaultZoom(): number;
}

/**
 * This specialization will be used to represent LV95 and LV03, that use a custom zoom/resolution
 * pyramid to match all our printable products (in contrast to {@link StandardCoordinateSystem} which
 * bases its zoom/resolution on the radius of the Earth at the equator and latitude positioning of
 * the map).
 *
 * @abstract
 * @see https://api3.geo.admin.ch/services/sdiservices.html#wmts
 * @see https://wiki.openstreetmap.org/wiki/Zoom_levels
 */
export declare class SwissCoordinateSystem extends CustomCoordinateSystem {
    getResolutionSteps(): ResolutionStep[];
    get1_25000ZoomLevel(): number;
    getDefaultZoom(): number;
    transformStandardZoomLevelToCustom(standardZoomLevel: number): number;
    /**
     * Mapping between Swiss map zooms and standard zooms. Heavily inspired by
     * {@link https://github.com/geoadmin/mf-geoadmin3/blob/ce885985e4af5e3e20c87321e67a650388af3602/src/components/map/MapUtilsService.js#L603-L631 MapUtilsService.js on mf-geoadmin3}
     *
     * @param customZoomLevel A zoom level as desribed in
     *   {@link http://api3.geo.admin.ch/services/sdiservices.html#wmts our backend's doc}
     * @returns A web-mercator zoom level (as described on
     *   {@link https://wiki.openstreetmap.org/wiki/Zoom_levels | OpenStreetMap's wiki}) or the zoom
     *   level to show the 1:25'000 map if the input is invalid
     */
    transformCustomZoomLevelToStandard(customZoomLevel: number): number;
    getResolutionForZoomAndCenter(zoom: number): number;
    getZoomForResolutionAndCenter(resolution: number): number;
    roundCoordinateValue(value: number): number;
    /**
     * Rounding to the zoom level
     *
     * @param customZoomLevel A zoom level, that could be a floating number
     * @param normalize Normalize the zoom level to the closest swisstopo zoom level, by default it
     *   only round the zoom level to 3 decimal
     * @returns A zoom level matching one of our national maps
     */
    roundZoomLevel(customZoomLevel: number, normalize?: boolean): number;
}

/**
 * Returns rounded coordinate with thousands separator and comma.
 *
 * @param coordinate The raw coordinate as array.
 * @param digits Decimal digits to round to.
 * @param [withThousandsSeparator=true] If thousands should be separated with a single quote
 *   character. Default is `true`
 * @param [enforceDigit=false] If set to true, we want to have that many figures after the period.
 *   Otherwise, we don't care. Default is `false`
 * @returns Formatted coordinate.
 * @see https://stackoverflow.com/a/2901298/4840446
 */
declare function toRoundedString(coordinate: SingleCoordinate, digits: number, withThousandsSeparator?: boolean, enforceDigit?: boolean): string | undefined;

/**
 * Returns the coordinates unwrapped if they were placed into an extra array. This can happen when
 * dealing with GeoJSON coordinate, where some geometry types require coordinate in a format such as
 * [ [ [x,y], [x,y] ], [...feature2...] ]
 *
 * Most of our backends only deal with the first feature of such array, this function will unwrap
 * it, or return the array as is if it is not required
 */
declare function unwrapGeometryCoordinates(geometryCoordinates?: SingleCoordinate[] | SingleCoordinate[][] | SingleCoordinate[][][]): SingleCoordinate[];

export declare const WEBMERCATOR: WebMercatorCoordinateSystem;

declare class WebMercatorCoordinateSystem extends StandardCoordinateSystem {
    constructor();
    roundCoordinateValue(value: number): number;
    /**
     * Formula comes from
     * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
     *
     *          resolution = 156543.03 meters / pixel * cos(latitude) / (2 ^ zoom level)
     */
    getResolutionForZoomAndCenter(zoom: number, center: SingleCoordinate): number;
    /**
     * Calculating zoom level by reversing formula from
     * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale :
     *
     *          resolution = 156543.03 * cos(latitude) / (2 ^ zoom level)
     *
     * So that
     *
     *          zoom level = log2( resolution / 156543.03 / cos(latitude) )
     *
     * @param resolution Resolution in meter/pixel
     * @param center As the use an equatorial constant to calculate the zoom level, we need to know
     *   the latitude of the position the resolution must be calculated at, as we need to take into
     *   account the deformation of the WebMercator projection (that is greater the further north we
     *   are)
     */
    getZoomForResolutionAndCenter(resolution: number, center: SingleCoordinate): number;
}

export declare const WGS84: WGS84CoordinateSystem;

declare class WGS84CoordinateSystem extends StandardCoordinateSystem {
    constructor();
    roundCoordinateValue(value: number): number;
    /**
     * Formula comes from
     * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
     *
     *          resolution = 156543.03 meters / pixel * cos(latitude) / (2 ^ zoom level)
     */
    getResolutionForZoomAndCenter(zoom: number, center: SingleCoordinate): number;
    /**
     * Ensures an extent is in X,Y order (longitude, latitude). If coordinates are in Y,X order
     * (latitude, longitude), swaps them. WGS84 traditionally uses latitude-first (Y,X) axis order
     * [minY, minX, maxY, maxX] Some WGS84 implementations may use X,Y order therefore we need to
     * check and swap if needed.
     *
     * TODO: This method works for the common coordinates in and around switzerland but will not
     * work for the whole world. Therefore a better solution should be implemented if we want to
     * support coordinates and extents of the whole world.
     *
     * @param extent - Input extent [minX, minY, maxX, maxY] or [minY, minX, maxY, maxX]
     * @returns Extent guaranteed to be in [minX, minY, maxX, maxY] order
     * @link Problem description https://docs.geotools.org/latest/userguide/library/referencing/order.html
     */
    getExtentInOrderXY(extent: [number, number, number, number]): [number, number, number, number];
    /**
     * Calculating zoom level by reversing formula from
     * https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale :
     *
     *          resolution = 156543.03 * cos(latitude) / (2 ^ zoom level)
     *
     * So that
     *
     *          zoom level = log2( resolution / 156543.03 / cos(latitude) )
     *
     * @param resolution Resolution in meter/pixel
     * @param center As the use an equatorial constant to calculate the zoom level, we need to know
     *   the latitude of the position the resolution must be calculated at, as we need to take into
     *   account the deformation of the WebMercator projection (that is greater the further north we
     *   are)
     */
    getZoomForResolutionAndCenter(resolution: number, center: SingleCoordinate): number;
}

/**
 * Wraps the provided coordinates in the world extents (i.e. the coordinate range that if equivalent
 * to the wgs84 [-180, 180])
 *
 * @param coordinates The coordinates (or array of coordinates) to wrap
 * @param projection Projection of the coordinates
 * @returns Coordinates wrapped on the X axis
 */
declare function wrapXCoordinates<T extends SingleCoordinate | SingleCoordinate[]>(coordinates: T, projection: CoordinateSystem): T;

export { }
