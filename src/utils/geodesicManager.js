import { CoordinateSystems } from '@/utils/coordinateUtils'
import { LineString, Polygon, MultiLineString, Point, MultiPolygon } from 'ol/geom'
import { Circle, Fill, Stroke, Style, Text, RegularShape } from 'ol/style'
import { Geodesic, PolygonArea, Math as geographicMath } from 'geographiclib-geodesic'
import proj4 from 'proj4'
import {
    createOrUpdateFromFlatCoordinates /* Warning: private method of openlayers */,
    buffer as bufferExtent,
    returnOrUpdate /* Warning: private method of openlayers */,
    boundingExtent,
} from 'ol/extent'
import RBush from 'ol/structs/RBush' /* Warning: private class of openlayers */
import { formatAngle, formatMeters } from '@/modules/drawing/lib/drawingUtils'

const WEBMERCATOR = CoordinateSystems.WEBMERCATOR.epsg
const WGS84 = CoordinateSystems.WGS84.epsg
const geod = Geodesic.WGS84
const DEG360_IN_WEBMERCATOR = CoordinateSystems.WEBMERCATOR.deg360

/**
 * Class responsible for:
 *
 * - Generating the geodesic geometries of a given Polygon or LineString. The generated geometries are
 *   of type "MultiPolygon" / "MultiLineString", so that the 180deg datetime limit is correctly
 *   handled by openlayers.
 * - Generating the measure styles that the measure feature uses to display intermediate distances,
 *   the total distance, the azimuth circle, and, in case of a polygon, the total area.
 *
 * Terminology used: Segment: Array of two coordinates describing a segment of the drawn line
 * Subsegment: This class will break the above mentioned segments up in subsegments to approximate a
 * geodesic line.
 *
 * Won't fix: When drawing across the dateline and zooming near at the dateline, the drawn line may
 * disappear. This is because we cut the linestrings only ca. at 180deg and not exactly at 180deg.
 * Drawn polygons across the dateline do not always appear correct (depends on the complexity of the
 * shape) and a fine white split is visible at the dateline. All these bugs are probably "won't fix"
 * as the behavior is good enough for a viewer not focused on the pacific ocean.
 *
 * The properties are all private. Only the getter functions should be used to access informration
 * from outside.
 *
 * @property {MultiLineString} geodesicGeom Represents the drawn LineString or the border of the
 *   drawn Polygon
 * @property {MultiLineString} azimuthCircle Represents the azimuth circle of the drawn lineString
 *   (only generated if the lineString has exactly two coordinates)
 * @property {MultiLineString} geodesicPolygonGeom Represents the filling of the feature
 * @property {Feature} feature The feature this object is based on
 * @property {number} featureRevision The feature revision this object is based on. All getter
 *   functions will trigger an update before returning a value if the revision number is not up to
 *   date anymore.
 * @property {Geometry} geom The feature's geometry transformed in wgs84 coordinates
 * @property {[number]} coords The coordinates of "geom"
 * @property {boolean} isDrawing True is feature is being drawn with the draw interaction
 * @property {boolean} isPolygon True if the user closed the linestring
 * @property {boolean} hasAzimuthCircle True if azimuth circle can be drawn
 * @property {boolean} stylesReady True if the measure styles are available
 * @property {Extent} extent The extent of the feature
 * @property {number} totalLength The total length of the drawn line
 * @property {number | undefined} totalArea The total area of the drawn polygon
 * @property {number | undefined} rotation Azimuth of the line, if the drawn line consists only of a
 *   single segment.
 * @property {number} resolution Max length im meters between two points
 * @property {AutoSplitArray} geodesicCoords Saves the geodesic coordinates in the different formats
 *   that are useful for further transformations.
 * @property {MeasureStyles} measurePoints Saves the measure points and generates the corresponding
 *   styles
 * @property {[RBush]} subsegmentRTrees For each line segment, saves the corresponding subsegments
 * @property {Style} azimuthCircleStyle Style for the azimuth circle
 */
export class GeodesicGeometries {
    constructor(feature) {
        this.feature = feature
        this.featureRevision = feature.getRevision()
        if (
            !(this.feature.getGeometry() instanceof Polygon) &&
            !(this.feature.getGeometry() instanceof LineString)
        ) {
            throw new Error(
                'This class only accepts Polygons (and Linestrings ' +
                    'after initial drawing is finished)'
            )
        }
        this._calculateEverything()
    }

    _calculateEverything() {
        this.geom = this.feature.getGeometry().clone().transform(WEBMERCATOR, WGS84)
        this.coords = this.geom.getCoordinates()
        this.isDrawing = this.feature.get('isDrawing')
        this.isPolygon = false
        if (this.geom instanceof Polygon) {
            this.coords = this.geom.getCoordinates()[0]
            if (this.isDrawing) {
                this.coords = this.coords.slice(0, -1)
            } else {
                this.isPolygon = true
            }
        }
        this.hasAzimuthCircle =
            !this.isPolygon &&
            (this.coords.length === 2 ||
                (this.coords.length === 3 &&
                    this.coords[1][0] === this.coords[2][0] &&
                    this.coords[1][1] === this.coords[2][1]))
        this.stylesReady = !(
            this.coords.length < 2 ||
            (this.coords.length === 2 &&
                this.coords[0][0] === this.coords[1][0] &&
                this.coords[0][1] === this.coords[1][1])
        )
        /* The order of these calculations is important, as some methods require information
        calculated by previous methods. */
        this._calculateGlobalProperties()
        this._calculateResolution()
        this._calculateGeodesicCoords()
        this._calculateAzimuthCircle()

        // Overwrites public method getExtent of the feature to include the whole geodesic geometry.
        this.extent = createOrUpdateFromFlatCoordinates(
            this.geodesicGeom.flatCoordinates,
            0,
            this.geodesicGeom.flatCoordinates.length,
            this.geodesicGeom.stride,
            this.extent
        )
        this.extent = bufferExtent(this.extent, 0.0001, this.extent) //account for imprecisions in the calculation
        this.feature.getGeometry().getExtent = (extent) => {
            this._update()
            return returnOrUpdate(this.extent, extent)
        }
    }

    /* The following "_calculate*" methods are helper methods of "_calculateEverything" */
    _calculateGlobalProperties() {
        const geodesicPolygon = new PolygonArea.PolygonArea(geod, !this.isPolygon)
        for (const coord of this.coords) {
            geodesicPolygon.AddPoint(coord[1], coord[0])
        }
        const res = geodesicPolygon.Compute(false, true)
        this.totalLength = res.perimeter
        this.totalArea = res.area
        if (this.hasAzimuthCircle) {
            const geodesicLine = geod.InverseLine(
                this.coords[0][1],
                this.coords[0][0],
                this.coords[1][1],
                this.coords[1][0]
            )
            this.rotation = geodesicLine.azi1 < 0 ? geodesicLine.azi1 + 360 : geodesicLine.azi1
        }
    }

    _calculateResolution() {
        /*
        Warning: the following numbers were only graphically measured, not calculated. So there is
        no guarantee to mathematical accuracy whatsover.

        Here is the maximal measured difference between webmercator linear lines and wgs84
        geodesic lines at 47° (switzerland) and 70° (north of Norway). (At the equator, there
        is no difference):
         Km  47°    70°
         1   2,1cm  5,5cm
         10  2,1m   5,5m
         100 210m   550m

        "this.resolution" indicates the maximal distance between two points in meters. We select it
        so that each feature has less than 1000 points.

        So for the resolution scheme selected here, this is the relation between line length and
        maximal discrepancy from a perfect geodesic line at 47°:
        Line length                Max discrepancy at 47°
        line < 1000km              2.1cm
        1000km <= line < 10000km   2.1m
        line >= 10000km            210m
        */
        const resolution = Math.pow(10, Math.trunc(this.totalLength / 1000).toString(10).length)
        this.resolution = Math.max(1000, resolution)
    }

    _calculateGeodesicCoords() {
        let currentDistance = 0
        const measurePoints = new MeasureStyles(this.resolution)
        const geodesicCoords = new AutoSplitArray()
        const segments = []
        for (let i = 0; i < this.coords.length - 1; i++) {
            const from = coordNormalize(this.coords[i])
            const to = coordNormalize(this.coords[i + 1])
            segments[i] = []
            const segment = segments[i]
            geodesicCoords.autoPush(from, true)
            const geodesicLine = geod.InverseLine(from[1], from[0], to[1], to[0])
            let length = geodesicLine.s13
            let distToPoint = 0
            while ((currentDistance % this.resolution) + length >= this.resolution) {
                const partialLength = this.resolution - (currentDistance % this.resolution)
                distToPoint += partialLength
                const positionCalcRes = geodesicLine.Position(distToPoint)
                const pos = [positionCalcRes.lon2, positionCalcRes.lat2]
                currentDistance += partialLength
                length -= partialLength
                if (geodesicLine.s13 >= 1000) geodesicCoords.autoPush(pos)
                measurePoints.push(pos, currentDistance)
            }
            currentDistance += length
        }
        if (this.coords.length) {
            geodesicCoords.autoPush(coordNormalize(this.coords[this.coords.length - 1]))
        }

        const subsegmentRTrees = []
        for (let i = 0; i < geodesicCoords.subsegments.length; i++) {
            subsegmentRTrees[i] = new RBush()
            subsegmentRTrees[i].load(
                geodesicCoords.subsegmentExtents[i],
                geodesicCoords.subsegments[i]
            )
        }

        this.geodesicCoords = geodesicCoords
        this.geodesicGeom = geodesicCoords.generateGeom()
        this.geodesicPolygonGeom = geodesicCoords.generatePolygonGeom(this)
        this.measurePoints = measurePoints
        this.subsegmentRTrees = subsegmentRTrees
    }

    _calculateAzimuthCircle() {
        if (this.hasAzimuthCircle) {
            const nbPoints = 1000
            const arcLength = 360 / nbPoints
            const circleCoords = new AutoSplitArray()
            for (let i = 0; i <= nbPoints; i++) {
                const res = geod.Direct(
                    this.coords[0][1],
                    this.coords[0][0],
                    //Adding "this.rotation" to be sure that the line meets the circle perfectly
                    arcLength * i + this.rotation,
                    this.totalLength
                )
                circleCoords.autoPush({ lon: res.lon2, lat: res.lat2 })
            }
            this.azimuthCircle = circleCoords.generateGeom()
            this.azimuthCircleStyle = new Style({
                stroke: redStroke,
                geometry: this.azimuthCircle,
                zIndex: 0,
            })
        }
    }

    _update() {
        if (this.feature.getRevision() !== this.featureRevision) {
            this.featureRevision = this.feature.getRevision()
            this._calculateEverything()
        }
    }

    /** @returns {MultiLineString} Represents the drawn LineString or the border of the drawn Polygon */
    getGeodesicGeom() {
        this._update()
        return this.geodesicGeom
    }

    /** @returns {MultiLineString} Represents the filling of the feature */
    getGeodesicPolygonGeom() {
        this._update()
        return this.geodesicPolygonGeom
    }

    /**
     * Get the extent of the specified segment. The segmentIndex must be valid!
     *
     * @param {number} segmentIndex
     * @returns {Extent}
     */
    getSegmentExtent(segmentIndex) {
        this._update()
        let extent = this.subsegmentRTrees[segmentIndex].getExtent()
        return bufferExtent(extent, 0.0001, extent)
    }

    /**
     * Get all subsegments that are inside the specified extent. The segmentIndex must be valid!
     *
     * @param {number} segmentIndex
     * @param {Extent} extent
     * @returns {[[number]]}
     */
    getSubsegments(segmentIndex, extent) {
        this._update()
        return this.subsegmentRTrees[segmentIndex].getInExtent(extent)
    }

    /**
     * Get an array of styles for the measure feature
     *
     * @param {number} resolution The resolution of the map in equatorial meters / pixel
     * @returns {[Style]}
     */
    getMeasureStyles(resolution) {
        this._update()
        if (!this.stylesReady) {
            return []
        }
        //Measure points
        const styles = this.measurePoints.getStyles(resolution)
        //Azimuth circle
        if (this.hasAzimuthCircle) styles.push(this.azimuthCircleStyle)
        //Total length tooltip
        let lengthText = formatMeters(this.totalLength)
        if (this.hasAzimuthCircle) {
            lengthText = formatAngle(this.rotation) + ' / ' + lengthText
        }
        styles.push(
            new Style({
                image: tooltipArrow,
                text: getTooltipTextBox(lengthText),
                geometry: new Point(coordNormalize(this.coords[this.coords.length - 1])).transform(
                    WGS84,
                    WEBMERCATOR
                ),
                zIndex: 40,
            })
        )
        //Total area tooltip
        if (this.isPolygon && this.geodesicPolygonGeom) {
            const uArea = Math.abs(this.totalArea)
            const areaText = formatMeters(uArea, { dim: 2 })
            styles.push(
                new Style({
                    image: tooltipArrow,
                    text: getTooltipTextBox(areaText),
                    geometry: new Point(
                        this.geodesicPolygonGeom.getPolygon(0).getInteriorPoint().getCoordinates()
                    ),
                    zIndex: 40,
                })
            )
        }
        return styles
    }
}

function coordNormalize(coord) {
    if (Array.isArray(coord)) {
        coord = { lon: coord[0], lat: coord[1] }
    }
    return [geographicMath.AngNormalize(coord.lon), coord.lat]
}

const generateExtentStyle = (extent) =>
    new Style({
        geometry: new LineString([
            [extent[0], extent[1]],
            [extent[0], extent[3]],
            [extent[2], extent[3]],
            [extent[2], extent[1]],
            [extent[0], extent[1]],
        ]),
        stroke: new Stroke({
            color: '#000000',
            width: 3,
        }),
    })

export function segmentExtent(feature, segmentIndex) {
    if (feature.geodesic) {
        return feature.geodesic.getSegmentExtent(segmentIndex)
    }
}

export function subsegments(feature, segmentIndex, viewExtent) {
    if (feature.geodesic) {
        return feature.geodesic.getSubsegments(segmentIndex, viewExtent)
    }
}

const redStroke = new Stroke({
    width: 3,
    color: [255, 0, 0],
})

const circleStyle = new Circle({
    radius: 4,
    fill: new Fill({
        color: [255, 0, 0, 1],
    }),
})

const tooltipArrow = new RegularShape({
    points: 4,
    radius: 10,
    fill: new Fill({
        color: [255, 0, 0, 0.9],
    }),
    displacement: [0, 10],
})

const getTooltipTextBox = (text) =>
    new Text({
        text: text,
        font: 'normal 12px Helvetica',
        fill: new Fill({
            color: '#ffffff',
        }),
        backgroundFill: new Fill({
            color: [255, 0, 0, 0.9],
        }),
        // This background stroke is used to round the corners of the tooltip box
        backgroundStroke: new Stroke({
            color: [255, 0, 0, 0.9],
            width: 7,
            lineCap: 'round',
            lineJoin: 'round',
        }),
        /* These padding values in the format [top, right, bottom, left] should approximately
        center the text in the tooltip box */
        padding: [2, 2.5, -1, 4],
        scale: 1,
        offsetY: -18,
    })

/**
 * Class that receives a list of coordinates with distances and generates a list of styles to
 * display these points on the line.
 */
class MeasureStyles {
    constructor(resolution) {
        this.resolution = resolution
        this.top10Styles = []
        this.top100Styles = []
        this.styles = []
    }

    /**
     * Push a new point
     *
     * @param {any} pos Coordinate of the point in the format [lon, lat]
     * @param {any} dist Distance of that point from the beginning
     */
    push(pos, dist) {
        const style = this._createMeasureStyle(pos, dist)
        this.styles.push(style)
        if (this.styles.length % 10 === 0) {
            this.top100Styles.push(style)
        }
        if (this.styles.length % 100 === 0) {
            this.top10Styles.push(style)
        }
    }

    _createMeasureStyle(point, dist) {
        return new Style({
            image: circleStyle,
            text: new Text({
                text: dist >= 1000 ? dist / 1000 + ' km' : dist + ' m',
                font: 'normal 12px Helvetica',
                fill: new Fill({
                    color: '#ffffff',
                }),
                stroke: new Stroke({
                    color: '#000000',
                    width: 3,
                }),
                scale: 1,
                offsetY: -15,
            }),
            geometry: new Point(point).transform(WGS84, WEBMERCATOR),
            zIndex: 21,
        })
    }

    /**
     * Get the styles
     *
     * @param {number} resolution The resolution of the map in equatorial meters / pixel
     * @returns {[Style]} An array of styles with more or less points depending on the zoom level
     */
    getStyles(resolution) {
        // Minimal distance in meters between each measure point (real meters / measure point)
        const distRepeat = resolution * 60 // i.e. minimal distance of 60 equatorial pixels
        const ratio = distRepeat / this.resolution
        return ratio <= 1
            ? this.styles
            : ratio <= 10
            ? this.top100Styles
            : ratio <= 100
            ? this.top10Styles
            : []
    }
}

/**
 * Saves the given coordinates in different formats:
 *
 * - As a MultiLineString (geodesicGeom)
 * - As a MultiPolygon (geodesicPolygonGeom)
 * - As a list of subsegments
 */
class AutoSplitArray {
    constructor() {
        this.lastCoord = null

        this.lineStrNr = 0
        this.lineStrings = [[]]

        this.subsegments = [[]]
        this.subsegmentExtents = [[]]
        this.segmentNr = -1

        this.polygons = {}
        this.worldNr = 0
    }

    /**
     * Pushes a new Point
     *
     * @param {[number] | Object} point The point to push
     * @param {[[number]]} newSegment True if this vertex is the binding vertex of two segments
     */
    autoPush(point, newSegment) {
        if (newSegment) {
            this.segmentNr++
        }
        if (Array.isArray(point)) {
            point = { lon: point[0], lat: point[1] }
        }
        if (this.lastCoord && 180 - Math.abs(this.lastCoord.lon) < 40) {
            if (point.lon < 0 && this.lastCoord.lon > 0) {
                this._push(point, 1)
                this.lineStrings[++this.lineStrNr] = []
            } else if (point.lon > 0 && this.lastCoord.lon < 0) {
                this._push(point, -1)
                this.lineStrings[++this.lineStrNr] = []
            }
        }
        this._push(point)
        this.lastCoord = point
    }
    _push(point, offset = 0) {
        const coord = [point.lon + offset * 360, point.lat]
        const polygonId = 'polygon_' + this.worldNr
        this.worldNr += offset
        //Push to lineString (border of the shape)
        this.lineStrings[this.lineStrNr].push(coord)
        //Push to polygons (To color the area of the shape)
        if (this.polygons[polygonId] == null) {
            this.polygons[polygonId] = []
        }
        this.polygons[polygonId].push(coord)
        /* Push to subsegments (Used to calculate distances form mouse cursor to shape and to
        calculate the extent of each segment and subsegment) */
        if (this.segmentNr >= 0 && this.lineStrings[this.lineStrNr].length > 1) {
            const lastCoord = [this.lastCoord.lon, this.lastCoord.lat]
            let subsegment = [
                proj4(WGS84, WEBMERCATOR, lastCoord),
                proj4(WGS84, WEBMERCATOR, coord),
            ]
            subsegment[1][0] += offset * DEG360_IN_WEBMERCATOR
            const subsegmentExtent = boundingExtent(subsegment)
            if (!this.subsegments[this.segmentNr]) {
                if (this.segmentNr > 0) {
                    this.subsegments[this.segmentNr - 1].push(subsegment)
                    this.subsegmentExtents[this.segmentNr - 1].push(subsegmentExtent)
                }
                this.subsegments[this.segmentNr] = []
                this.subsegmentExtents[this.segmentNr] = []
            } else {
                this.subsegments[this.segmentNr].push(subsegment)
                this.subsegmentExtents[this.segmentNr].push(subsegmentExtent)
            }
        }
    }
    generateGeom() {
        if (this.lineStrings[this.lineStrNr].length <= 1) {
            this.lineStrings.pop()
        }
        return new MultiLineString(this.lineStrings).transform(WGS84, WEBMERCATOR)
    }
    /**
     * @param {GeodesicGeometries} geodesic
     * @returns {MultiPolygon | null}
     */
    generatePolygonGeom(geodesic) {
        if (
            (!geodesic.isDrawing && !geodesic.isPolygon) ||
            (geodesic.isDrawing && this.lineStrNr === 1) ||
            (this.lineStrNr > 1 && this.worldNr !== 0) ||
            this.lineStrNr > 2
        ) {
            /* If polygon should not be filled OR
            the chance for the algorithm to not color the polygon correctly is too high.*/
            return null
        }
        return new MultiPolygon(
            Object.values(this.polygons).map((coords) => {
                const first = coords[0]
                if (this.lineStrNr === 1) {
                    /* The polygon goes through north or south pol. The coloring will be correct as
                    long as the shape is not too complex (no overlapping) */
                    if (coords.length <= 1) return [coords]
                    const last = coords[coords.length - 1]
                    // Drawing at 90deg breaks things, thats why we stop at 89
                    const lat = geographicMath.copysign(89, this.worldNr * geodesic.totalArea)
                    coords.push([last[0], lat], [first[0], lat])
                }
                coords.push(first)
                return [coords]
            })
        ).transform(WGS84, WEBMERCATOR)
    }
}
